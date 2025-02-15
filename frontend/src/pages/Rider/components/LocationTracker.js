import { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { updateRiderLocation } from '../../../services/api';

const LocationTracker = () => {
    const [error, setError] = useState(null);
    const [watchId, setWatchId] = useState(null);

    useEffect(() => {
        startTracking();
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        try {
            const id = navigator.geolocation.watchPosition(
                handlePositionUpdate,
                handleLocationError,
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
            setWatchId(id);
        } catch (error) {
            setError('Error starting location tracking');
        }
    };

    const handlePositionUpdate = async (position) => {
        try {
            await updateRiderLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        } catch (error) {
            setError('Failed to update location');
        }
    };

    const handleLocationError = (error) => {
        let errorMessage;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            default:
                errorMessage = 'An unknown error occurred';
        }
        setError(errorMessage);
    };

    if (error) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return null;
};

export default LocationTracker;