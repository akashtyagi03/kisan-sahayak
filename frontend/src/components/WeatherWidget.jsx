import React, { useState, useEffect } from "react";
import { CloudRain, Thermometer, Droplets, Search, Wind } from "lucide-react";
import axios from "axios";

// This is a self-contained Weather Widget component.￼

export default function WeatherWidget() {
  const [location, setLocation] = useState("Meerut");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputLocation, setInputLocation] = useState("Meerut");

  // Fetches weather data from the WeatherAPI for a given district.
  const fetchWeather = async (district) => {
    if (!district) {
      setError("Please enter a location.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=3ad23bda0dec40069df193439251409&q=${district}`
      );
      setWeather(res.data); 
    } catch (err) {
      setError(`Failed to load weather data for "${district}". Please check the spelling or try another location.`);
    } finally {
      setLoading(false);
    }
  };

  // This useEffect hook runs on the initial render and whenever the `location` state changes.
  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the default form submission behavior (page reload).
    if (inputLocation.trim() !== "") {
      setLocation(inputLocation);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 transition w-full max-w-sm mx-auto font-sans">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={inputLocation}
          onChange={(e) => setInputLocation(e.target.value)}
          placeholder="Enter a city or zip code..."
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </form>

      {/* Conditional Rendering Logic for Loading, Error, and Weather Data */}
      {loading && <div className="text-gray-500 text-center py-8">Loading weather...</div>}
      
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</div>}
      
      {weather && !loading && !error && (
        <div className="text-center animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {weather.location?.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {weather.location?.region}, {weather.location?.country}
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            {weather.current?.condition?.icon && (
              <img 
                src={`https:${weather.current.condition.icon}`} 
                alt={weather.current.condition.text} 
                className="w-16 h-16" 
              />
            )}
            <p className="text-lg font-semibold text-gray-700">{weather.current?.condition?.text}</p>
          </div>

          <div className="space-y-3 text-gray-700 text-left">
            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
              <span className="flex items-center gap-2 font-medium">
                <Thermometer className="h-5 w-5 text-red-500" /> Temperature
              </span>
              <span className="font-bold text-lg">{weather.current?.temp_c}°C</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
              <span className="flex items-center gap-2 font-medium">
                <Droplets className="h-5 w-5 text-blue-500" /> Humidity
              </span>
              <span className="font-bold text-lg">{weather.current?.humidity}%</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
              <span className="flex items-center gap-2 font-medium">
                <CloudRain className="h-5 w-5 text-cyan-500" /> Precipitation
              </span>
              <span className="font-bold text-lg">{weather.current?.precip_mm} mm</span>
            </div>
             <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
              <span className="flex items-center gap-2 font-medium">
                <Wind className="h-5 w-5 text-gray-500" /> Wind Speed
              </span>
              <span className="font-bold text-lg">{weather.current?.wind_kph} kph</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}