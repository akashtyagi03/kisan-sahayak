import { motion } from "framer-motion";  // ✅ Move it here
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Leaf, BrainCircuit, Bot, Sprout, ShieldCheck, TrendingUp, MapPin, Search, LoaderCircle } from 'lucide-react';
import Footer from './Footer';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Prediction } from './disease_pridiction';
import { CropPrediction } from './Crop';
import Header from './Header';
import { Chatbot } from './ChatBot';
import WeatherWidget from "./WeatherWidget";
// This code ensures that the marker icon images are loaded correctly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});
const Benefit = ({ icon, title, description }) => (
    <div className="text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </div>
);

function LocationPicker({ onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null;
}

const MarketRateCard = ({ market, state, minPrice, maxPrice, modalPrice }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-green-500 transition-all duration-300">
        <h4 className="text-xl font-bold text-green-800">{market}</h4>
        <p className="text-sm text-gray-500 mb-4">{state}</p>
        <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
                <span>Min Price:</span>
                <span className="font-semibold">₹ {minPrice} / Quintal</span>
            </div>
            <div className="flex justify-between">
                <span>Max Price:</span>
                <span className="font-semibold">₹ {maxPrice} / Quintal</span>
            </div>
            <div className="flex justify-between text-green-700">
                <span className="font-bold">Avg Price:</span>
                <span className="font-bold text-lg">₹ {modalPrice} / Quintal</span>
            </div>
        </div>
    </div>
);

export default function Landing() {
    const [activeTab, setActiveTab] = useState('recommendation');
    const [searchQuery, setSearchQuery] = useState('');
    const [marketData, setMarketData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [location, setLocation] = useState(null);


    // In a real app, this would be a fetch() call to your backend.
    const getMockMarketData = (cropName) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (cropName.toLowerCase() === 'error') {
                    reject('Failed to fetch data. Please try again.');
                }
                // Dummy data for demonstration
                const mockData = {
                    wheat: [
                        { market: 'Meerut Mandi', state: 'Uttar Pradesh', minPrice: 2100, maxPrice: 2250, modalPrice: 2180 },
                        { market: 'Saharanpur Mandi', state: 'Uttar Pradesh', minPrice: 2080, maxPrice: 2200, modalPrice: 2150 },
                        { market: 'Ludhiana Mandi', state: 'Punjab', minPrice: 2150, maxPrice: 2300, modalPrice: 2220 },
                        { market: 'Amritsar Mandi', state: 'Punjab', minPrice: 2120, maxPrice: 2280, modalPrice: 2200 },
                    ],
                    rice: [
                        { market: 'Gorakhpur Mandi', state: 'Uttar Pradesh', minPrice: 3100, maxPrice: 3300, modalPrice: 3220 },
                        { market: 'Varanasi Mandi', state: 'Uttar Pradesh', minPrice: 3050, maxPrice: 3250, modalPrice: 3150 },
                        { market: 'Patiala Mandi', state: 'Punjab', minPrice: 3180, maxPrice: 3380, modalPrice: 3270 },
                        { market: 'Amritsar Mandi', state: 'Punjab', minPrice: 3200, maxPrice: 3400, modalPrice: 3300 },
                    ],
                    sugarcane: [
                        { market: 'Muzaffarnagar Mandi', state: 'Uttar Pradesh', minPrice: 340, maxPrice: 360, modalPrice: 350 },
                        { market: 'Lucknow Mandi', state: 'Uttar Pradesh', minPrice: 330, maxPrice: 345, modalPrice: 338 },
                        { market: 'Gurdaspur Mandi', state: 'Punjab', minPrice: 325, maxPrice: 340, modalPrice: 333 },
                    ],
                    maize: [
                        { market: 'Varanasi Mandi', state: 'Uttar Pradesh', minPrice: 1700, maxPrice: 1850, modalPrice: 1780 },
                        { market: 'Gorakhpur Mandi', state: 'Uttar Pradesh', minPrice: 1650, maxPrice: 1800, modalPrice: 1725 },
                        { market: 'Amritsar Mandi', state: 'Punjab', minPrice: 1680, maxPrice: 1820, modalPrice: 1750 },
                    ],

                    // === Pulses split ===
                    chana: [
                        { market: 'Kanpur Mandi', state: 'Uttar Pradesh', minPrice: 5200, maxPrice: 5500, modalPrice: 5350 },
                        { market: 'Lucknow Mandi', state: 'Uttar Pradesh', minPrice: 5250, maxPrice: 5550, modalPrice: 5400 },
                        { market: 'Amritsar Mandi', state: 'Punjab', minPrice: 5300, maxPrice: 5600, modalPrice: 5450 },
                    ],
                    masoor: [
                        { market: 'Varanasi Mandi', state: 'Uttar Pradesh', minPrice: 5600, maxPrice: 5850, modalPrice: 5720 },
                        { market: 'Ludhiana Mandi', state: 'Punjab', minPrice: 5550, maxPrice: 5800, modalPrice: 5675 },
                    ],
                    arhar: [
                        { market: 'Gorakhpur Mandi', state: 'Uttar Pradesh', minPrice: 6500, maxPrice: 6800, modalPrice: 6650 },
                        { market: 'Amritsar Mandi', state: 'Punjab', minPrice: 6400, maxPrice: 6700, modalPrice: 6550 },
                    ],
                    moong: [
                        { market: 'Lucknow Mandi', state: 'Uttar Pradesh', minPrice: 7200, maxPrice: 7500, modalPrice: 7350 },
                        { market: 'Jalandhar Mandi', state: 'Punjab', minPrice: 7100, maxPrice: 7400, modalPrice: 7250 },
                    ],
                    urad: [
                        { market: 'Kanpur Mandi', state: 'Uttar Pradesh', minPrice: 6800, maxPrice: 7100, modalPrice: 6950 },
                        { market: 'Amritsar Mandi', state: 'Punjab', minPrice: 6700, maxPrice: 7000, modalPrice: 6850 },
                    ],
                };

                resolve(mockData[cropName.toLowerCase()] || []);
            }, 1500); // Simulate 1.5 second network delay
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsLoading(true);
        setError(null);
        setMarketData([]);

        try {
            const data = await getMockMarketData(searchQuery);
            setMarketData(data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 font-sans antialiased text-gray-900">
            {/* Header */}
            <Header />

            <main>
                {/* Hero Section */}

                <section
                    className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>

                    <div className="relative z-10 text-center text-white px-6">
                        <motion.h2
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
                        >
                            Revolutionize Your Farming with{" "}
                            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                                AI
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-gray-200"
                        >
                            Get intelligent crop recommendations and instantly detect plant
                            diseases to boost your yield and secure your harvest.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.6 }}
                        >
                            <a
                                href="#features"
                                className="px-8 py-4 text-lg font-semibold rounded-full bg-green-600 hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/40"
                            >
                                🚀 Get Started
                            </a>
                        </motion.div>
                    </div>
                </section>


                {/* Core Functionality Section */}
                <section id="features" className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Your Smart Farming Toolkit</h2>
                            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                                Leverage the power of AI to make informed decisions for your farm. Upload an image of a plant leaf or enter your field data to get started.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('recommendation')}
                                    className={`flex-1 p-4 text-center font-semibold transition-colors duration-300 ${activeTab === 'recommendation' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}`}
                                >
                                    <BrainCircuit className="inline-block mr-2 h-5 w-5" /> Crop Recommendation
                                </button>
                                <button
                                    onClick={() => setActiveTab('prediction')}
                                    className={`flex-1 p-4 text-center font-semibold transition-colors duration-300 ${activeTab === 'prediction' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}`}
                                >
                                    <Leaf className="inline-block mr-2 h-5 w-5" /> Disease Prediction
                                </button>
                            </div>

                            <div className="p-8 md:p-12">
                                {activeTab === 'recommendation' && (<CropPrediction  location={location} setLocation={setLocation}/>)}

                                {activeTab === 'prediction' && <Prediction />}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Weather Section ===== */}
                <section id="weather" className="py-20 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                            🌦️ Real-Time Weather Updates
                        </h2>
                        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                            Stay informed with the latest weather insights tailored for your farming location.
                        </p>

                        <div className="max-w-lg mx-auto">
                        <WeatherWidget location={location} setLocation={setLocation}  />
                        </div>
                    </div>
                </section>

                {/* ===== BEAUTIFIED MARKET RATE SECTION ===== */}
                <section id="market-rates" className="py-20 bg-gradient-to-b from-green-50 to-white relative">
                    <div className="container mx-auto px-6">
                        {/* Heading */}
                        <div className="text-center mb-12 max-w-3xl mx-auto">
                            <span className="inline-block px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-full mb-4">
                                🌾 Current Updates
                            </span>
                            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-700 via-green-500 to-emerald-600 text-transparent bg-clip-text">
                                Agricultural Market Prices
                            </h2>
                            <p className="text-gray-600 mt-4 text-lg">
                                Search for your crop and explore the latest mandi prices across India.
                            </p>

                            {/* Search Input */}
                            <form onSubmit={handleSearch} className="mt-8 flex justify-center max-w-2xl mx-auto">
                                <div className="relative w-full">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                        <Sprout className="h-5 w-5" />
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Enter crop name... (e.g., Wheat, Rice, Sugarcane)"
                                        className="w-full pl-10 pr-20 py-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition disabled:bg-gray-400 flex items-center gap-2"
                                    >
                                        {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                                        <span className="hidden md:inline">Search</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Results */}
                        <div className="mt-12">
                            {isLoading && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg max-w-md mx-auto">
                                    ⚠️ {error}
                                </div>
                            )}

                            {!isLoading && !error && marketData.length > 0 && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {marketData.map((data, index) => (
                                        <div
                                            key={index}
                                            className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-2xl hover:scale-[1.02] hover:border-green-500 transition-all duration-300"
                                        >
                                            <h4 className="text-2xl font-bold text-green-800">{data.market}</h4>
                                            <p className="text-sm text-gray-500 mb-4">{data.state}</p>
                                            <div className="space-y-2 text-gray-700">
                                                <div className="flex justify-between">
                                                    <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-gray-400" /> Min Price:</span>
                                                    <span className="font-semibold">₹ {data.minPrice} / Quintal</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-gray-400" /> Max Price:</span>
                                                    <span className="font-semibold">₹ {data.maxPrice} / Quintal</span>
                                                </div>
                                                <div className="flex justify-between text-green-700">
                                                    <span className="flex items-center gap-2 font-bold"><Leaf className="h-4 w-4" /> Avg Price:</span>
                                                    <span className="font-bold text-lg">₹ {data.modalPrice} / Quintal</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isLoading && !error && marketData.length === 0 && (
                                <div className="text-center text-gray-500 mt-8">
                                    <p className="text-lg">🔍 Search for a crop above to see Current mandi prices.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section id="about" className="py-20 bg-gradient-to-r from-green-50 via-white to-green-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                                The Future of Farming is <span className="text-green-600">Here</span>
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                We combine cutting-edge technology with agricultural science to empower farmers everywhere.
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-8 text-center transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out">
                                <div className="flex justify-center items-center w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 text-green-600">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Boost Your Yield</h3>
                                <p className="text-gray-600">Make data-driven decisions that lead to healthier crops and significantly higher returns.</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-8 text-center transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out">
                                <div className="flex justify-center items-center w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 text-blue-600">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Early Disease Detection</h3>
                                <p className="text-gray-600">Catch problems early to prevent crop loss and reduce the need for widespread pesticide use.</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-8 text-center transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out">
                                <div className="flex justify-center items-center w-16 h-16 mx-auto mb-6 rounded-full bg-purple-100 text-purple-600">
                                    <Bot size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">AI-Powered Precision</h3>
                                <p className="text-gray-600">Our smart algorithms provide insights tailored to your farm's unique conditions.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />

            <Chatbot /> {/* Add the Chatbot component here */}
        </div>
    );
}