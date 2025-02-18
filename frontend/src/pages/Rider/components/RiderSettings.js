import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Button,
    TextField,
    Grid,
    Alert
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

const RiderSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        isAvailable: true,
        maxConcurrentOrders: 1,
        preferredArea: '',
        notifications: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (event) => {
        const { name, value, checked } = event.target;
        setSettings(prev => ({
            ...prev,
            [name]: event.target.type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Implement API call to save settings
            setSuccessMessage('Settings saved successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
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
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.isAvailable}
                                    onChange={handleChange}
                                    name="isAvailable"
                                    color="primary"
                                />
                            }
                            label="Available for Deliveries"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Maximum Concurrent Orders"
                            type="number"
                            name="maxConcurrentOrders"
                            value={settings.maxConcurrentOrders}
                            onChange={handleChange}
                            InputProps={{ inputProps: { min: 1, max: 3 } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Preferred Area"
                            name="preferredArea"
                            value={settings.preferredArea}
                            onChange={handleChange}
                            helperText="Enter your preferred delivery area"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.notifications}
                                    onChange={handleChange}
                                    name="notifications"
                                    color="primary"
                                />
                            }
                            label="Enable Notifications"
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