import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import {
    Map as MapIcon,
    LocationOn as LocationIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { getDeliveryLocation } from '../../../services/api';

const DeliveryTracker = ({ assignmentId, onClose }) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [updateInterval, setUpdateInterval] = useState(null);

    useEffect(() => {
        fetchLocation();
        const interval = setInterval(fetchLocation, 30000); // Update every 30 seconds
        setUpdateInterval(interval);

        return () => {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        };
    }, [assignmentId]);

    const fetchLocation = async () => {
        try {
            const response = await getDeliveryLocation(assignmentId);
            setLocation(response.data);
        } catch (error) {
            setError('Unable to fetch rider location');
        }
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Delivery Tracking</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    {error ? (
                        <Typography color="error">{error}</Typography>
                    ) : location ? (
                        <>
                            <Typography gutterBottom>
                                Last updated: {new Date(location.updated_at).toLocaleString()}
                            </Typography>
                            <Paper sx={{ p: 2, mt: 2 }}>
                                <Typography>
                                    Latitude: {location.latitude}
                                </Typography>
                                <Typography>
                                    Longitude: {location.longitude}
                                </Typography>
                                {/* TODO: Integrate with a mapping service like Google Maps */}
                            </Paper>
                        </>
                    ) : (
                        <Typography>Loading location data...</Typography>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default DeliveryTracker;