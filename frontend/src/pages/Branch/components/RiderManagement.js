import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    FormControlLabel,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DeliveryDining as DeliveryIcon,
} from '@mui/icons-material';
import { getBranchRiders, createRider, updateRider } from '../../../services/api';

const RiderManagement = ({ branchId }) => {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        cnic: '',
        contact_number: '',
        emergency_contact: '',
        vehicle_type: '',
        vehicle_plate_no: '',
        license_no: '',
        status: 'active'
    });

    useEffect(() => {
        loadRiders();
    }, [branchId]);

    const loadRiders = async () => {
        try {
            const response = await getBranchRiders(branchId);
            setRiders(response.data);
        } catch (error) {
            setError('Failed to load riders');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (rider = null) => {
        if (rider) {
            setFormData({
                ...rider,
                password: '' // Don't load password for editing
            });
            setEditingId(rider.id);
        } else {
            resetForm();
        }
        setOpen(true);
    };

    const handleClose = () => {
        resetForm();
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                branch_id: branchId
            };

            if (editingId) {
                const { email, password, ...updateData } = submitData;
                await updateRider(editingId, updateData);
            } else {
                await createRider(submitData);
            }
            loadRiders();
            handleClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving rider');
        }
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            password: '',
            cnic: '',
            contact_number: '',
            emergency_contact: '',
            vehicle_type: '',
            vehicle_plate_no: '',
            license_no: '',
            status: 'active'
        });
        setEditingId(null);
    };

    const handleStatusToggle = async (rider) => {
        try {
            const newStatus = rider.status === 'active' ? 'inactive' : 'active';
            // Use user_id instead of id for the API call
            await updateRider(rider.user_id, { status: newStatus });
            
            // Update the local state immediately
            setRiders(riders.map(r => 
                r.id === rider.id ? {...r, status: newStatus} : r
            ));
            
            // Show success message
            setSuccessMessage(`Rider ${rider.full_name}'s status changed to ${newStatus}`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            setError(`Failed to update rider status: ${error.response?.data?.message || error.message}`);
            setTimeout(() => setError(null), 5000);
        }
    };

    if (loading) return <Box>Loading...</Box>;
    if (error) return <Box color="error.main">{error}</Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Delivery Staff Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add New Rider
                </Button>
            </Box>

            {successMessage && (
                <Box sx={{ mb: 2 }}>
                    <Alert severity="success">{successMessage}</Alert>
                </Box>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Vehicle</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Available</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {riders.map((rider) => (
                            <TableRow key={rider.id}>
                                <TableCell>{rider.full_name}</TableCell>
                                <TableCell>{rider.contact_number}</TableCell>
                                <TableCell>
                                    {rider.vehicle_type} - {rider.vehicle_plate_no}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={rider.status}
                                        color={rider.status === 'active' ? 'success' : 
                                              rider.status === 'busy' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Switch
                                        checked={rider.status === 'active'}
                                        onChange={() => handleStatusToggle(rider)}
                                        disabled={rider.status === 'busy'}
                                        color="success"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => handleOpen(rider)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingId ? 'Edit Rider' : 'Add New Rider'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    required
                                />
                            </Grid>
                            {!editingId && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="email"
                                            label="Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            required
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="CNIC"
                                    value={formData.cnic}
                                    onChange={(e) => setFormData({...formData, cnic: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Emergency Contact"
                                    value={formData.emergency_contact}
                                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Vehicle Type"
                                    value={formData.vehicle_type}
                                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Vehicle Plate No"
                                    value={formData.vehicle_plate_no}
                                    onChange={(e) => setFormData({...formData, vehicle_plate_no: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="License No"
                                    value={formData.license_no}
                                    onChange={(e) => setFormData({...formData, license_no: e.target.value})}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" onClick={handleSubmit}>
                        {editingId ? 'Save Changes' : 'Add Rider'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RiderManagement;