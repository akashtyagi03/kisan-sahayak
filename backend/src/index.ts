import 'dotenv/config';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { User, Data } from './db'; // Assuming db.ts exports these models
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import OpenAI from "openai";
import { authMiddleware } from './middleware';

// --- SETUP ---
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY || !process.env.JWT_SECRET ) {
    throw new Error("Required environment variables (OPENAI_API_KEY, JWT_SECRET, WEATHER_API_KEY) are not set!");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// --- ZOD SCHEMAS ---
const signupSchema = z.object({
    username: z.string().min(1),
    email: z.string(),
    password: z.string().min(6).max(12),
});
type SignupBody = z.infer<typeof signupSchema>;

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(12),
});
type loginBody = z.infer<typeof loginSchema>;

// auth routes
app.post('/api/v1/signup', async (req: Request, res: Response) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }
    const { username, email, password }: SignupBody = result.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await User.create({ username, email, password: hashedPassword });
        const token = jwt.sign({ userId: response._id }, process.env.JWT_SECRET as string);
        res.json({ message: 'User created successfully', token });
    } catch (err) {
        console.error(err);
        // Check for duplicate key error
        if ((err as any).code === 11000) {
            return res.status(409).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/v1/signin', async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error });
    }
    const { email, password }: loginBody = result.data;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string);
        res.json({ message: "User signed in successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// API ROUTES
app.get("/api/v1/reverse-geocode", authMiddleware, async (req: Request, res: Response) => {
    const querySchema = z.object({ lat: z.string(), lon: z.string() });
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({ error: "Latitude (lat) and Longitude (lon) are required." });
    }
    const { lat, lon } = result.data;

    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: { lat, lon, format: "json" },
            headers: { "User-Agent": "Kisan-Sahayak/1.0 (contact@example.com)" }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Reverse geocode error:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});

app.get("/api/v1/crop_prediction", authMiddleware, async (req: Request, res: Response) => {
    const querySchema = z.object({ dist: z.string().min(1) });
    const result = querySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({ error: "District (dist) query parameter is required." });
    }
    const { dist } = result.data;

    try {
        const mongooseDoc = await Data.findOne({
            District_Name: { $regex: new RegExp(`^${dist}$`, 'i') }
        });
        if (!mongooseDoc) {
            return res.status(404).json({ error: `No soil data found for district: ${dist}` });
        }
        const districtData = mongooseDoc.toObject();

        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=3ad23bda0dec40069df193439251409&q=${dist}`);
        const { temp_c: temperature, humidity, precip_mm: rainfall } = weatherResponse.data?.current || {};
        if (humidity === undefined || temperature === undefined || rainfall === undefined) {
            return res.status(500).json({ error: "Incomplete weather data received." });
        }
        const prompt = `
        Act as an expert Indian agronomist providing advice for the date: ${new Date().toDateString()}.
        A farmer in the ${districtData.District_Name} district of India needs crop recommendations.
        
        Here is the detailed farm data:
        - Soil Nutrients: N=${districtData.N_Value}, P=${districtData.P_Value}, K=${districtData.K_Value}
        - Soil pH: ${districtData.pH_Value}
        - Soil Type: Alluvial Soil (Typical for this region)
        - Real-time Weather: Temperature=${temperature}°C, Humidity=${humidity}%, Rainfall=${rainfall}mm
        - Previous Crop Grown: Not specified. Please consider crop rotation.
        
        Based on all this data, provide the top 3 most suitable and profitable crops for the farmer to plant right now for the upcoming season (Rabi/Kharif).
        
        Respond with ONLY a valid JSON object. The object must have a single key "recommendations", which is an array of objects.
        Each object in the array must have two keys: "crop_name" and "justification".
        
        Example format:
        {
          "recommendations": [
            {
              "crop_name": "Crop 1 (Hindi Name)",
              "justification": "Brief reason why this crop is a good choice based on the data."
            },
            {
              "crop_name": "Crop 2 (Hindi Name)",
              "justification": "Another brief reason."
            }
          ]
        }
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { role: "system", content: "You are an expert agronomist AI that responds only in valid JSON based on the user's requested format." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        // FIXED: Safely access the API response
        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
            return res.status(500).json({ error: "Failed to get a valid response from the AI." });
        }

        const recommendation = JSON.parse(content);
        return res.json(recommendation);

    } catch (error) {
        console.error("Error fetching crop prediction:", error);
        res.status(500).json({ error: "Server error while fetching crop prediction data" });
    }
});

// app.post('/cha', async (req: Request, res: Response) => {
//     const bodySchema = z.object({ query: z.string().min(1) });
//     const result = bodySchema.safeParse(req.body);
//     if (!result.success) {
//         return res.status(400).json({ error: "Query is required" });
//     }
//     const { query } = result.data;

//     try {
//         // Assuming your Python service is running on localhost:5000
//         const response = await axios.post('http://localhost:5000/chat', { query });
//         res.json({ answer: response.data.answer });
//     } catch (error) {
//         console.error('Error communicating with chatbot service:', error);
//         res.status(500).json({ error: "Failed to get response from chatbot service" });
//     }
// });

app.post("/api/v1/predict-disease-detailed", authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

        const prompt = `You are an expert agronomist advising a farmer in India. 
         Analyze the provided crop leaf image, identify the most likely disease, and generate a JSON advisory.
         The JSON must have these keys: "disease_name", "summary", "symptoms", "organic_treatment", "chemical_treatment", "prevention_tips".
         Rules: Use Hindi (Devanagari) first, then English translation in parentheses. Summary should be 1 sentence. Symptoms, treatments, and prevention should be arrays of 1-2 short bullet points. Respond only with valid JSON.`;

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

        // FIXED: Safely access the API response
        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
            return res.status(500).json({ error: "Failed to get a valid response from the AI." });
        }

        const advisoryData = JSON.parse(content);
        res.json({ advisory: advisoryData });
    } catch (error) {
        console.error("Error in disease prediction:", error);
        res.status(500).json({ error: "Failed to generate advisory." });
    } finally {
        // Clean up the uploaded file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

// SERVER STARTUP 
async function main() {
    if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL is not defined");
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}

main();

