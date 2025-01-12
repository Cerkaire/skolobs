import L from 'leaflet';
import leafletPip from 'leaflet-pip';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, useMapEvents, useMap, LayerGroup, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Typography, Box, Fab, Card, DialogTitle, DialogContent, Dialog, DialogActions, Alert, Grid, List, TextField, ListItem, ListItemButton } from '@mui/material';
import { MainContext } from '../context/MainContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import userIconUrl from '../icons/position.png';
import clickIconUrl from '../icons/observateur.png';
import proj4 from 'proj4';
import { db } from '../db/db';
import FmdGoodIcon from '@mui/icons-material/FmdGood';

// Définir les systèmes de projection
const lambert93 = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

const wgs84 = 'EPSG:4326';

const { BaseLayer } = LayersControl;

const userIcon = new L.Icon({
    iconUrl: userIconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const clickIcon = new L.Icon({
    iconUrl: clickIconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

export default function MapView() {
    const { setPhase, clickedPosition, setClickedPosition, selectedSite, setSelectedSite, newSite, setNewsite } = useContext(MainContext);
    const userPositionRef = useRef(null);
    const mapRef = useRef(null);
    const [mapCenter, setMapCenter] = useState([48.5123, -4.2734]);
    const [userAccuracy, setUserAccuracy] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [recenter, setRecenter] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [openErrorDialog, setOpenErrorDialog] = useState(false);
    const [isInsidePolygon, setIsInsidePolygon] = useState(false);
    const [polygonLayer, setPolygonLayer] = useState(null);
    const markersLayerRef = useRef(L.layerGroup());
    const [proximitySites, setproximitySites] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredSites, setFilteredSites] = useState([]);
    const [allSites, setAllSites] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Contrôle de la modale
    const [multiPolygonData, setMultiPolygonData] = useState([]);

    const handleValidateNewSite = () => {
        if (clickedPosition) {
            // Ouvre la modale pour saisir le nom du site
            setIsDialogOpen(true);
        } else {
            alert("Veuillez sélectionner une position sur la carte.");
        }
    };

    const handleConfirm = () => {
        if (newSite.trim() === "") {
            alert("Veuillez entrer un nom pour le site.");
            return;
        }
        // Met à jour la propriété `site` de l'objet `selectedSite`
        setSelectedSite((prevSelectedSite) => ({
            ...prevSelectedSite, // Copie les autres propriétés de selectedSite
            site: newSite,       // Modifie uniquement la propriété `site`
            lat: clickedPosition.lat,
            lng: clickedPosition.lng,
            newsite: true,
            idsite: null,
            idcoord: null
        }));

        setIsDialogOpen(false); // Ferme la modale
        setPhase("fiche"); // Change la vue après confirmation
    };

    const handleCancel = () => {
        setIsDialogOpen(false); // Ferme la modale sans valider
    };
    const triggerRecenter = () => {
        setRecenter((prev) => !prev);

    };

    // Charger tous les sites au chargement du composant
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const ttsites = await db.site.toArray(); // Récupérer tous les sites depuis la base
                setAllSites(ttsites); // Stocker tous les sites dans l'état
                setFilteredSites(ttsites); // Initialiser les résultats filtrés avec tous les sites
            } catch (error) {
                console.error('Erreur lors du chargement des sites :', error);
            }
        };

        fetchSites();
    }, [db]);

    // Gérer les changements dans le champ de recherche
    const handleSearchChange = (e) => {
        const value = e.target.value; // Récupérer la valeur tapée
        setSearchValue(value); // Mettre à jour l'état de recherche

        // Filtrer les sites en fonction de la recherche
        const filtered = allSites.filter((site) =>
            site.site.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSites(filtered); // Mettre à jour les résultats filtrés
    };


    // Corrige l'icône par défaut si elle apparaît vide
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png',
    });

    //validation des coordonées
    const handleValidateClick = () => {
        if (clickedPosition) {
            setPhase('fiche');
        } else {
            alert('Veuillez sélectionner une position sur la carte.');
        }
    };

    //Chargement des polygones de communes
    const fetchPolygons = async () => {
        try {
            const polygons = await db.commune.toArray();

            const allFeatures = polygons.map((entry) => {
                const rawCoordinates = JSON.parse(entry.geojson);

                const transformedCoordinates = rawCoordinates.map((polygon) =>
                    polygon.map((coord) => proj4(lambert93, wgs84, coord))
                );

                return {
                    type: 'Feature',
                    properties: {
                        name: entry.commune,
                        codecom: entry.codecom,
                    },
                    geometry: {
                        type: entry.poly,
                        coordinates: transformedCoordinates,
                    },
                };
            });

            const combinedLayer = L.geoJSON(
                { type: 'FeatureCollection', features: allFeatures },
                {
                    style: {
                        color: 'green',
                        weight: 1,
                        fillColor: '#ffffff',
                        fillOpacity: 0.05,
                    },
                }
            );

            return combinedLayer;
        } catch (error) {
            console.error('Erreur lors du chargement des polygones depuis Dexie:', error);
            return null;
        }
    };

    //Initailisation du chargement des communes a la création de la vue
    useEffect(() => {
        const loadPolygonsOnce = async () => {
            const combinedLayer = await fetchPolygons();

            setPolygonLayer(combinedLayer);
        };

        loadPolygonsOnce();
    }, []);

    //pour le chargement de la couhce de markers sites
    useEffect(() => {
        if (mapRef.current && markersLayerRef.current) {
            markersLayerRef.current.addTo(mapRef.current);
        }
    }, []);

    //vérif du click dans les polygones
    const checkPositionInPolygon = (latlng) => {
        if (!polygonLayer) return false;
        const isInside = leafletPip.pointInLayer([latlng.lng, latlng.lat], polygonLayer);

        return isInside.length > 0;
    };

    //vérification et voir si ya des sites autour 
    const handleMapClick = async (latlng) => {
        setSelectedSite(null);
        setproximitySites(false);

        // Vérifiez si le point est dans le polygone
        const isInside = await checkPositionInPolygon(latlng);
        if (!isInside) {
            setIsInsidePolygon(false);
            setOpenErrorDialog(true); // Affiche une erreur si le clic est hors des polygones
            return;
        }

        setIsInsidePolygon(true);
        setClickedPosition(latlng);

        // Rayon pour la vérification (100 mètres)
        const radius = 100;

        // Effacez les anciens marqueurs
        markersLayerRef.current.clearLayers();

        // Récupérez les points de la base de données
        try {
            const allSites = await db.site.toArray(); // Récupérer tous les sites
            const pointsInCircle = allSites.filter((site) => {

                const siteLatLng = L.latLng(parseFloat(site.lat), parseFloat(site.lng));
                const centerLatLng = L.latLng(latlng.lat, latlng.lng);
                return centerLatLng.distanceTo(siteLatLng) <= radius; // Filtrer les points dans le rayon

            });


            // Ajoutez les nouveaux marqueurs
            pointsInCircle.forEach((site) => {

                const lat = parseFloat(site.lat);
                const lng = parseFloat(site.lng);

                if (!isNaN(lat) && !isNaN(lng)) {

                    const marker = L.marker([lat, lng], {
                        title: site.site,
                    });

                    // Rendre le marqueur cliquable
                    marker.on('click', () => {
                        setClickedPosition({ lat, lng }); // Passez simplement les coordonnées
                        setSelectedSite(site)
                        setproximitySites(false)
                    });

                    // Ajouter un popup (facultatif)
                    marker.bindPopup(`<b>${site.site}</b>`);

                    // Ajouter le marqueur à la couche
                    marker.addTo(markersLayerRef.current);
                    setproximitySites(true)
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des sites:', error);
        }
    };

    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    // Charger les données geojson de la base Dexie
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await db.geojson.toArray(); // Récupère les données depuis Dexie

                if (data.length > 0) {
                    // Appliquer la fonction de flattening
                    const flattenedData = flattenGeoJson(data);

                    // Stocker les données aplaties dans l'état
                    setMultiPolygonData(flattenedData);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données Dexie:', error);
            }
        };

        fetchData();
    }, []);

    // Transformer les données pour qu'elles soient au bon format pour React-Leaflet
    const flattenGeoJson = (data) => {
        return data.map(polygonArray => {
            // Pour chaque polygone, on a plusieurs sous-tableaux à aplatir
            return polygonArray.reduce((acc, innerArray) => {
                // On fusionne toutes les coordonnées de tous les sous-tableaux
                return [...acc, ...innerArray];
            }, []);
        });
    };

    const polyOptions = {
        color: 'green',  // couleur du bord
        weight: 3,        // largeur du bord (en pixels)
        opacity: 0.7,     // opacité du bord
        fillOpacity: 0,     // opacité du remplissage
    };


    function Legend({ clickedPosition }) {
        const map = useMap();

        useEffect(() => {
            const legend = L.control({ position: 'bottomleft' });

            legend.onAdd = () => {
                const div = L.DomUtil.create('div', 'info legend');
                div.innerHTML = `
                <div style="
                    background-color: rgba(255, 255, 255, 0.91);
                    padding: 2px;
                    border-radius: 2px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    color: #333;
                ">
                    <p style="margin: 2px 0;"><b>Lat:</b> ${clickedPosition?.lat?.toFixed(4) || '-'}</p>
                    <p style="margin: 2px 0;"><b>Lng:</b> ${clickedPosition?.lng?.toFixed(4) || '-'}</p>
                    <p style="margin: 2px 0;"> Précision GPS: ${userAccuracy?.toFixed(0) || '-'} m</p>
                        
                </div>
            `;
                return div;
            };

            legend.addTo(map);

            return () => {
                map.removeControl(legend); // Nettoyez la légende si le composant est démonté
            };
        }, [map, clickedPosition]);

        return null;
    }

    const handleSiteSelect = (site) => {
        setSearchValue(site.site); // Met à jour le champ de recherche avec le nom du site
        setSelectedSite(site); // Met à jour l'état du site sélectionné
        setFilteredSites([]); // Ferme la liste déroulante
        setClickedPosition([site.lat, site.lng]); // Met à jour la position cliquée
    };

    return (
        <Box sx={{ width: '100%', padding: 0, paddingTop: 1 }}>
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>Conseils d'utilisation</DialogTitle>
                <DialogContent>
                    <p><MyLocationIcon /> Cliquez pour recentrer la carte sur votre position </p>
                    <p>Cliquer sur la carte pour définir le lieu de l'observation</p>
                    <p><FmdGoodIcon />Vous pouvez choisir un site à proximité en cliquant dessus. Il est toujours préférable d'utiliser les sites pré-enregistés</p>
                    <p>Lors de la validation vous pouvez choisir d'enregister le site pour pouvoir le réutiliser plus tard</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Fermer</Button>
                </DialogActions>
            </Dialog>

            <Card sx={{ height: '90vh', width: '100%' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: '60vh', width: '100%' }}
                    whenCreated={(mapInstance) => {
                        mapRef.current = mapInstance;
                    }}
                >
                    <LayersControl position="topright">
                        <BaseLayer checked name="OpenStreetMap Topographic">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            />
                        </BaseLayer>
                        <BaseLayer name="Ortho Imagery">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://data.geopf.fr/tms/1.0.0/ORTHOIMAGERY.ORTHOPHOTOS/{z}/{x}/{y}.jpeg"
                            />
                        </BaseLayer>
                        <LayersControl.Overlay checked name="Sites">
                            <LayerGroup ref={markersLayerRef} />
                        </LayersControl.Overlay>
                    </LayersControl>
                    <Legend clickedPosition={clickedPosition} />
                    {/* Affichage du MultiPolygon */}
                    {multiPolygonData.length > 0 &&
                        multiPolygonData.map((polygon, index) => (
                            <Polygon key={index} positions={polygon} pathOptions={polyOptions} />
                        ))}
                    <LocationMarker
                        clickedPosition={clickedPosition}
                        setClickedPosition={setClickedPosition}
                        handleMapClick={handleMapClick}
                    />
                    <LocationUser
                        userPositionRef={userPositionRef}
                        setMapCenter={setMapCenter}
                        setClickedPosition={setClickedPosition}
                        setUserAccuracy={setUserAccuracy}
                        setCurrentLocation={setCurrentLocation}
                        recenter={recenter}
                        selectedSite={selectedSite}
                        checkPositionInPolygon={checkPositionInPolygon}
                        handleMapClick={handleMapClick}
                    />
                </MapContainer>

                <Box sx={{ padding: 2 }}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        {/* Bloc pour le site sélectionné */}
                        {selectedSite &&
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    Site sélectionné : {selectedSite ? selectedSite.site : "Aucun"}
                                </Typography>
                            </Grid>
                        }
                        {/* Boutons de validation */}
                        {!selectedSite && clickedPosition && isInsidePolygon && (
                            <Grid item xs={6}>
                                <Button variant="contained" color="secondary" onClick={handleValidateNewSite} fullWidth>
                                    <Typography fontSize={12}>Valider et créer un site</Typography>
                                </Button>
                            </Grid>
                        )}
                        {isInsidePolygon && (
                            <Grid item xs={6}>
                                <Button variant="contained" color="primary" onClick={handleValidateClick} fullWidth>
                                    Valider
                                </Button>
                            </Grid>
                        )}
                        {/* Bloc pour l'alerte */}
                        <Grid item xs={12}>
                            {proximitySites && (
                                <Alert severity="info">
                                    Il y a des sites pré-enregistrés à proximité, n'hésitez pas à cliquer dessus s'ils correspondent à la localisation de votre observation.
                                </Alert>
                            )}
                        </Grid>
                    </Grid>

                </Box>
                <Box sx={{ position: 'relative', width: '80%' }}>
                    <TextField
                        label="Rechercher un site"
                        value={searchValue}
                        onChange={handleSearchChange}
                        fullWidth
                        margin="normal"
                    />
                    {filteredSites.length > 0 && searchValue && (
                        <List
                            sx={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                right: 0,
                                maxHeight: 200,
                                overflowY: 'auto',
                                background: 'white',
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                borderRadius: '4px',
                                zIndex: 10,
                                animation: 'slideUp 0.3s ease-in-out',
                            }}
                        >
                            {filteredSites.map((site, index) => (
                                <ListItem key={index} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSiteSelect(site)}
                                    >
                                        <Typography>{site.site}</Typography>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}

                </Box>
            </Card >
            <Fab color="primary" aria-label="help" onClick={handleOpenDialog} size="small"
                style={{ position: 'fixed', bottom: '45%', right: 16 }}>
                <HelpOutlineIcon />
            </Fab>
            <Fab
                color="primary" aria-label="recenter"
                onClick={triggerRecenter}
                style={{ position: 'fixed', bottom: '35%', right: 16 }}
            >
                <MyLocationIcon />
            </Fab>

            <Dialog open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}>
                <DialogTitle>Erreur de position</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Votre position est en dehors de l'emprise de la base de données.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenErrorDialog(false)}>Fermer</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={isDialogOpen} onClose={handleCancel}>
                <DialogTitle>Nom du Nouveau Site</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nom du site"
                        fullWidth
                        value={newSite}
                        onChange={(e) => setNewsite(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="secondary">
                        Annuler
                    </Button>
                    <Button onClick={handleConfirm} color="primary">
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >


    );
}


function LocationUser({
    userPositionRef,
    setMapCenter,
    setClickedPosition,
    setUserAccuracy,
    setCurrentLocation,
    recenter,
    selectedSite,
    checkPositionInPolygon,
    handleMapClick
}) {
    const map = useMapEvents({
        locationfound(e) {
            userPositionRef.current = e.latlng;
            setMapCenter(e.latlng);
            setClickedPosition(e.latlng);
            setUserAccuracy(e.accuracy);
            setCurrentLocation(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            checkPositionInPolygon(e.latlng);
            handleMapClick(e.latlng);
        },
        locationerror() {
            alert("Impossible de récupérer votre position. Vérifiez vos paramètres de localisation.");
        }
    });

    useEffect(() => {
        if (recenter) {
            userPositionRef.current = null;
            map.locate({ setView: true, maxZoom: 15 });

        }
    }, [map, recenter]);


    useEffect(() => {
        if (selectedSite) {
            userPositionRef.current = null;
            map.flyTo([selectedSite.lat, selectedSite.lng], 15);
        }
    }, [map, selectedSite]);


    return userPositionRef.current ? (

        <Marker position={userPositionRef.current} icon={userIcon} />
    ) : null;
}


function LocationMarker({ clickedPosition, handleMapClick }) {
    // Utilisation de useMapEvents pour gérer les clics sur la carte
    useMapEvents({
        click(e) {
            // Appelle la fonction handleMapClick avec les coordonnées du clic
            handleMapClick(e.latlng); // Appel de la fonction de gestion de clic
        },
    });

    // Affiche le marqueur si une position a été cliquée
    return clickedPosition ? (
        <Marker key="clickedMarker" position={clickedPosition} icon={clickIcon} />
    ) : null;
}



