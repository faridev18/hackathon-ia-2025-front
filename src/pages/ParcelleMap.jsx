import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
import Navbar from '../components/Navbar';

// Import de la bibliothèque de conversion UTM
import { toLatLon } from 'utm';

let DefaultIcon = L.divIcon({
    html: `<div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ParcelleMap = () => {
    const [coordonnees, setCoordonnees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempCoords, setTempCoords] = useState([{ latitude: '', longitude: '' }]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [jsonInput, setJsonInput] = useState('');
    const [showJsonInput, setShowJsonInput] = useState(false);

    const mapRef = useRef();

    // Fonction de conversion UTM vers Lat/Lng
    const convertUTMtoLatLng = (easting, northing) => {
        try {
            // Pour le Bénin, zone UTM 31N
            const zoneNumber = 31;
            const zoneLetter = 'N'; // Hémisphère Nord
            
            const converted = toLatLon(easting, northing, zoneNumber, zoneLetter);
            return {
                latitude: converted.latitude,
                longitude: converted.longitude
            };
        } catch (error) {
            console.error('Erreur de conversion UTM:', error);
            throw new Error(`Conversion impossible pour x:${easting}, y:${northing}`);
        }
    };

    // Ouvrir la modale pour ajouter de nouvelles coordonnées
    const openAddModal = () => {
        setTempCoords([{ latitude: '', longitude: '' }]);
        setEditingIndex(null);
        setJsonInput('');
        setShowJsonInput(false);
        setIsModalOpen(true);
    };

    // Ouvrir la modale pour éditer une coordonnée existante
    const openEditModal = (index) => {
        setTempCoords([coordonnees[index]]);
        setEditingIndex(index);
        setJsonInput('');
        setShowJsonInput(false);
        setIsModalOpen(true);
    };

    // Fermer la modale
    const closeModal = () => {
        setIsModalOpen(false);
        setTempCoords([{ latitude: '', longitude: '' }]);
        setEditingIndex(null);
        setJsonInput('');
        setShowJsonInput(false);
    };

    // Ajouter un nouveau champ de coordonnée dans le formulaire
    const addCoordField = () => {
        setTempCoords([...tempCoords, { latitude: '', longitude: '' }]);
    };

    // Supprimer un champ de coordonnée
    const removeCoordField = (index) => {
        if (tempCoords.length > 1) {
            const updatedCoords = tempCoords.filter((_, i) => i !== index);
            setTempCoords(updatedCoords);
        }
    };

    // Mettre à jour une coordonnée dans le formulaire
    const updateTempCoord = (index, field, value) => {
        const updatedCoords = [...tempCoords];
        updatedCoords[index] = {
            ...updatedCoords[index],
            [field]: value
        };
        setTempCoords(updatedCoords);
    };

    // Parser le JSON UTM et convertir en Lat/Lng
    const parseJsonInput = () => {
        try {
            const parsedData = JSON.parse(jsonInput);

            if (!Array.isArray(parsedData)) {
                throw new Error('Le format doit être un tableau JSON');
            }

            const convertedCoords = parsedData.map((point, index) => {
                if (point.x === undefined || point.y === undefined) {
                    throw new Error('Chaque point doit avoir les propriétés x et y');
                }

                // Conversion UTM vers Lat/Lng
                const converted = convertUTMtoLatLng(point.x, point.y);
                
                return {
                    latitude: converted.latitude,
                    longitude: converted.longitude,
                    originalUTM: { x: point.x, y: point.y } // Garder une trace des coordonnées UTM originales
                };
            });

            setTempCoords(convertedCoords);
            setShowJsonInput(false);
            alert(`${convertedCoords.length} bornes UTM converties et chargées avec succès !`);
        } catch (error) {
            alert(`Erreur: ${error.message}`);
        }
    };

    // Calculer le centre de la parcelle
    const calculateCenter = (coords) => {
        if (coords.length === 0) return [9.3077, 2.3158]; // Centre du Bénin

        const lats = coords.map(coord => coord.latitude);
        const lngs = coords.map(coord => coord.longitude);

        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        return [centerLat, centerLng];
    };

    // Calculer le zoom optimal pour la parcelle
    const calculateBoundsZoom = (coords, map) => {
        if (coords.length < 2) return 15;

        const group = L.featureGroup(
            coords.map(coord => L.marker([coord.latitude, coord.longitude]))
        );

        return map.getBoundsZoom(group.getBounds(), true);
    };

    // Centrer la carte sur la parcelle
    const centerOnParcelle = () => {
        if (coordonnees.length === 0) return;

        const center = calculateCenter(coordonnees);
        const map = mapRef.current;

        if (map) {
            map.setView(center, calculateBoundsZoom(coordonnees, map));
        }
    };

    // Valider toutes les coordonnées
    const saveAllCoords = () => {
        // Valider que tous les champs sont remplis
        const hasEmptyFields = tempCoords.some(coord => !coord.latitude || !coord.longitude);

        if (hasEmptyFields) {
            alert('Veuillez remplir tous les champs de coordonnées');
            return;
        }

        // Convertir en nombres
        const validatedCoords = tempCoords.map(coord => ({
            latitude: parseFloat(coord.latitude),
            longitude: parseFloat(coord.longitude),
            originalUTM: coord.originalUTM // Conserver les UTM originales si existantes
        }));

        let newCoords;
        if (editingIndex !== null) {
            // Édition d'une coordonnée existante
            newCoords = [...coordonnees];
            newCoords[editingIndex] = validatedCoords[0];
        } else {
            // Ajout de nouvelles coordonnées
            newCoords = [...coordonnees, ...validatedCoords];
        }

        setCoordonnees(newCoords);
        closeModal();

        // Centrer sur la nouvelle parcelle après un petit délai
        setTimeout(() => {
            centerOnParcelle();
        }, 100);
    };

    // Supprimer une coordonnée de la carte
    const deleteCoord = (index) => {
        const updatedCoords = coordonnees.filter((_, i) => i !== index);
        setCoordonnees(updatedCoords);

        // Recentrer si il reste des coordonnées
        if (updatedCoords.length > 0) {
            setTimeout(() => {
                centerOnParcelle();
            }, 100);
        }
    };

    // Exporter les coordonnées actuelles en format JSON UTM
    const exportToJson = () => {
        const exportData = coordonnees.map(coord => {
            // Si on a les UTM originales, on les utilise, sinon on approxime
            if (coord.originalUTM) {
                return {
                    x: coord.originalUTM.x,
                    y: coord.originalUTM.y
                };
            } else {
                // Approximation (pour les coordonnées entrées manuellement)
                return {
                    x: coord.longitude,
                    y: coord.latitude
                };
            }
        });

        setJsonInput(JSON.stringify(exportData, null, 2));
        setShowJsonInput(true);
    };

    // Centre par défaut ou centre de la parcelle
    const center = calculateCenter(coordonnees);
    const polygonCoords = coordonnees.map(coord => [coord.latitude, coord.longitude]);

    return (
        <div className="h-screen w-screen flex flex-col relative">
            <Navbar />

            {/* Boutons de contrôle */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-3"
                    >
                        + Ajouter des bornes
                    </button>

                    {coordonnees.length > 0 && (
                        <button
                            onClick={exportToJson}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mr-3"
                        >
                            📋 Exporter en JSON UTM
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                        {coordonnees.length} borne(s) définie(s)
                    </span>

                    {coordonnees.length >= 3 && (
                        <button
                            onClick={centerOnParcelle}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            title="Centrer sur la parcelle"
                        >
                            🎯 Centrer sur la parcelle
                        </button>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 w-full">
                <MapContainer
                    center={center}
                    zoom={15}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                    whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Polygone seulement s'il y a au moins 3 points */}
                    {coordonnees.length >= 3 && (
                        <Polygon
                            positions={polygonCoords}
                            pathOptions={{
                                color: 'blue',
                                fillColor: 'lightblue',
                                fillOpacity: 0.4,
                                weight: 2
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h4 className="font-semibold text-lg mb-2">Parcelle</h4>
                                    <p className="text-sm">Nombre de bornes: {coordonnees.length}</p>
                                    <p className="text-xs text-gray-500">Système: WGS84 (converti depuis UTM 31N)</p>
                                    <button
                                        onClick={centerOnParcelle}
                                        className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm w-full"
                                    >
                                        Centrer sur la parcelle
                                    </button>
                                </div>
                            </Popup>
                        </Polygon>
                    )}

                    {/* Marqueurs pour chaque coordonnée */}
                    {coordonnees.map((coord, index) => (
                        <Marker
                            key={index}
                            position={[coord.latitude, coord.longitude]}
                            eventHandlers={{
                                click: () => openEditModal(index)
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[250px]">
                                    <h4 className="font-semibold text-lg mb-2">Borne {index + 1}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="font-medium">WGS84 (carte):</p>
                                            <p>Lat: {coord.latitude.toFixed(6)}°</p>
                                            <p>Lng: {coord.longitude.toFixed(6)}°</p>
                                        </div>
                                        {coord.originalUTM && (
                                            <div>
                                                <p className="font-medium">UTM 31N (original):</p>
                                                <p>X: {coord.originalUTM.x}</p>
                                                <p>Y: {coord.originalUTM.y}</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteCoord(index)}
                                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm w-full"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Modale avec z-index élevé */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <h3 className="text-xl font-semibold mb-4">
                                {editingIndex !== null ? `Modifier la borne ${editingIndex + 1}` : 'Ajouter des bornes UTM'}
                            </h3>

                            {/* Bouton pour importer depuis JSON UTM */}
                            {editingIndex === null && !showJsonInput && (
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowJsonInput(true)}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2"
                                    >
                                        📥 Importer depuis JSON UTM
                                    </button>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Format UTM 31N
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Les coordonnées UTM seront automatiquement converties en WGS84
                                    </p>
                                </div>
                            )}

                            {/* Champ JSON UTM */}
                            {showJsonInput && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collez votre JSON UTM ici (Zone 31N):
                                    </label>
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder='[{"x": 401374.38, "y": 712334.71}, {"x": 401378.12, "y": 712287.17}]'
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={parseJsonInput}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                        >
                                            Convertir et Importer
                                        </button>
                                        <button
                                            onClick={() => setShowJsonInput(false)}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        ✅ Conversion automatique UTM 31N → WGS84
                                    </p>
                                </div>
                            )}

                            {/* Liste des champs de coordonnées */}
                            {!showJsonInput && (
                                <>
                                    <div className="space-y-4 mb-6">
                                        {tempCoords.map((coord, index) => (
                                            <div key={index} className="flex items-end gap-3">
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Latitude {tempCoords.length > 1 ? index + 1 : ''}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={coord.latitude}
                                                            onChange={(e) => updateTempCoord(index, 'latitude', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Latitude en degrés"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Longitude {tempCoords.length > 1 ? index + 1 : ''}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={coord.longitude}
                                                            onChange={(e) => updateTempCoord(index, 'longitude', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Longitude en degrés"
                                                        />
                                                    </div>
                                                </div>

                                                {tempCoords.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCoordField(index)}
                                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors mb-1"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {editingIndex === null && (
                                        <button
                                            type="button"
                                            onClick={addCoordField}
                                            className="mb-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <span>+</span>
                                            Ajouter une autre borne
                                        </button>
                                    )}
                                </>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                {!showJsonInput && (
                                    <button
                                        onClick={saveAllCoords}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        {editingIndex !== null ? 'Modifier' : `Valider ${tempCoords.length} borne(s)`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParcelleMap;