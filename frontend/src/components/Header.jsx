import { Sprout } from "lucide-react";
import React, { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-white/90 via-green-50/80 to-white/90 backdrop-blur-md shadow-md z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Sprout className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-2xl font-extrabold text-gray-800">
              Kisan <span className="text-green-600">Sahayak</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {["Features", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-gray-700 hover:text-green-600 font-medium transition-colors group"
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Mobile Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700"
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-x"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-menu"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-md p-4 space-y-4">
            {["Features", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-gray-700 hover:text-green-600 font-medium"
              >
                {item}
              </a>
            ))}
            <a
              href="#get-started"
              className="block text-center px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
