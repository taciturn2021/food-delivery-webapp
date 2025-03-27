import { useState, useEffect } from 'react';
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
    Tab,
    Tabs,
    CircularProgress,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import MapLocationPicker from '../../../components/common/MapLocationPicker';
import { getBranchSettings, updateBranchSettings, updateBranch } from '../../../services/api';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ display: value === index ? 'block' : 'none' }}>
        {value === index && children}
    </div>
);

const BranchSettings = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        // Basic Info
        name: '',
        address: '',
        phone: '',
        openingTime: '09:00',
        closingTime: '22:00',
        location: null,
        
        // Delivery Settings
        deliveryRadius: 10,
        minimumOrderAmount: 15,
        maxConcurrentOrders: 20,
        preparationTimeMinutes: 30,
        
        // Order Settings
        allowScheduledOrders: true,
        maxScheduleDays: 7,
        automaticOrderAssignment: true,
        
        // Manager info (read-only)
        managerEmail: ''
    });

    useEffect(() => {
        if (!authLoading && user?.branchId) {
            loadBranchSettings();
        }
    }, [user?.branchId, authLoading]);

    const loadBranchSettings = async () => {
        try {
            const response = await getBranchSettings(user.branchId);
            
            
            // Transform the time fields to HH:mm format and handle null values
            const formattedData = {
                name: response.data.name || '',
                address: response.data.address || '',
                phone: response.data.phone || '',
                openingTime: response.data.opening_time ? response.data.opening_time.slice(0, 5) : '09:00',
                closingTime: response.data.closing_time ? response.data.closing_time.slice(0, 5) : '22:00',
                managerEmail: response.data.manager_email || '',
                
                // Handle delivery settings
                deliveryRadius: response.data.delivery_radius === null ? 10 : response.data.delivery_radius,
                minimumOrderAmount: response.data.minimum_order_amount === null ? 15 : parseFloat(response.data.minimum_order_amount),
                maxConcurrentOrders: response.data.max_concurrent_orders === null ? 20 : parseInt(response.data.max_concurrent_orders),
                preparationTimeMinutes: response.data.preparation_time_minutes === null ? 30 : parseInt(response.data.preparation_time_minutes),
                
                // Handle order settings
                allowScheduledOrders: response.data.allow_scheduled_orders === null ? true : response.data.allow_scheduled_orders,
                maxScheduleDays: response.data.max_schedule_days === null ? 7 : parseInt(response.data.max_schedule_days),
                automaticOrderAssignment: response.data.automatic_order_assignment === null ? true : response.data.automatic_order_assignment,
                
                // Handle location
                location: response.data.latitude && response.data.longitude ? {
                    lat: parseFloat(response.data.latitude),
                    lng: parseFloat(response.data.longitude)
                } : null
            };
            
        
            setSettings(formattedData);
            setError(null); // Clear any previous errors
        } catch (error) {
            setError('Failed to load branch settings');
            console.error('Error loading branch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLocationChange = (location) => {
        setSettings(prev => ({
            ...prev,
            location
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        
        try {
            // First update basic info if changed
            const basicInfoUpdate = {
                name: settings.name,
                address: settings.address,
                phone: settings.phone,
                latitude: settings.location?.lat,
                longitude: settings.location?.lng
            };
            
           
            await updateBranch(user.branchId, basicInfoUpdate);

            // Then update settings - ensure all values are properly typed
            const settingsUpdate = {
                openingTime: settings.openingTime || '09:00',
                closingTime: settings.closingTime || '22:00',
                deliveryRadius: settings.deliveryRadius === '' ? null : parseInt(settings.deliveryRadius),
                minimumOrderAmount: settings.minimumOrderAmount === '' ? null : parseFloat(settings.minimumOrderAmount),
                maxConcurrentOrders: settings.maxConcurrentOrders === '' ? null : parseInt(settings.maxConcurrentOrders),
                preparationTimeMinutes: settings.preparationTimeMinutes === '' ? null : parseInt(settings.preparationTimeMinutes),
                allowScheduledOrders: Boolean(settings.allowScheduledOrders),
                maxScheduleDays: settings.maxScheduleDays === '' ? null : parseInt(settings.maxScheduleDays),
                automaticOrderAssignment: Boolean(settings.automaticOrderAssignment)
            };
            
            
            await updateBranchSettings(user.branchId, settingsUpdate);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error details:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to update settings');
        }
    };

    if (authLoading || (!user?.branchId && loading)) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 400 
            }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading user data...</Typography>
            </Box>
        );
    }

    if (!user?.branchId) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Unable to load branch settings. Please try logging out and back in.
                </Alert>
            </Box>
        );
    }

    if (loading) {
        return <Box sx={{ p: 3 }}>Loading settings...</Box>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Branch Settings
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

            <Paper sx={{ p: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                        <Tab label="Basic Information" />
                        <Tab label="Delivery Settings" />
                        <Tab label="Order Settings" />
                    </Tabs>
                </Box>

                <form onSubmit={handleSubmit}>
                    <TabPanel value={activeTab} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Branch Name"
                                    value={settings.name}
                                    onChange={handleChange('name')}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={settings.address}
                                    onChange={handleChange('address')}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={settings.phone}
                                    onChange={handleChange('phone')}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Opening Time"
                                    type="time"
                                    value={settings.openingTime}
                                    onChange={handleChange('openingTime')}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Closing Time"
                                    type="time"
                                    value={settings.closingTime}
                                    onChange={handleChange('closingTime')}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email (Branch Manager)"
                                    type="email"
                                    value={settings.managerEmail}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    helperText="This is the branch manager's email address"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                    Branch Location
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Click on the map to update your branch location
                                </Typography>
                                <Box sx={{ height: 400, width: '100%', mb: 2 }}>
                                    <MapLocationPicker
                                        location={settings.location}
                                        onLocationChange={handleLocationChange}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Delivery Radius (km)"
                                    type="number"
                                    value={settings.deliveryRadius}
                                    onChange={handleChange('deliveryRadius')}
                                    inputProps={{ min: 1 }}
                                    required
                                    helperText="Maximum distance for deliveries"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Minimum Order Amount ($)"
                                    type="number"
                                    value={settings.minimumOrderAmount}
                                    onChange={handleChange('minimumOrderAmount')}
                                    inputProps={{ min: 0 }}
                                    required
                                    helperText="Minimum order value for delivery"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Maximum Concurrent Orders"
                                    type="number"
                                    value={settings.maxConcurrentOrders}
                                    onChange={handleChange('maxConcurrentOrders')}
                                    inputProps={{ min: 1 }}
                                    required
                                    helperText="Maximum number of orders to handle at once"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Preparation Time (minutes)"
                                    type="number"
                                    value={settings.preparationTimeMinutes}
                                    onChange={handleChange('preparationTimeMinutes')}
                                    inputProps={{ min: 5 }}
                                    required
                                    helperText="Average time to prepare an order"
                                />
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.allowScheduledOrders}
                                            onChange={handleChange('allowScheduledOrders')}
                                        />
                                    }
                                    label="Allow Scheduled Orders"
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Enable customers to schedule orders for future delivery
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Maximum Schedule Days"
                                    type="number"
                                    value={settings.maxScheduleDays}
                                    onChange={handleChange('maxScheduleDays')}
                                    inputProps={{ min: 1, max: 30 }}
                                    disabled={!settings.allowScheduledOrders}
                                    helperText="How many days in advance orders can be scheduled"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.automaticOrderAssignment}
                                            onChange={handleChange('automaticOrderAssignment')}
                                        />
                                    }
                                    label="Automatic Order Assignment"
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Automatically assign orders to available delivery staff
                                </Typography>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" size="large">
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default BranchSettings;