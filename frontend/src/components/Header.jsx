import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, UserCircle, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);

    // Check login status on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // Handle clicks outside the profile dropdown to close it
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileRef]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setIsProfileOpen(false);
        navigate('/login');
    };

    const navLinks = ["Features", "About", "Contact"];

    return (
        <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-white/90 via-green-50/80 to-white/90 backdrop-blur-md shadow-md z-50">
            <div className="container mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <Sprout className="h-8 w-8 text-green-600 mr-2" />
                        <h1 className="text-2xl font-extrabold text-gray-800">
                            Kisan <span className="text-green-600">Sahayak</span>
                        </h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {navLinks.map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="relative text-gray-700 hover:text-green-600 font-medium transition-colors group">
                                {item}
                                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                        <div className="w-px h-6 bg-gray-200"></div> {/* Divider */}
                        {isLoggedIn ? (
                            <div className="relative" ref={profileRef}>
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="rounded-full hover:bg-gray-200 p-2 transition">
                                    <UserCircle className="h-7 w-7 text-gray-600" />
                                </button>
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                                        <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-green-600 transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Button */}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700">
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden mt-4 bg-white rounded-lg shadow-md p-4 space-y-4">
                        {navLinks.map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="block text-gray-700 hover:text-green-600 font-medium">
                                {item}
                            </a>
                        ))}
                        <hr />
                        {isLoggedIn ? (
                             <button onClick={handleLogout} className="flex items-center w-full text-left text-gray-700 hover:text-green-600 font-medium">
                                <LogOut className="mr-2 h-5 w-5" />
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="block text-gray-700 hover:text-green-600 font-medium">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="block text-center px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
