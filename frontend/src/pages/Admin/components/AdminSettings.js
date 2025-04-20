import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    TextField,
    CircularProgress,
} from '@mui/material';
import { getAllBranches, createBranch, updateBranch } from '../../../services/api';

// The ID we'll use for storing template/default branch settings
const DEFAULT_TEMPLATE_ID = 'admin_defaults';

const AdminSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        defaultDeliveryRadius: 10, // Default radius when creating new branches
        defaultMinimumOrder: 15,   // Default minimum order when creating new branches
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [templateBranch, setTemplateBranch] = useState(null);

    useEffect(() => {
        // Look for a branch that serves as our template
        const loadDefaultSettings = async () => {
            try {
                setLoading(true);
                const response = await getAllBranches();
                
                // Find a branch with a specific name that we'll use as our template
                const template = response.data.find(branch => 
                    branch.name === 'Default Branch Template');
                
                if (template) {
                    setTemplateBranch(template);
                    setSettings({
                        defaultDeliveryRadius: template.delivery_radius || 10,
                        defaultMinimumOrder: template.minimum_order_amount || 15
                    });
                } else {
                    // If no template branch exists, we might create one later
                    console.log('No template branch found');
                }
            } catch (err) {
                console.error('Error loading default settings:', err);
                setError('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        
        if (user && user.role === 'admin') {
            loadDefaultSettings();
        }
    }, [user]);

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setError(null);
            
            if (templateBranch) {
                // Update the existing template branch
                await updateBranch(templateBranch.id, {
                    delivery_radius: settings.defaultDeliveryRadius,
                    minimum_order_amount: settings.defaultMinimumOrder,
                    status: 'inactive' // Keep it inactive so it doesn't appear in customer searches
                });
            } else {
                // Create a new template branch if none exists
                await createBranch({
                    name: 'Default Branch Template',
                    address: 'Template Address',
                    phone: '000-000-0000',
                    managerName: 'Admin',
                    managerEmail: user.email, // Use admin email
                    managerPassword: Math.random().toString(36).slice(-10), // Random password (won't be used)
                    status: 'inactive',
                    delivery_radius: settings.defaultDeliveryRadius,
                    minimum_order_amount: settings.defaultMinimumOrder,
                    // Add location data to satisfy the API
                    latitude: 0,
                    longitude: 0
                });
            }
            
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.response?.data?.message || 'Failed to update settings');
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Global System Settings
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {showSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Settings updated successfully!
                </Alert>
            )}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Branch Default Settings
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    These settings will be used as defaults when creating new branches.
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Default Delivery Radius (km)"
                                    type="number"
                                    value={settings.defaultDeliveryRadius}
                                    onChange={handleChange('defaultDeliveryRadius')}
                                    inputProps={{ min: 1 }}
                                    helperText="Default delivery radius for new branches"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Default Minimum Order ($)"
                                    type="number"
                                    value={settings.defaultMinimumOrder}
                                    onChange={handleChange('defaultMinimumOrder')}
                                    inputProps={{ min: 0 }}
                                    helperText="Default minimum order amount for new branches"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Account Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Username:</strong> {user.username}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Email:</strong> {user.email}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Role:</strong> {user.role}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                    >
                                        Save Changes
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            )}
        </Box>
    );
};

export default AdminSettings;