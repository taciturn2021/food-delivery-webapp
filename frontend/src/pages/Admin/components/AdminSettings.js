import { useState } from 'react';
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
} from '@mui/material';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        platformFee: 2,
        maintenanceMode: false,
        defaultDeliveryRadius: 10, // Default value for new branches
        defaultMinimumOrder: 15,   // Default value for new branches
        allowBranchScheduling: true, // Whether branches can set their own schedules
        requireOrderApproval: false, // Whether orders need admin approval
        autoCreateBranchAccounts: false, // Auto create accounts when adding branches
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // TODO: Implement settings update logic
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Global System Settings
            </Typography>

            {showSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Settings updated successfully!
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Platform Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Platform Fee ($)"
                                type="number"
                                value={settings.platformFee}
                                onChange={handleChange('platformFee')}
                                inputProps={{ min: 0, step: 0.5 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange('maintenanceMode')}
                                    />
                                }
                                label="Maintenance Mode"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Branch Defaults
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
                                helperText="Default value for new branches"
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
                                helperText="Default value for new branches"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Branch Permissions
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.allowBranchScheduling}
                                        onChange={handleChange('allowBranchScheduling')}
                                    />
                                }
                                label="Allow Branches to Set Their Own Schedules"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.requireOrderApproval}
                                        onChange={handleChange('requireOrderApproval')}
                                    />
                                }
                                label="Require Admin Approval for Orders"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.autoCreateBranchAccounts}
                                        onChange={handleChange('autoCreateBranchAccounts')}
                                    />
                                }
                                label="Automatically Create Branch Accounts"
                            />
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
        </Box>
    );
};

export default AdminSettings;