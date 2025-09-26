import React, { useState } from "react";
import logo from "../assets/logo-andf.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        {/* <h1 className="text-2xl font-bold text-green-600">Foncier Intelligent</h1> */}
        <a href="/">
          <img className="h-12" src={logo} alt="" />
        </a>
        

        {/* Menu Desktop */}
        <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
          <li><a href="/#features" className="hover:text-green-600">Fonctionnalités</a></li>
          <li><a href="/#story" className="hover:text-green-600">Scénario</a></li>
          {/* <li><a href="/#team" className="hover:text-green-600">Équipe</a></li> */}
          <li><a href="/#contact" className="hover:text-green-600">Contact</a></li>
          <li><a href="/chat" className="hover:text-green-600">Chatbot IA</a></li>
        </ul>

        {/* Bouton Demo Desktop */}
        <div className="hidden md:block">
          <a href="/start" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Démarrer
          </a>
        </div>

        {/* Hamburger Mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            <svg
              className="w-7 h-7 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <div
        className={`md:hidden bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-4 py-6 text-gray-700 font-medium">
          <li><a href="#features" className="hover:text-green-600">Fonctionnalités</a></li>
          <li><a href="#story" className="hover:text-green-600">Scénario</a></li>
          {/* <li><a href="#team" className="hover:text-green-600">Équipe</a></li> */}
          <li><a href="#contact" className="hover:text-green-600">Contact</a></li>
          <li>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
               Démarrer
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
