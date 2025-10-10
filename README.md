# 🌾 Crop Recommendation System

This project predicts the most suitable crop for a given location using **real-time weather data**, **soil information**, and **gpt api**.

---

## 🚀 Features

- 🌍 **Interactive Map** – Select your farm location or use your current GPS.
- ☁️ **Live Weather Integration** – Fetches real-time temperature, humidity, and rainfall using the WeatherAPI.
- 🧠 **AI Crop Prediction** – GPT api suggests the most suitable crop for that region.
- 💾 **MongoDB Integration** – Stores soil and district data for accurate recommendations.
- 🧭 **Reverse Geocoding** – Automatically detects the district name from your map location.

---

## 🧩 Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- React Leaflet (Map)
- Axios

**Backend:**
- Typescript
- Node.js + Express 
- MongoDB (Mongoose)
- WeatherAPI for live climate data
- GPT api

---

## ⚙️ Setup Instructions

### 1. Clone the repository
git clone https://github.com/akashtyagi03/kisan-sahayak.git

cd kisan-sahayak

### 📦 Install Dependencies
**Backend:**
cd backend

npm install

**frontend:**
cd frontend

npm install  

### 📦 Setup Environment Variables
MONGO_URI=your_mongodb_connection_string

WEATHER_API_KEY=your_weatherapi_key

OPENAI_API_KEY=your_openapi_key

PORT=3000

▶️ Run the Application
## For backend
cd backend

npm run dev

## For frontend
cd ../frontend

npm run dev
