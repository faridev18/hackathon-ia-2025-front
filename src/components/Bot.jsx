import React, { useState } from 'react'
import { FaCommentDots } from 'react-icons/fa';
import { Chat } from './Chat';

export default function Bot() {

     const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };
    return (
        <>

            <button
                onClick={toggleModal}
                disabled={isOpen}
                className="fixed bottom-6 right-6 disabled:hidden cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-50 group"
                aria-label="Ouvrir le chatbot"
            >
                <FaCommentDots className="text-2xl group-hover:scale-110 transition-transform" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-end justify-end p-4 md:p-6">
                    <div
                        className="w-full max-w-md h-[85vh] md:h-[75vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
                        style={{
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {/* En-tête du chatbot */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <FaCommentDots className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Assistant Virtuel</h3>
                                    <p className="text-green-100 text-sm">En ligne • Prêt à vous aider</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleModal}
                                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                                aria-label="Fermer le chatbot"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Zone de conversation */}
                        <div className="flex-1 overflow-hidden">
                            <Chat />
                        </div>

                        {/* Indicateur de statut en bas */}
                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Réponse instantanée
                                </span>
                                <span>🔒 Sécurisé</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
