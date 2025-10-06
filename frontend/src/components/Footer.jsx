import React from "react";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-extrabold text-2xl mb-3 text-green-400">
              Kisan Sahayak
            </h3>
            <p className="text-gray-400 text-sm">
              Farming smarter, not harder.  
              Empowering farmers with technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 hover:underline transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-green-400 hover:underline transition"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-green-400 hover:underline transition"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 hover:underline transition"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-400 hover:underline transition"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
            <p className="text-gray-400 mb-4">KisanSahayak@gmail.com</p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-gray-700 rounded-full hover:bg-green-500 transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-700 rounded-full hover:bg-green-500 transition"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-700 rounded-full hover:bg-green-500 transition"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:KisanSahayak@gmail.com"
                className="p-2 bg-gray-700 rounded-full hover:bg-green-500 transition"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="text-green-400">Kisan Sahayak</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
