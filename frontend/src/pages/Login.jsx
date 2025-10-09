import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, LoaderCircle, AlertCircle, CheckCircle } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Check for a success message passed from the signup page
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
            // Clear the location state to prevent the message from showing again on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError("Please fill in all fields.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/v1/signin', {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            // On successful login, navigate to the main landing page
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Invalid email or password. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {successMessage && (
                    <div className="flex items-center text-green-700 bg-green-50 p-4 rounded-lg mb-6">
                        <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                        <p className="font-semibold">{successMessage}</p>
                    </div>
                )}
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Welcome Back!</h2>
                <p className="text-gray-500 text-center mb-6">Sign in to access your account.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>
                    {error && (
                        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center"
                    >
                        {isLoading ? <LoaderCircle className="animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Sign In</>}
                    </button>
                </form>
                <p className="text-center text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/" className="font-semibold text-green-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

