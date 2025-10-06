require('dotenv').config();
const express = require('express');
const z = require('zod');
const { default: mongoose } = require('mongoose');
const { User, Data } = require('./db');
const app = express();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

app.post('/api/v1/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // define zod schema for validation
    const signupzod = z.object({
        username: z.string(),
        email: z.string(),
        password: z.string().min(6).max(12),
    })
    const validate = signupzod.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error });
    }

    // creating user in db.
    try {
        // here we use bcrypt for hashing password
        const hashpassword = await bcrypt.hash(password, 5)
        await User.create({ username, email, password: hashpassword })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal server error" })
    }
    res.json({
        massage: 'User created succesfully',
    });
});

app.post('/api/v1/signin', async (req, res) => {
    const { email, password } = req.body

    // creaing zod schema for validation
    const signinzod = z.object({
        email: z.string(),
        password: z.string().min(6).max(12),
    })
    const validate = signinzod.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ error: validate.error })
    }

    // checking that user exist in db or not 
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        res.json({
            massage: "User signin successfully",
            token
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal server error" });
    }
})

app.get("/api/reverse-geocode", async (req, res) => {
    try {
        const { lat, lon } = req.query;
        console.log(req.query)
        const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: { lat, lon, format: "json" },
            headers: { "User-Agent": "my-app/1.0 (myemail@example.com)" }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/v1/crop_prediction", async (req, res) => {
    try {
        let dist = req.query.dist;
        dist = dist.trim();
        const mongooseDoc = await Data.findOne({
            District_Name: { $regex: new RegExp(`^${dist}$`, 'i') }
        });

        if (!mongooseDoc) {
            return res.status(404).json({ error: `No data found for district: ${dist}` });
        }
        const districtData = mongooseDoc.toObject();
        // console.log("Plain data object:", districtData);
        // console.log("Kharif Defaults:", districtData.Kharif_Defaults);
        const weatherResponse = await axios.get(
            `http://api.weatherapi.com/v1/current.json?key=3ad23bda0dec40069df193439251409&q=${dist}`
        );
        const { temp_c: temperature, humidity, precip_mm: rainfall } = weatherResponse.data?.current || {};
        if (humidity === undefined || temperature === undefined || rainfall === undefined) {
            return res.status(500).json({ error: "Incomplete weather data received." });
        }

        const prompt = `Act as an expert Indian agronomist. The current date is ${new Date().toDateString()}.
        A farmer in the ${districtData.District_Name} district of India needs a crop recommendation.
        
        Here is the available data:
        - Soil Nutrients: N=${districtData.N_Value}, P=${districtData.P_Value}, K=${districtData.K_Value}
        - Soil pH: ${districtData.pH_Value}
        - Real-time Weather: Temperature=${temperature}°C, Humidity=${humidity}%, Rainfall=${rainfall}mm
        
        Considering the current date (which determines the season - Rabi or Kharif) and all the data above,
        what is the single best crop for this farmer to plant right now?
        
        Respond with ONLY a JSON object with a single key: "crop".
        Example: { "crop": "Wheat (Gehu)" }
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini", 
            messages: [
                { role: "system", content: "You are an expert agronomist AI that responds only in valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" } 
        });
        const recommendation = JSON.parse(completion.choices[0].message.content);
        console.log(recommendation)
        return res.json(recommendation);
    } catch (error) {
        console.error("Error fetching crop prediction:", error.message);
        res.status(500).json({ error: "Server error while fetching crop prediction data" });
    }
});

app.post('/chat', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }
    try {
        const response = await axios.post('http://localhost:5000/chat', { query });
        console.log(response)
        res.json({ answer: response.data.answer });
    } catch (error) {
        console.error('Error communicating with chatbot service:', error.message);
        res.status(500).json({ error: "Failed to get response from chatbot service" });
    }
});

app.post("/api/v1/predict-disease-detailed", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }
        // --- Step 1: Encode the image in base64 ---
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

        // --- Step 2: Ask GPT directly to detect disease & give advisory ---
        const prompt = `You are an expert agronomist advising a farmer in India. 
         Analyze the provided crop leaf image, identify the most likely disease, and generate a JSON advisory.
         
         The JSON must have these keys:
         - "disease_name"
         - "summary"
         - "symptoms"
         - "organic_treatment"
         - "chemical_treatment"
         - "prevention_tips"
         
         Rules:
         - Use Hindi (Devanagari) first, then English translation in parentheses.
         - Summary should be 1 sentence.
         - Symptoms, treatments, and prevention should be arrays of 1-2 short bullet points.
         - Respond only with valid JSON.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { role: "system", content: "You are an expert agronomist AI that responds only in valid JSON." },
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: base64Image } }
                    ]
                }
            ],
            response_format: { type: "json_object" }
        });

        const advisoryData = JSON.parse(completion.choices[0].message.content);
        res.json({ advisory: advisoryData });
    } catch (error) {
        console.error("Error in disease prediction:", error.message);
        res.status(500).json({ error: "Failed to generate advisory." });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

async function main() {
    if (process.env.MONGODB_URL === undefined) {
        throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("connect");
    });
    app.listen(PORT, () => {
        console.log("Server is running on port 3000");
    });
}
main()
