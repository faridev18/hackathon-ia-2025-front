import React from 'react'

import hero from "../assets/hero1.png"
import Navbar from '../components/Navbar'
import Fieldcard from '../components/Fieldcard'
import { FaSearch, FaFileAlt, FaComments, FaMapMarkedAlt } from "react-icons/fa";
import { StorySection } from '../components/StorySection';
import { Tilt } from 'react-tilt';
import Marquee from "react-fast-marquee";



const features = [
    {
        id: 1,
        icon: <FaSearch className="text-white text-4xl" />,
        title: "Détection des conflits",
        description: "Analyse automatique des zones à risques avec l’IA.",
    },
    {
        id: 2,
        icon: <FaFileAlt className="text-white text-4xl" />,
        title: "Vérification des documents",
        description: "Authentification fiable et sécurisée des titres fonciers.",
    },
    {
        id: 3,
        icon: <FaComments className="text-white text-4xl" />,
        title: "Chatbot intelligent",
        description: "Disponible en texte, audio et langues locales.",
    },
    {
        id: 4,
        icon: <FaMapMarkedAlt className="text-white text-4xl" />,
        title: "Cartographie IA",
        description: "Création de cartes à partir d’images ou vidéos.",
    },
];

const keywords = [
    "Détection de conflits fonciers",
    "Vérification des titres fonciers",
    "Cartographie automatisée",
    "Chatbot multilingue",
    "Analyse de terrain par IA",
    "Prédiction de valeur foncière",
    "Sécurisation des documents",
    "Machine Learning foncier",
    "Gestion de données cadastrales",
];


export default function Home() {
    return (
        <div>
            <div className="font-poppins bg-gray-50 text-gray-900">

                <Navbar />

                <section className="relative px-6 py-32 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">


                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                                Sécuriser, Vérifier et Simplifier le foncier grâce à l’IA
                            </h2>
                            <p className="mb-8 text-lg">
                                Une solution innovante pour la gestion foncière : détection de conflits, vérification des documents, chatbot intelligent et cartographie automatisée.
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                                    Verifier mon levé
                                </button>
                                {/* <button className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600">
                                    En savoir plus
                                </button> */}
                            </div>
                        </div>


                        <div className="md:w-1/2">
                            <Tilt>
                                <img
                                    src={hero}
                                    alt="Illustration Foncier Intelligent"
                                    className="w-full h-auto rounded-lg shadow-lg"
                                />
                            </Tilt>
                        </div>

                    </div>
                </section>

                <div className="border-b-5 border-green-700 py-6">
                    <Marquee
                        speed={80}            // vitesse du défilement
                        pauseOnHover={true}   // pause au survol
                        gradient={false}      // pas de gradient
                        direction="left"      // de droite vers gauche
                    >
                        {keywords.map((word, index) => (
                            <span key={index} className="text-4xl font-extrabold text-green-700 mb-4 inline-flex items-center">
                                {word}
                                {index !== keywords.length + 1 && (
                                    <span className="mx-4 text-green-900 text-2xl">♦</span>
                                )}
                            </span>
                        ))}
                    </Marquee>
                    <Marquee
                        speed={80}            // vitesse du défilement
                        pauseOnHover={true}   // pause au survol
                        gradient={false}      // pas de gradient
                        direction="right"      // de droite vers gauche
                    >

                        {keywords.map((word, index) => (
                            <span key={index} className="text-4xl font-extrabold text-green-700  inline-flex items-center">
                                {word}
                                {index !== keywords.length + 1 && (
                                    <span className="mx-4 text-green-900 text-2xl">♦</span>
                                )}
                            </span>
                        ))}
                    </Marquee>
                </div>



                <section id="features" className=" bg-gray-100">
                    <div className=" px-6 py-20 max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fonctionnalités Clés</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Découvrez les principales fonctionnalités de notre solution de gestion foncière intelligente.
                            </p>
                        </div>


                        <div className="grid gap-4 my-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4  ">
                            {features.map((item, index) => (
                                <Fieldcard
                                    dataaos="flip-left" dataaosdelay={index * 100}
                                    key={index}
                                    icon={item.icon}
                                    title={item.title}
                                    description={item.description}
                                />
                            ))}
                        </div>
                    </div>
                </section>


                <section id="story" className="px-4 py-24 max-w-7xl mx-auto bg-gradient-to-b ">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez en quelques étapes simples comment notre solution de gestion foncière intelligente fonctionne.
                        </p>
                    </div>


                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                        <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 z-0"></div>

                        <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center z-10 group">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Import du document</h3>
                            <p className="text-gray-600">Chargez un document foncier ou une image satellite depuis votre appareil.</p>
                        </div>

                        <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center z-10 group">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Analyse par IA</h3>
                            <p className="text-gray-600">Notre intelligence artificielle vérifie et détecte automatiquement les anomalies.</p>
                        </div>

                        <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center z-10 group">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Rapport & Assistance</h3>
                            <p className="text-gray-600">Recevez un rapport détaillé et bénéficiez d'une assistance via notre chatbot expert.</p>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <button className="bg-green-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
                            Commencer maintenant
                        </button>
                    </div>
                </section>


                {/* <section id="team" className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4">

                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre Équipe</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Une équipe passionnée et complémentaire pour relever le défi Hackathon IA 2025
                            </p>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    name: "Farihane ZANNOU",
                                    role: "Développeur Front-end & UI/UX Designer",
                                    img: "https://randomuser.me/api/portraits/men/10.jpg",
                                    bio: "Spécialiste en interfaces modernes et expérience utilisateur, il conçoit un design clair et impactant."
                                },
                                {
                                    name: "Lewis",
                                    role: "Développeur Front-end",
                                    img: "https://randomuser.me/api/portraits/men/20.jpg",
                                    bio: "Expert en intégration et React, il assure la fluidité et la performance des interfaces utilisateur."
                                },
                                {
                                    name: "Romario",
                                    role: "Développeur Backend & IA",
                                    img: "https://randomuser.me/api/portraits/men/30.jpg",
                                    bio: "Passionné de data et d’intelligence artificielle, il gère la logique serveur et les modèles IA."
                                },
                                {
                                    name: "César",
                                    role: "Développeur Backend & IA",
                                    img: "https://randomuser.me/api/portraits/men/40.jpg",
                                    bio: "Axé sur la sécurité et la robustesse, il travaille sur la détection de conflits et la fiabilité des services."
                                },
                            ].map((member, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden group bg-white rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl duration-300"
                                >

                                    <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-xl overflow-hidden relative">
                                        <img
                                            src={member.img}
                                            alt={member.name}
                                            className="w-full h-full object-cover object-center"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                                        <p className="text-green-600 mb-4">{member.role}</p>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out shadow-lg rounded-t-lg">
                                        <p className="text-sm text-gray-700">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section> */}




                <section className="px-8 py-24 text-center bg-gradient-to-r from-green-600 to-blue-600 text-white relative overflow-hidden">
                    {/* Décoratif : petites formes ou glow */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4"></div>

                    {/* Titre */}
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-4 relative inline-block">
                        Rejoignez la révolution foncière numérique !
                        <span className="block w-20 h-1 bg-white mx-auto mt-3 rounded-full"></span>
                    </h3>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        Découvrez notre solution intelligente pour sécuriser, cartographier et analyser vos terrains facilement.
                    </p>

                    {/* Bouton */}
                    <button className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                        Essayer la Démo
                    </button>
                </section>



                <footer id="contact" className="px-8 py-6 bg-gray-900 text-gray-300 text-center">
                    <p>© 2025 Foncier Intelligent – Hackathon IA 2025 | Sémè City & Epitech</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <a href="#">LinkedIn</a>
                        <a href="#">GitHub</a>
                        <a href="#">X</a>
                    </div>
                </footer>
            </div>

        </div>
    )
}
