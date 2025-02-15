import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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

const MapLocationPicker = ({ location, onLocationChange }) => {
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
                <MapEvents onLocationChange={onLocationChange} />
                {location && (
                    <Marker
                        position={location}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const marker = e.target;
                                const position = marker.getLatLng();
                                onLocationChange({
                                    lat: position.lat,
                                    lng: position.lng
                                });
                            },
                        }}
                    />
                )}
            </MapContainer>
        </Box>
    );
};

export default MapLocationPicker;