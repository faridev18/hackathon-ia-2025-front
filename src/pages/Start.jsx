import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, X, Trash2, RotateCcw } from "lucide-react";
import Navbar from "../components/Navbar";
import image from "../assets/start.png";
import Bot from "../components/Bot";

export default function Start() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    // Gestion du fichier
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));

            // Convertir en Base64 et stocker dans localStorage
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem("uploadedImage", reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    // Gestion du drop
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));

            // Convertir en Base64 et stocker dans localStorage
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem("uploadedImage", reader.result);
            };
            reader.readAsDataURL(droppedFile);
        }
    };


    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Supprimer le fichier
    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        // Libérer l'URL de l'image pour éviter les fuites mémoire
        if (preview) {
            URL.revokeObjectURL(preview);
        }
    };


    // Simulation envoi
    const handleUpload = () => {
        if (!file) return;
        setLoading(true);

        // Données essentielles pour la parcelle
        const parcelleData = {
            textualData: {
                aif: "NON",
                air_proteges: "NON",
                dpl: "NON",
                dpm: "NON",
                enregistrement_individuel: "OUI",
                litige: "NON",
                parcelles: "OUI",
                restriction: "OUI",
                tf_demembres: "NON",
                tf_en_cours: "NON",
                tf_etat: "NON",
                titre_reconstitue: "NON",
                zone_inondable: "NON"
            },

            coordinates: [
                { x: 321562.2, y: 1135517.34 },
                { x: 321590.39, y: 1135506.9 },
                { x: 321587.21, y: 1135487.05 },
                { x: 321559.04, y: 1135497.6 },
                { x: 321587.21, y: 1135487.05 },
                { x: 321584.02, y: 1135467.22 },
                { x: 321555.89, y: 1135477.83 },
                { x: 321559.04, y: 1135497.6 }
            ]
        };


        setTimeout(() => {
            setLoading(false);
            // Navigation vers la page Parcelle avec les données essentielles
            navigate("/parcelle", { state: { parcelleData } });
        }, 3000);
    };

    return (
        <>
            <Navbar />
            <Bot />

            <div className="flex">
                <div className=" flex-1 flex justify-center items-center ">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-6">


                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center"
                    >
                        Entrer votre levé topographique
                    </motion.h1>

                    {/* Zone drag & drop */}
                    <motion.div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className={`relative w-full max-w-xl max-h-[700px] h-fit border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${isDragging ? "border-green-500 bg-green-50 scale-105" : preview ? "border-green-400 bg-white" : "border-gray-400 bg-gray-50 hover:bg-gray-100"}`}
                    >
                        <label htmlFor="fileInput" className="flex flex-col items-center w-full h-full">
                            <AnimatePresence mode="wait">
                                {preview ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative w-full h-full flex flex-col items-center"
                                    >
                                        <img
                                            src={preview}
                                            alt="Prévisualisation"
                                            className="max-h-[450px] w-auto object-contain rounded-md shadow-md"
                                        />
                                        <div className="mt-4 flex gap-3">
                                            {/* Bouton Supprimer */}
                                            <motion.button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRemoveFile();
                                                }}
                                                whileHover={{ scale: 1.05, backgroundColor: "#fee2e2" }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Supprimer
                                            </motion.button>

                                            {/* Bouton Changer */}
                                            <motion.button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    document.getElementById('fileInput').click();
                                                }}
                                                whileHover={{ scale: 1.05, backgroundColor: "#f0f9ff" }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg transition-colors"
                                            >
                                                <RotateCcw size={16} />
                                                Changer
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center"
                                    >
                                        <CloudUpload className={`w-16 h-16 mb-3 transition-colors ${isDragging ? "text-green-500" : "text-gray-500"}`} />
                                        <p className={`font-medium transition-colors ${isDragging ? "text-green-600" : "text-gray-600"}`}>
                                            {isDragging ? "Lâchez pour déposer" : "Glissez-déposez votre image ici"}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">ou cliquez pour sélectionner</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </motion.div>

                    {/* Bouton envoyer */}
                    <AnimatePresence>
                        {file && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="mt-6 flex gap-4"
                            >
                                <motion.button
                                    onClick={handleUpload}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Analyser le levé
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Animation de chargement */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-6 flex flex-col items-center justify-center gap-3"
                            >
                                {/* Spinner animé */}
                                <motion.div
                                    className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                                {/* Texte avec effet */}
                                <motion.p
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                                    className="text-gray-700 font-semibold"
                                >
                                    Traitement de votre levé...
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Informations supplémentaires */}

                </div>
            </div>

        </>
    );
}