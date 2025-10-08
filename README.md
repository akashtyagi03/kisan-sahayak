Kisan-Sahayak - AI Farming Assistant 🌾

Kisan-Sahayak is a modern, AI-powered web application designed to support Indian farmers by providing them with the data and tools needed to make informed decisions. This project aims to bridge the technology gap in agriculture by offering a suite of intelligent features on a simple and accessible platform.

This project was developed as a part of the Smart India Hackathon (SIH).

✨ Key Features
This application provides four core modules to assist farmers:

🤖 AI Crop Recommendation:

Leverages real-time weather data and location-specific soil nutrient data (N, P, K, pH).

Uses a Large Language Model (GPT-4) to provide the top 3 most suitable and profitable crop recommendations for the current season, complete with justifications.

🌿 AI Disease Detection:

Upload an image of a crop leaf and receive an instant diagnosis.

The AI identifies the disease and provides a detailed advisory in both Hindi and English, including symptoms, organic/chemical treatments, and prevention tips.

💬 Farmer Chatbot:

An interactive chatbot (powered by a Python backend) trained to answer a wide range of agricultural questions.

☀️ Weather Alerts:

Provides real-time weather updates and forecasts based on the farmer's location to help them plan their activities.

🛠️ Tech Stack
This project is built with a modern MERN-stack architecture.

Frontend
React: For building the user interface.

Vite: As a fast build tool.

Tailwind CSS: For styling.

Axios: For making API requests.

Backend
Node.js & Express.js: For the core server logic.

TypeScript: For type safety and robust code.

MongoDB: As the database for storing user and soil data.

Mongoose: For interacting with MongoDB.

OpenAI API (GPT-4): Powers the crop recommendation and disease detection features.

JWT (JSON Web Tokens): For secure user authentication.

Multer: For handling image uploads.

Zod: For data validation.

🚀 Getting Started
To get a local copy up and running, please follow these simple steps.

Prerequisites
Node.js and npm

MongoDB account

API keys for OpenAI and WeatherAPI

Installation
Clone the repo

git clone [https://github.com/akashtyagi03/kisan-sahayak.git](https://github.com/akashtyagi03/kisan-sahayak.git)

Install NPM packages for both frontend and backend directories.

Create a .env file in the backend directory and add the required API keys.

Run the development server.
