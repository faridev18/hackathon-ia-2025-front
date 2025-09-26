import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker, GeoJSON, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation, useNavigate } from "react-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo-andf.png";


// Fix for default markers in React-Leaflet
import L from 'leaflet';
import Navbar from '../components/Navbar';

// Import de la bibliothèque de conversion UTM
import { toLatLon } from 'utm';
import { ArrowBigLeftDash, ArrowLeft, Download, Layers, MoveLeft } from 'lucide-react';

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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(true);


    const location = useLocation();
    const { parcelleData } = location.state || {};
    const navigate = useNavigate();


    console.log('====================================');
    console.log(parcelleData);
    console.log('====================================');

    const [isLoading, setIsLoading] = useState(true); // État de chargement

    const { BaseLayer } = LayersControl;




    // États pour les différentes couches GeoJSON
    const [litigeData, setLitigeData] = useState(null);
    const [titreReconstitueData, setTitreReconstitueData] = useState(null);
    const [tfEtatData, setTfEtatData] = useState(null);
    const [tfEnCoursData, setTfEnCoursData] = useState(null);
    const [tfDemembresData, setTfDemembresData] = useState(null);
    const [zoneInondableData, setZoneInondableData] = useState(null);
    const [restrictionData, setRestrictionData] = useState(null);
    const [enregistrementIndividuelData, setEnregistrementIndividuelData] = useState(null);
    const [dpmData, setDpmData] = useState(null);
    const [dplData, setDplData] = useState(null);
    const [airProtegesData, setAirProtegesData] = useState(null);
    const [aifData, setAifData] = useState(null);

    // États pour afficher/masquer les couches
    const [showLitige, setShowLitige] = useState(false);
    const [showTitreReconstitue, setShowTitreReconstitue] = useState(false);
    const [showTfEtat, setShowTfEtat] = useState(false);
    const [showTfEnCours, setShowTfEnCours] = useState(false);
    const [showTfDemembres, setShowTfDemembres] = useState(false);
    const [showZoneInondable, setShowZoneInondable] = useState(false);
    const [showRestriction, setShowRestriction] = useState(false);
    const [showEnregistrementIndividuel, setShowEnregistrementIndividuel] = useState(false);
    const [showDpm, setShowDpm] = useState(false);
    const [showDpl, setShowDpl] = useState(false);
    const [showAirProteges, setShowAirProteges] = useState(false);
    const [showAif, setShowAif] = useState(false);

    const storedImage = localStorage.getItem("uploadedImage");



    const mapRef = useRef();

    useEffect(() => {
        if (coordonnees.length > 0 && mapRef.current) {
            const map = mapRef.current;

            if (coordonnees.length === 1) {
                map.setView([coordonnees[0].latitude, coordonnees[0].longitude], 20);
            } else {
                const bounds = calculateBounds(coordonnees);
                if (bounds) {
                    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 20 });
                }
            }
        }
    }, [coordonnees, mapRef.current]);  // 👈 on ajoute la carte comme dépendance



    console.log("mapRef.current:", mapRef.current);


    useEffect(() => {
        if (parcelleData && parcelleData.coordinates) {
            console.log('Données de parcelle reçues:', parcelleData);

            // Convertir les coordonnées UTM en Lat/Lng
            const convertedCoords = parcelleData.coordinates.map(point => {
                try {
                    const converted = convertUTMtoLatLng(point.x, point.y);
                    return {
                        latitude: converted.latitude,
                        longitude: converted.longitude,
                        originalUTM: { x: point.x, y: point.y }
                    };
                } catch (error) {
                    console.error('Erreur conversion point:', point, error);
                    return null;
                }
            }).filter(coord => coord !== null);

            setCoordonnees(convertedCoords);
            setIsLoading(false); // Chargement terminé
            console.log('Coordonnées converties:', convertedCoords);
        } else {
            setIsLoading(false); // Aucune donnée à charger
        }
    }, [parcelleData]);






    // Centrer automatiquement la carte sur la parcelle quand les coordonnées sont chargées
    useEffect(() => {
        if (coordonnees.length > 0 && mapRef.current) {
            // Petit délai pour s'assurer que la carte est bien initialisée
            setTimeout(() => {
                centerOnParcelleWithMaxZoom();
            }, 500);
        }
    }, [coordonnees]);

    // Fonction pour centrer avec zoom maximal
    const centerOnParcelleWithMaxZoom = () => {
        if (coordonnees.length === 0 || !mapRef.current) return;

        const map = mapRef.current;

        if (coordonnees.length === 1) {
            // Si un seul point, zoom maximal (niveau 20)
            map.setView([coordonnees[0].latitude, coordonnees[0].longitude], 20);
        } else {
            // Pour plusieurs points, fitBounds avec padding minimal pour zoom maximal
            const bounds = calculateBounds(coordonnees);
            if (bounds) {
                map.fitBounds(bounds, {
                    padding: [1, 1], // Padding minimal pour zoom maximal
                    maxZoom: 20 // Zoom maximal autorisé
                });
            }
        }
    };

    // Charger automatiquement le fichier litige.geojson
    useEffect(() => {
        const loadAllGeoJSONData = async () => {
            try {
                // Liste de tous les fichiers GeoJSON à charger
                const geoJsonFiles = [
                    { name: 'litige', url: '/litige.geojson', setter: setLitigeData },
                    { name: 'titre_reconstitue', url: '/titre_reconstitue.geojson', setter: setTitreReconstitueData },
                    { name: 'tf_etat', url: '/tf_etat.geojson', setter: setTfEtatData },
                    { name: 'tf_en_cours', url: '/tf_en_cours.geojson', setter: setTfEnCoursData },
                    { name: 'tf_demembres', url: '/tf_demembres.geojson', setter: setTfDemembresData },
                    // Nouvelles couches
                    { name: 'zone_inondable', url: '/zone_inondable.geojson', setter: setZoneInondableData },
                    { name: 'restriction', url: '/restriction.geojson', setter: setRestrictionData },
                    { name: 'enregistrement_individuel', url: '/enregistrement_individuel.geojson', setter: setEnregistrementIndividuelData },
                    { name: 'dpm', url: '/dpm.geojson', setter: setDpmData },
                    { name: 'dpl', url: '/dpl.geojson', setter: setDplData },
                    { name: 'air_proteges', url: '/air_proteges.geojson', setter: setAirProtegesData },
                    { name: 'aif', url: '/aif.geojson', setter: setAifData }
                ];

                // Charger tous les fichiers en parallèle
                const responses = await Promise.all(
                    geoJsonFiles.map(file =>
                        fetch(file.url)
                            .then(response => {
                                if (!response.ok) {
                                    console.warn(`Fichier ${file.name} non trouvé: ${file.url}`);
                                    return null;
                                }
                                return response.json();
                            })
                            .catch(error => {
                                console.warn(`Erreur chargement ${file.name}:`, error);
                                return null;
                            })
                    )
                );

                // Mettre à jour les états avec les données chargées
                responses.forEach((data, index) => {
                    if (data && geoJsonFiles[index].setter) {
                        geoJsonFiles[index].setter(data);
                    }
                });

                console.log('Chargement des fichiers GeoJSON terminé!');

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
    // Convertir les coordonnées GeoJSON UTM en WGS84
    const convertGeoJSONCoordinates = (geoJSONData) => {
        if (!geoJSONData || !geoJSONData.features) return null;

        const convertedFeatures = geoJSONData.features.map(feature => {
            try {
                // Vérifier si les coordonnées existent et ne sont pas vides
                if (!feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
                    return feature; // Retourner la feature inchangée si pas de coordonnées
                }

                const convertCoordinateArray = (coords) => {
                    return coords.map(coord => {
                        // Si c'est un tableau de coordonnées (ligne ou polygone)
                        if (Array.isArray(coord[0])) {
                            return convertCoordinateArray(coord);
                        } else {
                            // Prendre seulement les 2 premières valeurs (x, y) et ignorer z si présent
                            const [x, y] = coord;
                            // Conversion UTM -> WGS84
                            const converted = convertUTMtoLatLng(x, y);
                            return [converted.longitude, converted.latitude];
                        }
                    });
                };

                const convertedCoordinates = convertCoordinateArray(feature.geometry.coordinates);

                return {
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: convertedCoordinates
                    }
                };
            } catch (error) {
                console.error('Erreur conversion feature:', error, feature);
                return null; // Retourner null pour filtrer les features problématiques
            }
        }).filter(feature => feature !== null); // Filtrer les features null

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
            },

            // Nouveaux styles pour les nouvelles couches
            zoneInondable: {
                fillColor: '#00bcd4',
                weight: 2,
                opacity: 1,
                color: '#0097a7',
                dashArray: '5, 5',
                fillOpacity: 0.3
            },
            restriction: {
                fillColor: '#ff5722',
                weight: 3,
                opacity: 1,
                color: '#d84315',
                fillOpacity: 0.4
            },
            enregistrementIndividuel: {
                fillColor: '#8bc34a',
                weight: 2,
                opacity: 1,
                color: '#689f38',
                fillOpacity: 0.5
            },
            dpm: {
                color: '#2196f3',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 5'
            },
            dpl: {
                color: '#3f51b5',
                weight: 3,
                opacity: 0.8,
                dashArray: '8, 4'
            },
            airProteges: {
                fillColor: '#4caf50',
                weight: 3,
                opacity: 1,
                color: '#388e3c',
                fillOpacity: 0.3
            },
            aif: {
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
                                <p><strong>Titre Foncier:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                                <p><strong>Titre Foncier Aléa:</strong> ${feature.properties.tf_alea || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                    break;

                case 'tfEtat':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">🏛️ Titre Foncier État #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>Numéro Titre Foncier:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                                <p><strong>Surface:</strong> ${feature.properties.surface ? `${feature.properties.surface.toLocaleString()} m²` : 'N/A'}</p>
                                <p><strong>Titre Foncier Aléa:</strong> ${feature.properties.tf_alea || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                    break;

                case 'tfEnCours':
                    popupContent = `
                        <div class="p-2 max-w-sm">
                            <h4 class="font-bold text-lg mb-2">⏳ Titre Foncier en Cours #${feature.properties.id || 'N/A'}</h4>
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
                            <h4 class="font-bold text-lg mb-2">🏠 Titre Foncier Démembrés #${feature.properties.id || 'N/A'}</h4>
                            <div class="space-y-1 text-sm">
                                <p><strong>Numéro Titre Foncier:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                                <p><strong>Commune:</strong> ${feature.properties.Commune || 'Non spécifiée'}</p>
                                <p><strong>Titre Foncier Aléa:</strong> ${feature.properties.tf_alea || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                    break;

                case 'zoneInondable':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🌊 Zone Inondable</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Source:</strong> ${feature.properties.source || 'N/A'}</p>
                            <p><strong>Longueur:</strong> ${feature.properties.shape_leng ? `${feature.properties.shape_leng.toLocaleString()} m` : 'N/A'}</p>
                            <p><strong>Surface:</strong> ${feature.properties.shape_area ? `${feature.properties.shape_area.toLocaleString()} m²` : 'N/A'}</p>
                        </div>
                    </div>
                `;
                    break;

                case 'restriction':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🚫 Zone à Restriction</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Type:</strong> ${feature.properties.type || 'N/A'}</p>
                            <p><strong>Désignation:</strong> ${feature.properties.designation || feature.properties.designation_alea || 'N/A'}</p>
                            <p><strong>Commune:</strong> ${feature.properties.commune || 'N/A'}</p>
                            ${feature.properties.id ? `<p><strong>ID:</strong> ${feature.properties.id}</p>` : ''}
                        </div>
                    </div>
                `;
                    break;

                case 'enregistrementIndividuel':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🏠 Enregistrement Individuel</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Parcelle:</strong> ${feature.properties.CODE_PARCELLE || 'N/A'}</p>
                            <p><strong>Commune:</strong> ${feature.properties.COMMUNE || 'N/A'}</p>
                            <p><strong>Arrondissement:</strong> ${feature.properties.ARRONDISSEMENT || 'N/A'}</p>
                            <p><strong>Quartier:</strong> ${feature.properties.VILLAGE_QUARTIER || 'N/A'}</p>
                            <p><strong>Surface:</strong> ${feature.properties.SUPERFICIE ? `${feature.properties.SUPERFICIE} m²` : 'N/A'}</p>
                            <p><strong>Type:</strong> ${feature.properties['TYPE DE PARCELLE'] || 'N/A'}</p>
                            <p><strong>Droit:</strong> ${feature.properties['TYPE DE DROIT'] || 'N/A'}</p>
                        </div>
                    </div>
                `;
                    break;

                case 'dpm':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🌊 Domaine Public Maritime</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Type:</strong> ${feature.properties.type || 'Domaine Public Maritime'}</p>
                        </div>
                    </div>
                `;
                    break;

                case 'dpl':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🌊 Domaine Public Fluvial</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Couche:</strong> ${feature.properties.Layer || 'Domaine Public Fluvial'}</p>
                        </div>
                    </div>
                `;
                    break;

                case 'airProteges':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🛡️ Aire Protégée</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Désignation:</strong> ${feature.properties.designation || 'N/A'}</p>
                            <p><strong>Désignation Aléa:</strong> ${feature.properties.designation_alea || 'N/A'}</p>
                            ${feature.properties.id ? `<p><strong>ID:</strong> ${feature.properties.id}</p>` : ''}
                        </div>
                    </div>
                `;
                    break;

                case 'aif':
                    popupContent = `
                    <div class="p-2 max-w-sm">
                        <h4 class="font-bold text-lg mb-2">🏛️ AIF</h4>
                        <div class="space-y-1 text-sm">
                            <p><strong>Département:</strong> ${feature.properties.departement || 'N/A'}</p>
                            <p><strong>Commune:</strong> ${feature.properties.commune || 'N/A'}</p>
                            <p><strong>Arrondissement:</strong> ${feature.properties.arrondissement || 'N/A'}</p>
                            <p><strong>Numéro Titre Foncier:</strong> ${feature.properties.num_tf || 'N/A'}</p>
                            <p><strong>Titre Foncier Aléa:</strong> ${feature.properties.TF_alea || 'N/A'}</p>
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

    // Fonction pour calculer l'aire (algorithme de shoelace)
    const calculateArea = (coordinates) => {
        if (coordinates.length < 3) return 0;

        let area = 0;
        const n = coordinates.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += coordinates[i].longitude * coordinates[j].latitude;
            area -= coordinates[j].longitude * coordinates[i].latitude;
        }

        return Math.abs(area) / 2 * 111319.444 * 111319.444; // Conversion en m² approximative
    };

    // Convertir toutes les données GeoJSON
    const convertedLitigeData = litigeData ? convertGeoJSONCoordinates(litigeData) : null;
    const convertedTitreReconstitueData = titreReconstitueData ? convertGeoJSONCoordinates(titreReconstitueData) : null;
    const convertedTfEtatData = tfEtatData ? convertGeoJSONCoordinates(tfEtatData) : null;
    const convertedTfEnCoursData = tfEnCoursData ? convertGeoJSONCoordinates(tfEnCoursData) : null;
    const convertedTfDemembresData = tfDemembresData ? convertGeoJSONCoordinates(tfDemembresData) : null;

    const convertedZoneInondableData = zoneInondableData ? convertGeoJSONCoordinates(zoneInondableData) : null;
    const convertedRestrictionData = restrictionData ? convertGeoJSONCoordinates(restrictionData) : null;
    const convertedEnregistrementIndividuelData = enregistrementIndividuelData ? convertGeoJSONCoordinates(enregistrementIndividuelData) : null;
    const convertedDpmData = dpmData ? convertGeoJSONCoordinates(dpmData) : null;
    const convertedDplData = dplData ? convertGeoJSONCoordinates(dplData) : null;
    const convertedAirProtegesData = airProtegesData ? convertGeoJSONCoordinates(airProtegesData) : null;
    const convertedAifData = aifData ? convertGeoJSONCoordinates(aifData) : null;

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
        if (coords.length === 0) {
            console.log('Aucune coordonnée, centre par défaut');
            return [6.3703, 2.3912];
        }

        console.log('Calcul du centre pour les coordonnées:', coords);

        const lats = coords.map(coord => coord.latitude);
        const lngs = coords.map(coord => coord.longitude);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        console.log('Centre calculé:', centerLat, centerLng);
        return [centerLat, centerLng];
    };


    // Calculer les bounds de la parcelle
    const calculateBounds = (coords) => {
        if (coords.length === 0) return null;
        return L.latLngBounds(coords.map(c => [c.latitude, c.longitude]));
    };

    // Centrer la carte sur la parcelle (version manuelle)
    const centerOnParcelle = () => {
        centerOnParcelleWithMaxZoom();
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



    // const center = calculateCenter(coordonnees);
    const center = isLoading ? [6.3703, 2.3912] : calculateCenter(coordonnees);

    const polygonCoords = coordonnees.map(coord => [coord.latitude, coord.longitude]);
    // const convertedLitigeData = litigeData ? convertGeoJSONCoordinates(litigeData) : null;



    const exportPDF = () => {
        if (!parcelleData) return;

        const pdf = new jsPDF("p", "mm", "a4");

        // === Chargement et ajout du logo ===
        const addLogo = () => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = logo;

                img.onload = () => {
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const logoWidth = 40; // Largeur fixe pour le logo
                    const logoHeight = (img.height * logoWidth) / img.width; // Hauteur proportionnelle

                    // Position en haut à gauche
                    pdf.addImage(img, "PNG", 14, 10, logoWidth, logoHeight);
                    resolve(logoHeight);
                };

                img.onerror = () => {
                    console.warn("Logo non chargé");
                    resolve(0);
                };
            });
        };

        // === En-tête ===
        const addHeader = async (logoHeight) => {
            const pageWidth = pdf.internal.pageSize.getWidth();

            // Titre principal aligné à droite du logo
            pdf.setFontSize(18);
            pdf.setTextColor(0);
            pdf.text("Rapport de Parcelle", pageWidth / 2, 20, { align: "center" });

            // Sous-titre
            pdf.setFontSize(12);
            pdf.setTextColor(100);
            pdf.text(`Généré le : ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });

            // Ligne séparatrice
            pdf.setDrawColor(200);
            pdf.line(14, 35, pageWidth - 14, 35);

            return Math.max(40, 15 + logoHeight + 10); // Retourne la position Y de départ
        };

        let startY = 50;

        // === Image du levé ===
        const drawTable = (startY) => {
            pdf.setFontSize(14);
            pdf.setTextColor(0);
            pdf.text("Statut de la parcelle", 14, startY);

            startY += 5;

            const labels = {
                'enregistrement_individuel': 'Enregistrement Individuel',
                'litige': 'Litige en cours',
                'parcelles': 'Parcelles identifiées',
                'restriction': 'Restrictions applicables',
                'air_proteges': 'Aire protégée',
                'zone_inondable': 'Zone inondable',
                'dpm': 'Domaine Public Maritime',
                'dpl': 'Domaine Public Lagunaire',
                'tf_etat': 'Titre Foncier État',
                'tf_en_cours': "Titre Foncier en cours d'instruction",
                'tf_demembres': 'Titre Foncier démembrés',
                'titre_reconstitue': 'Titre reconstitué',
                'aif': "Association d'Intérêts Foncier"
            };

            // Préparation des données pour le tableau
            const rows = Object.entries(parcelleData.textualData).map(([key, value]) => {
                const label = labels[key] || key.replace(/_/g, " ").toUpperCase();
                const displayValue = value === "OUI" ? "Oui" : value === "NON" ? "Non" : value;
                return [label, displayValue];
            });

            autoTable(pdf, {
                startY: startY + 5,
                head: [["Critère", "Valeur"]],
                body: rows,
                theme: "striped",
                styles: { fontSize: 11 },
                headStyles: { fillColor: [0, 128, 0], textColor: 255 },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                bodyStyles: {
                    textColor: (data) => {
                        const val = data.row.raw[1];
                        if (val === "Oui") return [0, 128, 0];   // vert
                        if (val === "Non") return [200, 0, 0];   // rouge
                        return [0, 0, 200];                      // bleu
                    }
                }
            });

            // === Pied de page avec logo ===
            const addFooter = () => {
                const pageHeight = pdf.internal.pageSize.getHeight();

                // Ligne séparatrice
                pdf.setDrawColor(200);
                pdf.line(14, pageHeight - 20, pdf.internal.pageSize.getWidth() - 14, pageHeight - 20);

                // Texte du pied de page
                pdf.setFontSize(10);
                pdf.setTextColor(150);
                pdf.text("Rapport généré par l'ANDF", pdf.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: "center" });

                // Logo en bas à droite
                const img = new Image();
                img.src = logo;
                img.onload = () => {
                    const logoWidth = 15;
                    const logoHeight = (img.height * logoWidth) / img.width;
                    pdf.addImage(img, "PNG", pdf.internal.pageSize.getWidth() - 30, pageHeight - 18, logoWidth, logoHeight);
                };
            };

            addFooter();
        };

        // === Processus principal ===
        const generatePDF = async () => {
            try {
                // Ajouter le logo
                const logoHeight = await addLogo();

                // Ajouter l'en-tête
                startY = await addHeader(logoHeight);

                // Gérer l'image stockée si elle existe
                if (storedImage) {
                    const img = new Image();
                    img.src = storedImage;

                    img.onload = () => {
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const maxWidth = pageWidth - 60;
                        const maxHeight = 90;

                        let renderWidth = img.width;
                        let renderHeight = img.height;

                        // Redimension proportionnelle
                        if (renderWidth > maxWidth) {
                            const ratio = maxWidth / renderWidth;
                            renderWidth = maxWidth;
                            renderHeight *= ratio;
                        }
                        if (renderHeight > maxHeight) {
                            const ratio = maxHeight / renderHeight;
                            renderHeight = maxHeight;
                            renderWidth *= ratio;
                        }

                        const x = (pageWidth - renderWidth) / 2;
                        const y = startY;

                        pdf.addImage(img, "PNG", x, y, renderWidth, renderHeight);

                        startY = y + renderHeight + 15;
                        drawTable(startY);

                        // Sauvegarder le PDF
                        pdf.save("rapport-parcelle.pdf");
                    };
                } else {
                    drawTable(startY);
                    pdf.save("rapport-parcelle.pdf");
                }
            } catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
            }
        };

        generatePDF();
    };



    return (
        <div className="h-screen w-screen flex flex-col relative">
            {/* <Navbar /> */}

            {/* Boutons de contrôle */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => {
                            localStorage.removeItem("uploadedImage");
                            navigate("/start", { state: {}, replace: true });
                        }}
                        className="px-4 flex gap-2 cursor-pointer items-center py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <ArrowBigLeftDash />
                        <span>Retour</span>
                    </button>
                    {parcelleData && (
                        <div className="flex items-center gap-2">
                            <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                                <span className="text-green-700 font-medium">✓</span>
                                {/* <span className="text-green-600 text-sm">
                                    ({coordonnees.length} points)
                                </span> */}
                            </div>
                            {/* Bouton pour ouvrir le modal d'informations */}
                            <button
                                onClick={() => setIsInfoModalOpen(true)}
                                className="px-3 py-1 cursor-pointer bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                            >
                                <InfoIcon />
                                Détails
                            </button>
                        </div>
                    )}




                    {/* Checkboxes pour afficher/masquer les couches */}


                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="px-4 py-2 cursor-pointer bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                        <Layers />
                        {isSidebarOpen ? 'Masquer les couches' : 'Afficher les couches'}
                    </button>

                </div>
            </div>

            {/* Map */}
            <div className="flex-1 w-full">

                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600">⏳ Chargement de la carte...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={calculateCenter(coordonnees)}
                        zoom={200}
                        className="h-full w-full"
                        scrollWheelZoom={true}
                        whenCreated={(mapInstance) => {
                            mapRef.current = mapInstance;
                        }}
                    >
                        <LayersControl position="topright">
                            {/* OpenStreetMap classique */}
                            <BaseLayer checked name="Plan">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                            </BaseLayer>

                            {/* Satellite ESRI */}
                            <BaseLayer name="Satellite ESRI">
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
                                />
                            </BaseLayer>

                            {/* Topographique OpenTopoMap */}
                            <BaseLayer name="Topographique">
                                <TileLayer
                                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenTopoMap (CC-BY-SA)"
                                />
                            </BaseLayer>

                            {/* Carto Clair */}
                            <BaseLayer name="Carto Clair">
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution="&copy; CARTO"
                                />
                            </BaseLayer>

                            {/* Carto Dark */}
                            <BaseLayer name="Carto Dark">
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution="&copy; CARTO"
                                />
                            </BaseLayer>

                            {/* Stamen Terrain */}
                            <BaseLayer name="Stamen Terrain">
                                <TileLayer
                                    url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
                                    attribution="Map tiles by Stamen Design"
                                />
                            </BaseLayer>

                            {/* Stamen Toner */}
                            <BaseLayer name="Stamen Toner">
                                <TileLayer
                                    url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
                                    attribution="Map tiles by Stamen Design"
                                />
                            </BaseLayer>
                        </LayersControl>
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

                        {showZoneInondable && convertedZoneInondableData && (
                            <GeoJSON
                                data={convertedZoneInondableData}
                                style={() => getLayerStyle('zoneInondable')}
                                onEachFeature={onEachFeature('zoneInondable')}
                            />
                        )}

                        {showRestriction && convertedRestrictionData && (
                            <GeoJSON
                                data={convertedRestrictionData}
                                style={() => getLayerStyle('restriction')}
                                onEachFeature={onEachFeature('restriction')}
                            />
                        )}

                        {showEnregistrementIndividuel && convertedEnregistrementIndividuelData && (
                            <GeoJSON
                                data={convertedEnregistrementIndividuelData}
                                style={() => getLayerStyle('enregistrementIndividuel')}
                                onEachFeature={onEachFeature('enregistrementIndividuel')}
                            />
                        )}

                        {showDpm && convertedDpmData && (
                            <GeoJSON
                                data={convertedDpmData}
                                style={() => getLayerStyle('dpm')}
                                onEachFeature={onEachFeature('dpm')}
                            />
                        )}

                        {showDpl && convertedDplData && (
                            <GeoJSON
                                data={convertedDplData}
                                style={() => getLayerStyle('dpl')}
                                onEachFeature={onEachFeature('dpl')}
                            />
                        )}

                        {showAirProteges && convertedAirProtegesData && (
                            <GeoJSON
                                data={convertedAirProtegesData}
                                style={() => getLayerStyle('airProteges')}
                                onEachFeature={onEachFeature('airProteges')}
                            />
                        )}

                        {showAif && convertedAifData && (
                            <GeoJSON
                                data={convertedAifData}
                                style={() => getLayerStyle('aif')}
                                onEachFeature={onEachFeature('aif')}
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
                                        <h4 className="font-semibold text-lg mb-2">Parcelle chargée</h4>
                                        <p className="text-sm">Nombre de bornes: {coordonnees.length}</p>
                                        <p className="text-sm">Surface: {calculateArea(coordonnees).toFixed(2)} m²</p>

                                        {/* Afficher les données textuelles si disponibles */}
                                        {parcelleData && parcelleData.textualData && (
                                            <div className="mt-2 pt-2 border-t">
                                                <p className="text-sm font-medium">Statut:</p>
                                                <div className="text-xs space-y-1 mt-1">
                                                    {Object.entries(parcelleData.textualData).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span>{key}:</span>
                                                            <span className={`font-semibold ${value === "OUI" ? "text-green-600" : "text-red-600"}`}>
                                                                {value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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
                                            className="mt-2 px-3 py-1 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm w-full"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                )}
            </div>


            {/* Modal d'informations de la parcelle */}
            {isInfoModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-start z-[1000] p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md ml-4 max-h-[90vh] overflow-hidden">
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">📋 Informations de la parcelle</h3>
                                <button
                                    onClick={() => setIsInfoModalOpen(false)}
                                    className="p-1 cursor-pointer hover:bg-gray-100 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                            <button
                                onClick={exportPDF}
                                className="flex cursor-pointer gap-2 items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                            >
                                <Download size={16} />
                                <span>Exporter le rapport</span>
                            </button>

                            {parcelleData && parcelleData.textualData && (
                                <div className="space-y-4" id="rapport-parcelle" >


                                    {/* Données textuelles */}
                                    <div>
                                        <h4 className="font-semibold my-3"> Parcelle</h4>
                                        <div className="space-y-2">
                                            {storedImage ? (
                                                <img
                                                    src={storedImage}
                                                    alt="Image levé"
                                                    className="max-w-md w-full rounded shadow-md mb-6"
                                                />
                                            ) : (
                                                <p className="text-gray-500">Aucune image chargée</p>
                                            )}
                                            <h4 className="font-semibold mb-3">Statut de la parcelle</h4>


                                            {Object.entries(parcelleData.textualData).map(([key, value]) => {
                                                // Mapping des clés techniques vers des libellés compréhensibles
                                                const labels = {
                                                    'enregistrement_individuel': 'Enregistrement Individuel',
                                                    'litige': 'Litige en cours',
                                                    'parcelles': 'Parcelles identifiées',
                                                    'restriction': 'Restrictions applicables',
                                                    'air_proteges': 'Aire protégée',
                                                    'zone_inondable': 'Zone inondable',
                                                    'dpm': 'Domaine Public Maritime',
                                                    'dpl': 'Domaine Public Fluvial',
                                                    'tf_etat': 'Titre Foncier État',
                                                    'tf_en_cours': 'Titre Foncier en cours d\'instruction',
                                                    'tf_demembres': 'Titre Foncier démembrés',
                                                    'titre_reconstitue': 'Titre reconstitué',
                                                    'aif': 'Association d’Intérêts Foncier'
                                                };

                                                const getIcon = (value) => {
                                                    if (value === "OUI") return "✅";
                                                    if (value === "NON") return "❌";
                                                    return "ℹ️";
                                                };

                                                const getStatusText = (value) => {
                                                    if (value === "OUI") return "Oui";
                                                    if (value === "NON") return "Non";
                                                    return value;
                                                };

                                                return (
                                                    <div key={key} className="flex justify-between items-center p-1 bg-white border rounded-lg shadow-xm">
                                                        <div className="flex items-center gap-3">
                                                            {/* <span className="text-lg">{getIcon(value)}</span> */}
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700 block">
                                                                    {labels[key] || key.replace(/_/g, ' ').toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${value === "OUI"
                                                            ? "bg-green-100 text-green-800 border border-green-200"
                                                            : value === "NON"
                                                                ? "bg-red-100 text-red-800 border border-red-200"
                                                                : "bg-blue-100 text-blue-800 border border-blue-200"
                                                            }`}>
                                                            {getStatusText(value)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t">
                                        <button
                                            onClick={exportPDF}
                                            className="flex gap-2 cursor-pointer items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                                        >
                                            <Download size={16} />
                                            <span>Exporter le rapport</span>
                                        </button>

                                        <button
                                            onClick={() => setIsInfoModalOpen(false)}
                                            className="flex-1 cursor-pointer px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!parcelleData && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Aucune donnée de parcelle disponible</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Menu latéral */}
            <div className={`
                    fixed top-0 right-0 h-full  bg-white shadow-xl z-[1000] transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                    w-100
                `}>
                <div className="p-4 h-full flex flex-col">
                    {/* En-tête du menu */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <h3 className="text-lg font-semibold">📋 Couches cartographiques</h3>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1 cursor-pointer hover:bg-gray-100 rounded"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Contenu défilable des couches */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-3">
                            {/* Groupes de couches */}
                            <LayerGroup title="📊 Données principales">
                                {litigeData && (
                                    <LayerCheckbox
                                        label="Litiges"
                                        checked={showLitige}
                                        onChange={setShowLitige}
                                        color="orange"
                                    />
                                )}
                                {titreReconstitueData && (
                                    <LayerCheckbox
                                        label="Titres Reconstitués"
                                        checked={showTitreReconstitue}
                                        onChange={setShowTitreReconstitue}
                                        color="green"
                                    />
                                )}
                                {tfEtatData && (
                                    <LayerCheckbox
                                        label="Titre Foncier État"
                                        checked={showTfEtat}
                                        onChange={setShowTfEtat}
                                        color="blue"
                                    />
                                )}
                                {tfEnCoursData && (
                                    <LayerCheckbox
                                        label="Titre Foncier en Cours"
                                        checked={showTfEnCours}
                                        onChange={setShowTfEnCours}
                                        color="yellow"
                                    />
                                )}
                                {tfDemembresData && (
                                    <LayerCheckbox
                                        label="Titre Foncier Démembrés"
                                        checked={showTfDemembres}
                                        onChange={setShowTfDemembres}
                                        color="purple"
                                    />
                                )}
                            </LayerGroup>

                            <LayerGroup title="🌍 Données environnementales">
                                {zoneInondableData && (
                                    <LayerCheckbox
                                        label="Zones Inondables"
                                        checked={showZoneInondable}
                                        onChange={setShowZoneInondable}
                                        color="cyan"
                                    />
                                )}
                                {airProtegesData && (
                                    <LayerCheckbox
                                        label="Aires Protégées"
                                        checked={showAirProteges}
                                        onChange={setShowAirProteges}
                                        color="green"
                                    />
                                )}
                            </LayerGroup>

                            <LayerGroup title="⚖️ Données réglementaires">
                                {restrictionData && (
                                    <LayerCheckbox
                                        label="Restrictions"
                                        checked={showRestriction}
                                        onChange={setShowRestriction}
                                        color="red"
                                    />
                                )}
                                {dpmData && (
                                    <LayerCheckbox
                                        label="Domaine Public Maritime"
                                        checked={showDpm}
                                        onChange={setShowDpm}
                                        color="blue"
                                    />
                                )}
                                {dplData && (
                                    <LayerCheckbox
                                        label="Domaine Public Fluvial"
                                        checked={showDpl}
                                        onChange={setShowDpl}
                                        color="indigo"
                                    />
                                )}
                            </LayerGroup>

                            <LayerGroup title="🏠 Données cadastrales">
                                {enregistrementIndividuelData && (
                                    <LayerCheckbox
                                        label="Enregistrements Individuels"
                                        checked={showEnregistrementIndividuel}
                                        onChange={setShowEnregistrementIndividuel}
                                        color="lightGreen"
                                    />
                                )}
                                {aifData && (
                                    <LayerCheckbox
                                        label="AIF"
                                        checked={showAif}
                                        onChange={setShowAif}
                                        color="purple"
                                    />
                                )}
                            </LayerGroup>
                        </div>
                    </div>

                    {/* Boutons d'action en bas du menu */}
                    <div className="pt-4 border-t mt-auto">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowLitige(true);
                                    setShowTitreReconstitue(true);
                                    setShowTfEtat(true);
                                    setShowTfEnCours(true);
                                    setShowTfDemembres(true);
                                    setShowZoneInondable(true);
                                    setShowRestriction(true);
                                    setShowEnregistrementIndividuel(true);
                                    setShowDpm(true);
                                    setShowDpl(true);
                                    setShowAirProteges(true);
                                    setShowAif(true);
                                }}
                                className="flex-1 cursor-pointer px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                            >
                                ✅ Tout afficher
                            </button>
                            <button
                                onClick={() => {
                                    setShowLitige(false);
                                    setShowTitreReconstitue(false);
                                    setShowTfEtat(false);
                                    setShowTfEnCours(false);
                                    setShowTfDemembres(false);
                                    setShowZoneInondable(false);
                                    setShowRestriction(false);
                                    setShowEnregistrementIndividuel(false);
                                    setShowDpm(false);
                                    setShowDpl(false);
                                    setShowAirProteges(false);
                                    setShowAif(false);
                                }}
                                className="flex-1 cursor-pointer px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                            >
                                ❌ Tout masquer
                            </button>
                        </div>


                        {/* Légendes en bas de l'écran */}
                        <div className="bg-white border-t border-gray-200 p-3">
                            <div className="flex flex-wrap gap-4 justify-center">
                                <LegendItem color="orange" label="Litiges" />
                                <LegendItem color="green" label="Titres Reconstitués" />
                                <LegendItem color="blue" label="Titre Foncier État" />
                                <LegendItem color="yellow" label="Titre Foncier en Cours" />
                                <LegendItem color="purple" label="Titre Foncier Démembrés" />
                                <LegendItem color="cyan" label="Zones Inondables" />
                                <LegendItem color="red" label="Restrictions" />
                                <LegendItem color="lightGreen" label="Enregistrements" />
                                <LegendItem color="blue" label="DPM" lineStyle />
                                <LegendItem color="indigo" label="DPL" lineStyle />
                                <LegendItem color="green" label="Aires Protégées" />
                                <LegendItem color="purple" label="AIF" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Overlay pour fermer le menu en cliquant à côté */}
            {/* {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[200]"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )} */}


            {/* Légendes en bas de l'écran */}




            {/* Modale */}
            {
                isModalOpen && (
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
                )
            }
        </div >
    );
};



// Composant légende amélioré
const LegendItem = ({ color, label, lineStyle = false }) => {
    const colorStyles = {
        orange: 'bg-orange-500 border-orange-700',
        green: 'bg-green-500 border-green-700',
        blue: 'bg-blue-500 border-blue-700',
        yellow: 'bg-yellow-500 border-yellow-700',
        purple: 'bg-purple-500 border-purple-700',
        cyan: 'bg-cyan-500 border-cyan-700',
        red: 'bg-red-500 border-red-700',
        lightGreen: 'bg-lime-500 border-lime-700',
        indigo: 'bg-indigo-500 border-indigo-700'
    };

    return (
        <div className="flex items-center gap-1">
            {lineStyle ? (
                <div className={`w-6 h-0.5 ${colorStyles[color]}`}></div>
            ) : (
                <div className={`w-3 h-3 border ${colorStyles[color]}`}></div>
            )}
            <span className="text-xs text-gray-700">{label}</span>
        </div>
    );
};

// Composant pour grouper les couches
const LayerGroup = ({ title, children }) => (
    <div className="border rounded-md">
        <div className=" px-2 py-1 border-b">
            <h4 className="font-semibold text-xs">{title}</h4>
        </div>
        <div className="p-1 space-y-0.5">
            {children}
        </div>
    </div>
);

// Composant LayerCheckbox modifié pour le menu
const LayerCheckbox = ({ label, checked, onChange, color }) => {
    const colorClasses = {
        orange: 'border-orange-200 bg-orange-50',
        green: 'border-green-200 bg-green-50',
        blue: 'border-blue-200 bg-blue-50',
        yellow: 'border-yellow-200 bg-yellow-50',
        purple: 'border-purple-200 bg-purple-50',
        cyan: 'border-cyan-200 bg-cyan-50',
        red: 'border-red-200 bg-red-50',
        lightGreen: 'border-lime-200 bg-lime-50',
        indigo: 'border-indigo-200 bg-indigo-50'
    };

    return (
        <label className={`flex items-center gap-1.5 p-1 rounded border transition-colors cursor-pointer ${colorClasses[color]} ${checked ? 'opacity-100' : 'opacity-60'}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded focus:ring-1"
            />
            <span className="text-sm font-medium">
                {label}
            </span>
        </label>
    );
};

// Composant simple pour l'icône info
const InfoIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);


export default ParcelleMap;