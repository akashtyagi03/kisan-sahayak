// src/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, SendHorizonal, LoaderCircle, Mic, Volume2, VolumeX } from 'lucide-react';

const getBotResponse = (userInput) => {
    const text = userInput.toLowerCase();
    if (text.includes('hello') || text.includes('hi')) {
        return 'Hello! How can I assist you with your farming needs today? You can ask me about fertilizers, irrigation, or crop diseases.';
    }
    if (text.includes('fertilizer')) {
        return 'For better yield, a balanced N-P-K (Nitrogen, Phosphorus, Potassium) fertilizer is recommended. The exact ratio depends on your soil test results and the crop you are growing.';
    }
    if (text.includes('irrigation') || text.includes('water')) {
        return 'Drip irrigation is highly efficient for most crops as it minimizes water evaporation and delivers water directly to the plant roots. Watering in the early morning is ideal.';
    }
    if (text.includes('disease') || text.includes('pest')) {
        return 'Early detection is key. You can use our "Disease Prediction" tool by uploading a photo of the leaf. Common organic pesticides include neem oil spray.';
    }
    if (text.includes('thank')) {
        return 'You\'re welcome! Is there anything else I can help you with?';
    }
    return "I'm sorry, I'm not sure how to answer that yet. Try asking about fertilizers, irrigation, or pests.";
};
// API endpoint for the chatbot backend
const CHATBOT_API_URL = "http://localhost:3000/chat";


export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! How can I help you with your farm today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);

    // --- Voice Synthesis (Text-to-Speech) ---
    const speak = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    // --- Voice Recognition (Speech-to-Text) ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition is not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setInputValue(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleToggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    // Function to scroll to the bottom of the messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- MODIFIED: Send message to backend API ---
    const handleSendMessage = async () => {
        if (inputValue.trim() === '') return;
        window.speechSynthesis.cancel();

        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        const currentInput = inputValue; // Capture current input before clearing
        setInputValue('');
        setIsLoading(true);

        try {
            console.log("Sending to chatbot API:", currentInput);
            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: currentInput }), // Use the captured input
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponseText = data.answer || "Sorry, I couldn't get a response.";
            
            const botMessage = { sender: 'bot', text: botResponseText };
            setMessages(prevMessages => [...prevMessages, botMessage]);
            speak(botResponseText);

        } catch (error) {
            console.error("Failed to fetch from chatbot API:", error);
            const errorMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chatbot Popup Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 w-80 md:w-96 h-[60vh] bg-white rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-4 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">AgriBot Assistant</h3>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsMuted(!isMuted)} className="hover:opacity-75">
                                 {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                            </button>
                            <button onClick={() => { setIsOpen(false); window.speechSynthesis.cancel(); }} className="hover:opacity-75">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="flex flex-col space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-2xl max-w-xs ${msg.sender === 'user'
                                                ? 'bg-green-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none p-2">
                                        <LoaderCircle className="animate-spin h-5 w-5" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 flex items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isListening ? "Listening..." : "Ask a question..."}
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isListening || isLoading}
                        />
                        <button 
                            onClick={handleToggleListening} 
                            className={`ml-2 p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            disabled={isLoading}
                        >
                            <Mic size={20} />
                        </button>
                        <button 
                            onClick={handleSendMessage} 
                            className="ml-2 bg-green-600 text-white p-3 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <SendHorizonal size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Chatbot Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-green-600 text-white h-16 w-16 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Open chatbot"
            >
                {isOpen ? <X size={32} /> : <Bot size={32} />}
            </button>
        </>
    );
};