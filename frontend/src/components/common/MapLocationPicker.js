import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Utensils } from 'lucide-react';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom restaurant icon using the same style as OrderTracking.js
const restaurantIcon = L.divIcon({
    html: `<div style="color: #9D174D; background: white; border-radius: 50%; padding: 4px; border: 2px solid #9D174D; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2"/>
        <path d="M18.5 15a2.5 2.5 0 0 0 0 5H23"/>
        <path d="M21 22v-2"/>
      </svg>
    </div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const containerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = {
    lat: 31.5204, // Default to Pakistan center
    lng: 74.3587
};

const MapEvents = ({ onLocationChange }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationChange({ lat, lng });
        },
    });
    return null;
};

const MapLocationPicker = ({ location, onLocationChange, readOnly = false, deliveryRadius = 0 }) => {
    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <MapContainer
                center={location || defaultCenter}
                zoom={13}
                style={containerStyle}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {!readOnly && <MapEvents onLocationChange={onLocationChange} />}
                {location && (
                    <>
                        <Marker
                            position={location}
                            draggable={!readOnly}
                            icon={readOnly ? restaurantIcon : new L.Icon.Default()}
                            eventHandlers={{
                                dragend: (e) => {
                                    if (readOnly) return;
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    onLocationChange({
                                        lat: position.lat,
                                        lng: position.lng
                                    });
                                },
                            }}
                        />
                        {readOnly && deliveryRadius > 0 && (
                            <Circle 
                                center={location}
                                radius={deliveryRadius * 1000} // Convert km to meters
                                pathOptions={{ 
                                    fillColor: '#9D174D',
                                    fillOpacity: 0.1,
                                    color: '#9D174D',
                                    weight: 1
                                }}
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </Box>
    );
};

export default MapLocationPicker;