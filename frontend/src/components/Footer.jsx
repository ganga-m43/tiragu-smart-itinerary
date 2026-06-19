import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaPhone, FaEnvelope } from "react-icons/fa";
import Home from "../pages/Home";

const Footer = () => {
    const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  return (
    <footer className="bg-gray-900 text-gray-300 bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Navigation Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="hover:text-white transition-colors duration-200"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  to="/stories"
                  className="hover:text-white transition-colors duration-200"
                >
                  Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="hover:text-white transition-colors duration-200"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  to="/hidden-gems"
                  className="hover:text-white transition-colors duration-200"
                >
                  Hidden Gems
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FaPhone className="text-blue-400" />
                <a
                  href="tel:+917975773432"
                  className="hover:text-white transition-colors duration-200"
                >
                  +91 7975773432
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-400" />
                <a
                  href="mailto:krishnakulkarni133@gmail.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  krishnakulkarni133@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Follow Me
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/krishna.01_28?igsh=MW0xcHl6NmM3eXAwMw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-pink-500 transition-colors duration-200"
              >
                <FaInstagram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-blue-400 transition-colors duration-200"
              >
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* Brand / Tagline */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-4">Tiragu</h3>
            <p className="text-gray-400 leading-relaxed">
              Explore. Share. Inspire.
            </p>
            <p className="text-gray-400 mt-4 text-sm">
              Discover stories, not just places. Your journey starts here.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Tiragu. Explore. Share. Inspire.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;