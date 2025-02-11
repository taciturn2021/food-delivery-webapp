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
} from '@mui/material';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ display: value === index ? 'block' : 'none' }}>
        {value === index && children}
    </div>
);

const BranchSettings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState({
        // Basic Info
        name: 'Downtown Branch',
        address: '123 Main St',
        phone: '(555) 123-4567',
        email: 'downtown@example.com',
        openingTime: '09:00',
        closingTime: '22:00',
        
        // Delivery Settings
        deliveryRadius: 10,
        minimumOrderAmount: 15,
        maxConcurrentOrders: 20,
        preparationTimeMinutes: 30,
        
        // Order Settings
        allowScheduledOrders: true,
        maxScheduleDays: 7,
        automaticOrderAssignment: true,
    });

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // TODO: Implement settings update logic with API call
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Branch Settings
            </Typography>

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
                                    label="Email"
                                    type="email"
                                    value={settings.email}
                                    onChange={handleChange('email')}
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