import React, { useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    CircularProgress
} from '@mui/material';
import MapLocationPicker from '../../../components/common/MapLocationPicker';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const BranchSelector = ({ branches = [], onBranchSelect }) => {
    const [selectedBranch, setSelectedBranch] = useState('');

    const handleChange = (event) => {
        const branchId = event.target.value;
        setSelectedBranch(branchId);
        if (branchId) {
            const branch = branches.find(b => b.id === branchId);
            if (branch) {
                onBranchSelect(branchId);
            }
        }
    };

    const selectedBranchData = branches.find(b => b.id === selectedBranch);

    if (!branches || branches.length === 0) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography>Loading branches...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <FormControl fullWidth variant="outlined">
                <InputLabel>Select a Branch</InputLabel>
                <Select
                    value={selectedBranch}
                    onChange={handleChange}
                    label="Select a Branch"
                    sx={{ mb: 3 }}
                >
                    {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.address}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedBranchData && (
                <Paper sx={{ p: 3, mt: 2 }} elevation={0} variant="outlined">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Branch Details
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        mb: 1
                                    }}
                                >
                                    <LocationOnIcon sx={{ mr: 1 }} />
                                    {selectedBranchData.address}
                                </Typography>
                                <Typography 
                                    variant="body1"
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        mb: 1
                                    }}
                                >
                                    <AccessTimeIcon sx={{ mr: 1 }} />
                                    {`${selectedBranchData.opening_time ? selectedBranchData.opening_time.slice(0, 5) : 'N/A'} - ${selectedBranchData.closing_time ? selectedBranchData.closing_time.slice(0, 5) : 'N/A'}`}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Chip 
                                    label={`Minimum Order: $${selectedBranchData.minimum_order_amount}`}
                                    sx={{ mr: 1, mb: 1 }}
                                />
                                <Chip 
                                    label={`Delivery Radius: ${selectedBranchData.delivery_radius}km`}
                                    sx={{ mb: 1 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MapLocationPicker
                                location={{ 
                                    lat: parseFloat(selectedBranchData.latitude), 
                                    lng: parseFloat(selectedBranchData.longitude) 
                                }}
                                onLocationChange={() => {}}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
};

export default BranchSelector;