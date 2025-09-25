import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker, GeoJSON } from 'react-leaflet';
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

    // États pour les différentes couches GeoJSON
    const [litigeData, setLitigeData] = useState(null);
    const [titreReconstitueData, setTitreReconstitueData] = useState(null);
    const [tfEtatData, setTfEtatData] = useState(null);
    const [tfEnCoursData, setTfEnCoursData] = useState(null);
    const [tfDemembresData, setTfDemembresData] = useState(null);

    // États pour afficher/masquer les couches
    const [showLitige, setShowLitige] = useState(true);
    const [showTitreReconstitue, setShowTitreReconstitue] = useState(true);
    const [showTfEtat, setShowTfEtat] = useState(true);
    const [showTfEnCours, setShowTfEnCours] = useState(true);
    const [showTfDemembres, setShowTfDemembres] = useState(true);

    const mapRef = useRef();

    // Charger automatiquement le fichier litige.geojson
    useEffect(() => {
        const loadAllGeoJSONData = async () => {
            try {
                // Charger tous les fichiers en parallèle
                const [
                    litigeResponse,
                    titreReconstitueResponse,
                    tfEtatResponse,
                    tfEnCoursResponse,
                    tfDemembresResponse
                ] = await Promise.all([
                    fetch('/litige.geojson'),
                    fetch('/titre_reconstitue.geojson'),
                    fetch('/tf_etat.geojson'),
                    fetch('/tf_en_cours.geojson'),
                    fetch('/tf_demembres.geojson')
                ]);

                // Vérifier les réponses
                if (!litigeResponse.ok) throw new Error('Fichier litige.geojson non trouvé');
                if (!titreReconstitueResponse.ok) throw new Error('Fichier titre_reconstitue.geojson non trouvé');
                if (!tfEtatResponse.ok) throw new Error('Fichier tf_etat.geojson non trouvé');
                if (!tfEnCoursResponse.ok) throw new Error('Fichier tf_en_cours.geojson non trouvé');
                if (!tfDemembresResponse.ok) throw new Error('Fichier tf_demembres.geojson non trouvé');

                // Parser les données
                const [
                    litigeData,
                    titreReconstitueData,
                    tfEtatData,
                    tfEnCoursData,
                    tfDemembresData
                ] = await Promise.all([
                    litigeResponse.json(),
                    titreReconstitueResponse.json(),
                    tfEtatResponse.json(),
                    tfEnCoursResponse.json(),
                    tfDemembresResponse.json()
                ]);

                // Mettre à jour les états
                setLitigeData(litigeData);
                setTitreReconstitueData(titreReconstitueData);
                setTfEtatData(tfEtatData);
                setTfEnCoursData(tfEnCoursData);
                setTfDemembresData(tfDemembresData);

                console.log('Tous les fichiers GeoJSON chargés avec succès!');

            } catch (error) {
                console.error('Erreur chargement GeoJSON:', error);
            }
        };

        loadAllGeoJSONData();
    }, []);

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

    // Convertir les coordonnées GeoJSON UTM en WGS84
    const convertGeoJSONCoordinates = (geoJSONData) => {
        if (!geoJSONData || !geoJSONData.features) return null;

        const convertedFeatures = geoJSONData.features.map(feature => {
            try {
                // Vérifier si les coordonnées existent et ne sont pas vides
                if (!feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
                    return feature; // Retourner la feature inchangée si pas de coordonnées
                }

                const convertedCoordinates = feature.geometry.coordinates.map(polygon =>
                    polygon.map(ring =>
                        ring.map(coord => {
                            // Conversion UTM -> WGS84
                            const converted = convertUTMtoLatLng(coord[0], coord[1]);
                            return [converted.longitude, converted.latitude];
                        })
                    )
                );

                return {
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: convertedCoordinates
                    }
                };
            } catch (error) {
                console.error('Erreur conversion feature:', error);
                return feature;
            }
        });

        return {
            ...geoJSONData,
            features: convertedFeatures
        };
    };

    // Styles pour les différentes couches
    const getLayerStyle = (layerType) => {
        const styles = {
            litige: {
                fillColor: '#ff7800',
                weight: 3,
                opacity: 1,
                color: '#ff5500',
                dashArray: '3',
                fillOpacity: 0.4
            },
            titreReconstitue: {
                fillColor: '#4caf50',
                weight: 2,
                opacity: 1,
                color: '#388e3c',
                fillOpacity: 0.5
            },
            tfEtat: {
                fillColor: '#2196f3',
                weight: 2,
                opacity: 1,
                color: '#1976d2',
                fillOpacity: 0.4
            },
            tfEnCours: {
                fillColor: '#ffeb3b',
                weight: 2,
                opacity: 1,
                color: '#fbc02d',
                fillOpacity: 0.5
            },
            tfDemembres: {
                fillColor: '#9c27b0',
                weight: 2,
                opacity: 1,
                color: '#7b1fa2',
                fillOpacity: 0.4
            }
        };
        return styles[layerType] || styles.litige;
    };

    // Popup pour les zones de litige
    const onEachFeature = (layerType) => (feature, layer) => {
        if (feature.properties) {
            let popupContent = '';

            switch (layerType) {
                case 'litige':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">🔍 Zone Litigieuse #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>Commune:</strong> ${feature.properties.commune || 'Non spécifiée'}</p>
                                <p><strong>Tribunal:</strong> ${feature.properties.tribunal_alea || feature.properties.tribunal || 'Non spécifié'}</p>
                                <p><strong>Demandeur:</strong> ${feature.properties.demandeur_alea || feature.properties.demandeur || 'Non spécifié'}</p>
                                <p><strong>Défendeur:</strong> ${feature.properties.defendeur_alea || feature.properties.defendeur || 'Non spécifié'}</p>
                                <p><strong>Dossier:</strong> ${feature.properties.num_role_alea || feature.properties.num_dossier_au_role || 'Non spécifié'}</p>
                            </div>
                        </div>
                    `;
                    break;

                case 'titreReconstitue':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">📄 Titre Reconstitué #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>NUP:</strong> ${feature.properties.nup || 'N/A'}</p>
                                <p><strong>Ville:</strong> ${feature.properties.ville || 'Non spécifiée'}</p>
                                <p><strong>BCDF:</strong> ${feature.properties.bcdf || 'Non spécifié'}</p>
                                <p><strong>TF:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                                <p><strong>TF Aléa:</strong> ${feature.properties.tf_alea || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                    break;

                case 'tfEtat':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">🏛️ TF État #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>Numéro TF:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                                <p><strong>Surface:</strong> ${feature.properties.surface ? `${feature.properties.surface.toLocaleString()} m²` : 'N/A'}</p>
                                <p><strong>TF Aléa:</strong> ${feature.properties.tf_alea || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                    break;

                case 'tfEnCours':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">⏳ TF en Cours #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>Commune:</strong> ${feature.properties.commune || 'Non spécifiée'}</p>
                                <p><strong>Arrondissement:</strong> ${feature.properties.arrond || 'Non spécifié'}</p>
                                <p><strong>Quartier/Village:</strong> ${feature.properties.qu_village || 'Non spécifié'}</p>
                                <p><strong>Îlot:</strong> ${feature.properties.id_ilot || 'N/A'}</p>
                                <p><strong>Parcelle:</strong> ${feature.properties.id_prcl || 'N/A'}</p>
                                <p><strong>Validation:</strong> ${feature.properties.validation || 'N/A'}</p>
                                ${feature.properties.motif ? `<p><strong>Motif:</strong> ${feature.properties.motif}</p>` : ''}
                            </div>
                        </div>
                    `;
                    break;

                case 'tfDemembres':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">🏠 TF Démembrés #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>Numéro TF:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                                <p><strong>Commune:</strong> ${feature.properties.Commune || 'Non spécifiée'}</p>
                                <p><strong>TF Aléa:</strong> ${feature.properties.tf_alea || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                    break;

                default:
                    popupContent = `<div class="p-2"><p>Propriétés: ${JSON.stringify(feature.properties)}</p></div>`;
            }

            layer.bindPopup(popupContent);
        }
    };

    // Convertir toutes les données GeoJSON
    const convertedLitigeData = litigeData ? convertGeoJSONCoordinates(litigeData) : null;
    const convertedTitreReconstitueData = titreReconstitueData ? convertGeoJSONCoordinates(titreReconstitueData) : null;
    const convertedTfEtatData = tfEtatData ? convertGeoJSONCoordinates(tfEtatData) : null;
    const convertedTfEnCoursData = tfEnCoursData ? convertGeoJSONCoordinates(tfEnCoursData) : null;
    const convertedTfDemembresData = tfDemembresData ? convertGeoJSONCoordinates(tfDemembresData) : null;

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
                    originalUTM: { x: point.x, y: point.y }
                };
            });

            setTempCoords(convertedCoords);
            setShowJsonInput(false);
        } catch (error) {
            alert(`Erreur: ${error.message}`);
        }
    };

    // Calculer le centre de la parcelle
    const calculateCenter = (coords) => {
        if (coords.length === 0) return [6.3703, 2.3912];
        const lats = coords.map(coord => coord.latitude);
        const lngs = coords.map(coord => coord.longitude);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        return [centerLat, centerLng];
    };

    // Calculer les bounds de la parcelle
    const calculateBounds = (coords) => {
        if (coords.length === 0) return null;
        return L.latLngBounds(coords.map(c => [c.latitude, c.longitude]));
    };

    // Centrer la carte sur la parcelle
    const centerOnParcelle = () => {
        if (coordonnees.length === 0) return;
        const map = mapRef.current;
        if (!map) return;

        if (coordonnees.length === 1) {
            map.setView([coordonnees[0].latitude, coordonnees[0].longitude], 18);
        } else {
            const bounds = calculateBounds(coordonnees);
            if (bounds) {
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }
    };

    // Valider toutes les coordonnées
    const saveAllCoords = () => {
        const hasEmptyFields = tempCoords.some(coord => !coord.latitude || !coord.longitude);
        if (hasEmptyFields) {
            alert('Veuillez remplir tous les champs de coordonnées');
            return;
        }

        const validatedCoords = tempCoords.map(coord => ({
            latitude: parseFloat(coord.latitude),
            longitude: parseFloat(coord.longitude),
            originalUTM: coord.originalUTM
        }));

        let newCoords;
        if (editingIndex !== null) {
            newCoords = [...coordonnees];
            newCoords[editingIndex] = validatedCoords[0];
        } else {
            newCoords = [...coordonnees, ...validatedCoords];
        }

        setCoordonnees(newCoords);
        closeModal();
        setTimeout(() => centerOnParcelle(), 300);
    };

    // Supprimer une coordonnée
    const deleteCoord = (index) => {
        const updatedCoords = coordonnees.filter((_, i) => i !== index);
        setCoordonnees(updatedCoords);
        if (updatedCoords.length > 0) {
            setTimeout(() => centerOnParcelle(), 300);
        }
    };

    // Exporter en JSON UTM
    const exportToJson = () => {
        const exportData = coordonnees.map(coord =>
            coord.originalUTM ? coord.originalUTM : { x: coord.longitude, y: coord.latitude }
        );
        setJsonInput(JSON.stringify(exportData, null, 2));
        setShowJsonInput(true);
    };

    const center = calculateCenter(coordonnees);
    const polygonCoords = coordonnees.map(coord => [coord.latitude, coord.longitude]);
    // const convertedLitigeData = litigeData ? convertGeoJSONCoordinates(litigeData) : null;

    return (
        <div className="h-screen w-screen flex flex-col relative">
            <Navbar />

            {/* Boutons de contrôle */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        + Ajouter des bornes
                    </button>

                    {/* {coordonnees.length > 0 && (
                        <button
                            onClick={exportToJson}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            📋 Exporter en JSON UTM
                        </button>
                    )} */}

                    {/* Checkboxes pour afficher/masquer les couches */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {litigeData && (
                            <LayerCheckbox
                                label="🔍 Litiges"
                                checked={showLitige}
                                onChange={setShowLitige}
                                color="orange"
                            />
                        )}
                        {titreReconstitueData && (
                            <LayerCheckbox
                                label="📄 Titres Reconstitués"
                                checked={showTitreReconstitue}
                                onChange={setShowTitreReconstitue}
                                color="green"
                            />
                        )}
                        {tfEtatData && (
                            <LayerCheckbox
                                label="🏛️ TF État"
                                checked={showTfEtat}
                                onChange={setShowTfEtat}
                                color="blue"
                            />
                        )}
                        {tfEnCoursData && (
                            <LayerCheckbox
                                label="⏳ TF en Cours"
                                checked={showTfEnCours}
                                onChange={setShowTfEnCours}
                                color="yellow"
                            />
                        )}
                        {tfDemembresData && (
                            <LayerCheckbox
                                label="🏠 TF Démembrés"
                                checked={showTfDemembres}
                                onChange={setShowTfDemembres}
                                color="purple"
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                        {coordonnees.length} borne(s) définie(s)
                    </span>
                    {coordonnees.length >= 1 && (
                        <button
                            onClick={centerOnParcelle}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            🎯 Centrer sur la parcelle
                        </button>
                    )}
                </div>
            </div>

            {/* Map */}
            {/* Map */}
            <div className="flex-1 w-full">
                <MapContainer
                    center={center}
                    zoom={15}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                    whenCreated={(mapInstance) => {
                        mapRef.current = mapInstance;
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Couches GeoJSON */}
                    {showLitige && convertedLitigeData && (
                        <GeoJSON
                            data={convertedLitigeData}
                            style={() => getLayerStyle('litige')}
                            onEachFeature={onEachFeature('litige')}
                        />
                    )}

                    {showTitreReconstitue && convertedTitreReconstitueData && (
                        <GeoJSON
                            data={convertedTitreReconstitueData}
                            style={() => getLayerStyle('titreReconstitue')}
                            onEachFeature={onEachFeature('titreReconstitue')}
                        />
                    )}

                    {showTfEtat && convertedTfEtatData && (
                        <GeoJSON
                            data={convertedTfEtatData}
                            style={() => getLayerStyle('tfEtat')}
                            onEachFeature={onEachFeature('tfEtat')}
                        />
                    )}

                    {showTfEnCours && convertedTfEnCoursData && (
                        <GeoJSON
                            data={convertedTfEnCoursData}
                            style={() => getLayerStyle('tfEnCours')}
                            onEachFeature={onEachFeature('tfEnCours')}
                        />
                    )}

                    {showTfDemembres && convertedTfDemembresData && (
                        <GeoJSON
                            data={convertedTfDemembresData}
                            style={() => getLayerStyle('tfDemembres')}
                            onEachFeature={onEachFeature('tfDemembres')}
                        />
                    )}

                    {/* Polygone de la parcelle */}
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

                    {/* Marqueurs des bornes */}
                    {coordonnees.map((coord, index) => (
                        <Marker
                            key={index}
                            position={[coord.latitude, coord.longitude]}
                            eventHandlers={{ click: () => openEditModal(index) }}
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

            {/* Modale */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <h3 className="text-xl font-semibold mb-4">
                                {editingIndex !== null ? `Modifier la borne ${editingIndex + 1}` : 'Ajouter des bornes UTM'}
                            </h3>

                            {editingIndex === null && !showJsonInput && (
                                <div className="mb-4">
                                    <button
                                        onClick={() => setShowJsonInput(true)}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2"
                                    >
                                        📥 Importer depuis JSON UTM
                                    </button>
                                    <p className="text-sm text-gray-600 mt-1">Format UTM 31N</p>
                                </div>
                            )}

                            {showJsonInput && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collez votre JSON UTM ici (Zone 31N):
                                    </label>
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder='[{"x": 401374.38, "y": 712334.71}, ...]'
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
                                </div>
                            )}

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
                                            onClick={addCoordField}
                                            className="mb-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <span>+</span> Ajouter une autre borne
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

const LayerCheckbox = ({ label, checked, onChange, color }) => {
    const colorClasses = {
        orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
        green: 'bg-green-100 text-green-800 hover:bg-green-200',
        blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    };

    return (
        <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${colorClasses[color]}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded focus:ring-2"
            />
            <span className="font-medium text-sm">
                {checked ? `🙈 ${label}` : `👁️ ${label}`}
            </span>
        </label>
    );
};

export default ParcelleMap;