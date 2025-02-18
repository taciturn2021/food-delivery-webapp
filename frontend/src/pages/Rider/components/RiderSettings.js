import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    Alert,
    Select,
    MenuItem
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { updateRider, getRiderDetails } from '../../../services/api';

const RiderSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        status: 'active',
        contact_number: '',
        emergency_contact: '',
        vehicle_type: '',
        vehicle_plate_no: '',
        license_no: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            loadSettings();
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            if (!user?.id) {
                setError('User ID not found. Please try logging in again.');
                return;
            }

            const response = await getRiderDetails(user.id);
            if (response.data) {
                const riderData = response.data;
                setSettings(prev => ({
                    ...prev,
                    contact_number: riderData.contact_number || '',
                    emergency_contact: riderData.emergency_contact || '',
                    vehicle_type: riderData.vehicle_type || '',
                    vehicle_plate_no: riderData.vehicle_plate_no || '',
                    license_no: riderData.license_no || '',
                    status: riderData.status || 'active'
                }));
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            setError('Failed to load settings. Please try again.');
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            const response = await updateRider(user.id, settings);
            if (response?.data) {
                setSuccessMessage('Settings updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
                // Refresh settings after update
                await loadSettings();
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            setError(error.response?.data?.message || 'Failed to update settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Rider Settings
                </Typography>
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Select
                            fullWidth
                            label="Status"
                            name="status"
                            value={settings.status}
                            onChange={handleChange}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Contact Number"
                            name="contact_number"
                            value={settings.contact_number}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Emergency Contact"
                            name="emergency_contact"
                            value={settings.emergency_contact}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Vehicle Type"
                            name="vehicle_type"
                            value={settings.vehicle_type}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Vehicle Plate Number"
                            name="vehicle_plate_no"
                            value={settings.vehicle_plate_no}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="License Number"
                            name="license_no"
                            value={settings.license_no}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default RiderSettings;