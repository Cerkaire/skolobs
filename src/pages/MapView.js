import L from 'leaflet';
import React, { useEffect, useState, useRef, useContext } from 'react';
import Card from '@mui/material/Card';
import { MapContainer, TileLayer, Marker, LayersControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Typography, Box, Fab } from '@mui/material';
import { MainContext } from '../context/MainContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import userIconUrl from '../icons/position.png';
import clickIconUrl from '../icons/observateur.png';

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
    const { setPhase, clickedPosition, setClickedPosition } = useContext(MainContext);
    const userPositionRef = useRef(null);
    const mapRef = useRef(null);
    const [mapCenter, setMapCenter] = useState([48.505, -4.29]);
    const [userAccuracy, setUserAccuracy] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [recenter, setRecenter] = useState(false); // Nouvel état pour recentrer

    const handleValidateClick = () => {
        if (clickedPosition) {
            setPhase('fiche');
        } else {
            alert('Veuillez sélectionner une position sur la carte.');
        }
    };

    const triggerRecenter = () => {
        setRecenter((prev) => !prev);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Card sx={{ height: 'auto', width: '100%' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: '450px', width: '100%' }}
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
                    </LayersControl>
                    <LocationMarker clickedPosition={clickedPosition} setClickedPosition={setClickedPosition} />
                    <LocationUser
                        userPositionRef={userPositionRef}
                        setMapCenter={setMapCenter}
                        setClickedPosition={setClickedPosition}
                        setUserAccuracy={setUserAccuracy}
                        setCurrentLocation={setCurrentLocation}
                        recenter={recenter} // Passe l'état de recentrage
                    />
                </MapContainer>

                <Box sx={{ padding: 2 }}>
                    <Typography variant="body1">
                        {clickedPosition
                            ? `Coordonnées sélectionnées: ${clickedPosition.lat.toFixed(5)}, ${clickedPosition.lng.toFixed(5)}`
                            : `Position: ${currentLocation ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}` : 'Attente GPS...'}`}
                    </Typography>
                    <Typography variant="body1">
                        {userAccuracy ? `Précision: ${userAccuracy.toFixed(2)} m` : 'Précision: N/A'}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleValidateClick}>
                        Valider
                    </Button>
                </Box>
            </Card>
            <Fab
                color="primary"
                aria-label="recenter"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
                onClick={triggerRecenter} // Déclenche le recentrage
            >
                <MyLocationIcon />
            </Fab>
        </Box>
    );
}

function LocationUser({ userPositionRef, setMapCenter, setClickedPosition, setUserAccuracy, setCurrentLocation, recenter }) {
    const map = useMapEvents({
        locationfound(e) {
            userPositionRef.current = e.latlng;
            setMapCenter(e.latlng);
            setClickedPosition(e.latlng);
            setUserAccuracy(e.accuracy);
            setCurrentLocation(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.locate();
    }, [map, recenter]); // Déclenche la recherche de position lors du changement de `recenter`

    return userPositionRef.current ? (
        <Marker position={userPositionRef.current} icon={userIcon} />
    ) : null;
}

function LocationMarker({ clickedPosition, setClickedPosition }) {
    useMapEvents({
        click(e) {
            setClickedPosition(e.latlng);
        },
    });

    return clickedPosition ? (
        <Marker key="clickedMarker" position={clickedPosition} icon={clickIcon} />
    ) : null;
}
