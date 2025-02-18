import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, Chip } from '@mui/material';
import { updateRiderLocation } from '../../../services/api';
import { LocationOn as LocationIcon } from '@mui/icons-material';

const LocationTracker = () => {
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const UPDATE_INTERVAL = 30000; // 30 seconds in milliseconds

    const getCurrentPosition = useCallback(() => {
        // Check if enough time has passed since last update
        const now = Date.now();
        if (lastUpdate && (now - lastUpdate) < UPDATE_INTERVAL) {
            return; // Skip if not enough time has passed
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await updateRiderLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setLastUpdate(Date.now());
                    setError(null);
                } catch (error) {
                    console.error('Failed to update location:', error);
                    setError('Failed to update location');
                }
            },
            (error) => {
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
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, [lastUpdate]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        // Clear any existing interval
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Initial position update
        getCurrentPosition();
            
        // Set up interval for subsequent updates
        const newIntervalId = setInterval(getCurrentPosition, UPDATE_INTERVAL);
        setIntervalId(newIntervalId);

        // Cleanup function
        return () => {
            if (newIntervalId) {
                clearInterval(newIntervalId);
            }
        };
    }, [getCurrentPosition]); // Only recreate interval if getCurrentPosition changes

    const getUpdateTimeText = () => {
        if (!lastUpdate) return 'Not yet updated';
        const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
        if (seconds < 60) return `Updated ${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        return `Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    };

    return (
        <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
                icon={<LocationIcon />}
                label={getUpdateTimeText()}
                color={error ? 'error' : 'success'}
                variant="outlined"
            />
            {error && (
                <Alert severity="error" sx={{ flex: 1 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default LocationTracker;