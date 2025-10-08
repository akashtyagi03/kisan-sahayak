"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var zod_1 = require("zod");
var mongoose_1 = __importDefault(require("mongoose"));
var db_1 = require("./db"); // Assuming db.ts exports these models
var bcrypt_1 = __importDefault(require("bcrypt"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var multer_1 = __importDefault(require("multer"));
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var cors_1 = __importDefault(require("cors"));
var openai_1 = __importDefault(require("openai"));
// --- SETUP ---
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
if (!process.env.OPENAI_API_KEY || !process.env.JWT_SECRET) {
    throw new Error("Required environment variables (OPENAI_API_KEY, JWT_SECRET, WEATHER_API_KEY) are not set!");
}
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- MULTER CONFIG ---
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = 'uploads/';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
var upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
// --- ZOD SCHEMAS ---
var signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    email: zod_1.z.string(),
    password: zod_1.z.string().min(6).max(12),
});
var loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(12),
});
// auth routes
app.post('/api/v1/signup', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a, username, email, password, hashedPassword, response, token, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                result = signupSchema.safeParse(req.body);
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({ error: result.error })];
                }
                _a = result.data, username = _a.username, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                return [4 /*yield*/, db_1.User.create({ username: username, email: email, password: hashedPassword })];
            case 3:
                response = _b.sent();
                token = jsonwebtoken_1.default.sign({ userId: response._id }, process.env.JWT_SECRET);
                res.json({ message: 'User created successfully', token: token });
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                console.error(err_1);
                // Check for duplicate key error
                if (err_1.code === 11000) {
                    return [2 /*return*/, res.status(409).json({ error: "Email already exists." })];
                }
                res.status(500).json({ error: "Internal server error" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/v1/signin', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a, email, password, user, isPasswordValid, token, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                result = loginSchema.safeParse(req.body);
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({ error: result.error })];
                }
                _a = result.data, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, db_1.User.findOne({ email: email })];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ error: "Invalid email or password" })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 3:
                isPasswordValid = _b.sent();
                if (!isPasswordValid) {
                    return [2 /*return*/, res.status(401).json({ error: "Invalid email or password" })];
                }
                token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET);
                res.json({ message: "User signed in successfully", token: token });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _b.sent();
                console.error(err_2);
                res.status(500).json({ error: "Internal server error" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// API ROUTES
app.get("/api/reverse-geocode", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var querySchema, result, _a, lat, lon, response, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                querySchema = zod_1.z.object({ lat: zod_1.z.string(), lon: zod_1.z.string() });
                result = querySchema.safeParse(req.query);
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({ error: "Latitude (lat) and Longitude (lon) are required." })];
                }
                _a = result.data, lat = _a.lat, lon = _a.lon;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.get("https://nominatim.openstreetmap.org/reverse", {
                        params: { lat: lat, lon: lon, format: "json" },
                        headers: { "User-Agent": "Kisan-Sahayak/1.0 (contact@example.com)" }
                    })];
            case 2:
                response = _b.sent();
                res.json(response.data);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error("Reverse geocode error:", error_1);
                res.status(500).json({ error: error_1.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get("/api/v1/crop_prediction", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var querySchema, result, dist, mongooseDoc, districtData, weatherResponse, _a, temperature, humidity, rainfall, prompt_1, completion, content, recommendation, error_2;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                querySchema = zod_1.z.object({ dist: zod_1.z.string().min(1) });
                result = querySchema.safeParse(req.query);
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({ error: "District (dist) query parameter is required." })];
                }
                dist = result.data.dist;
                _f.label = 1;
            case 1:
                _f.trys.push([1, 5, , 6]);
                return [4 /*yield*/, db_1.Data.findOne({
                        District_Name: { $regex: new RegExp("^".concat(dist, "$"), 'i') }
                    })];
            case 2:
                mongooseDoc = _f.sent();
                if (!mongooseDoc) {
                    return [2 /*return*/, res.status(404).json({ error: "No soil data found for district: ".concat(dist) })];
                }
                districtData = mongooseDoc.toObject();
                return [4 /*yield*/, axios_1.default.get("http://api.weatherapi.com/v1/current.json?key=3ad23bda0dec40069df193439251409&q=".concat(dist))];
            case 3:
                weatherResponse = _f.sent();
                _a = ((_b = weatherResponse.data) === null || _b === void 0 ? void 0 : _b.current) || {}, temperature = _a.temp_c, humidity = _a.humidity, rainfall = _a.precip_mm;
                if (humidity === undefined || temperature === undefined || rainfall === undefined) {
                    return [2 /*return*/, res.status(500).json({ error: "Incomplete weather data received." })];
                }
                prompt_1 = "Act as an expert Indian agronomist. The current date is ".concat(new Date().toDateString(), ".\n        A farmer in the ").concat(districtData.District_Name, " district of India needs a crop recommendation.\n        \n        Here is the available data:\n        - Soil Nutrients: N=").concat(districtData.N_Value, ", P=").concat(districtData.P_Value, ", K=").concat(districtData.K_Value, "\n        - Soil pH: ").concat(districtData.pH_Value, "\n        - Real-time Weather: Temperature=").concat(temperature, "\u00B0C, Humidity=").concat(humidity, "%, Rainfall=").concat(rainfall, "mm\n        \n        Considering the current date (which determines the season - Rabi or Kharif) and all the data above,\n        what is the single best crop for this farmer to plant right now?\n        \n        Respond with ONLY a JSON object with a single key: \"crop\".\n        Example: { \"crop\": \"Wheat (Gehu)\" }\n    ");
                return [4 /*yield*/, openai.chat.completions.create({
                        model: "gpt-4.1-mini",
                        messages: [
                            { role: "system", content: "You are an expert agronomist AI that responds only in valid JSON based on the user's requested format." },
                            { role: "user", content: prompt_1 }
                        ],
                        response_format: { type: "json_object" }
                    })];
            case 4:
                completion = _f.sent();
                content = (_e = (_d = (_c = completion.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content;
                if (!content) {
                    return [2 /*return*/, res.status(500).json({ error: "Failed to get a valid response from the AI." })];
                }
                recommendation = JSON.parse(content);
                return [2 /*return*/, res.json(recommendation)];
            case 5:
                error_2 = _f.sent();
                console.error("Error fetching crop prediction:", error_2);
                res.status(500).json({ error: "Server error while fetching crop prediction data" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post('/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var bodySchema, result, query, response, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bodySchema = zod_1.z.object({ query: zod_1.z.string().min(1) });
                result = bodySchema.safeParse(req.body);
                if (!result.success) {
                    return [2 /*return*/, res.status(400).json({ error: "Query is required" })];
                }
                query = result.data.query;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.post('http://localhost:5000/chat', { query: query })];
            case 2:
                response = _a.sent();
                res.json({ answer: response.data.answer });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error('Error communicating with chatbot service:', error_3);
                res.status(500).json({ error: "Failed to get response from chatbot service" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/api/v1/predict-disease-detailed", upload.single('image'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var imageBuffer, base64Image, prompt_2, completion, content, advisoryData, error_4;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, 3, 4]);
                if (!req.file) {
                    return [2 /*return*/, res.status(400).json({ error: "No image file uploaded." })];
                }
                imageBuffer = fs_1.default.readFileSync(req.file.path);
                base64Image = "data:".concat(req.file.mimetype, ";base64,").concat(imageBuffer.toString('base64'));
                prompt_2 = "You are an expert agronomist advising a farmer in India. \n         Analyze the provided crop leaf image, identify the most likely disease, and generate a JSON advisory.\n         The JSON must have these keys: \"disease_name\", \"summary\", \"symptoms\", \"organic_treatment\", \"chemical_treatment\", \"prevention_tips\".\n         Rules: Use Hindi (Devanagari) first, then English translation in parentheses. Summary should be 1 sentence. Symptoms, treatments, and prevention should be arrays of 1-2 short bullet points. Respond only with valid JSON.";
                return [4 /*yield*/, openai.chat.completions.create({
                        model: "gpt-4.1-mini",
                        messages: [
                            { role: "system", content: "You are an expert agronomist AI that responds only in valid JSON." },
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: prompt_2 },
                                    { type: "image_url", image_url: { url: base64Image } }
                                ]
                            }
                        ],
                        response_format: { type: "json_object" }
                    })];
            case 1:
                completion = _d.sent();
                content = (_c = (_b = (_a = completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                if (!content) {
                    return [2 /*return*/, res.status(500).json({ error: "Failed to get a valid response from the AI." })];
                }
                advisoryData = JSON.parse(content);
                res.json({ advisory: advisoryData });
                return [3 /*break*/, 4];
            case 2:
                error_4 = _d.sent();
                console.error("Error in disease prediction:", error_4);
                res.status(500).json({ error: "Failed to generate advisory." });
                return [3 /*break*/, 4];
            case 3:
                // Clean up the uploaded file
                if (req.file && fs_1.default.existsSync(req.file.path)) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}); });
// SERVER STARTUP 
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!process.env.MONGODB_URL) {
                        throw new Error("MONGODB_URL is not defined");
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_URL)];
                case 2:
                    _a.sent();
                    console.log("Connected to MongoDB");
                    app.listen(PORT, function () {
                        console.log("Server is running on http://localhost:".concat(PORT));
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error("Failed to connect to MongoDB", error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map