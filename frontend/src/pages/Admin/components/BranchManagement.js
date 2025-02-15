import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    Grid,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../../../services/api';
import MapLocationPicker from '../../../components/common/MapLocationPicker';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ display: value === index ? 'block' : 'none' }}>
        {value === index && children}
    </div>
);

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        status: 'active',
        managerName: '',
        managerEmail: '',
        managerPassword: '',
        location: null
    });
    const [editingId, setEditingId] = useState(null);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            const response = await getAllBranches();
            setBranches(response.data);
        } catch (error) {
            setError('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = (location) => {
        setFormData({
            ...formData,
            location
        });
    };

    const handleOpen = (branch = null) => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                status: branch.status,
                location: branch.latitude && branch.longitude ? {
                    lat: parseFloat(branch.latitude),
                    lng: parseFloat(branch.longitude)
                } : null
            });
            setEditingId(branch.id);
        } else {
            resetForm();
        }
        setOpen(true);
        setActiveTab(0);
    };

    const handleClose = () => {
        resetForm();
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updateData = {
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone,
                    status: formData.status,
                    latitude: formData.location?.lat,
                    longitude: formData.location?.lng
                };
                await updateBranch(editingId, updateData);
            } else {
                await createBranch({
                    ...formData,
                    latitude: formData.location?.lat,
                    longitude: formData.location?.lng
                });
            }
            loadBranches();
            handleClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving branch');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await deleteBranch(id);
                loadBranches();
            } catch (error) {
                setError('Failed to delete branch');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            phone: '',
            status: 'active',
            managerName: '',
            managerEmail: '',
            managerPassword: '',
            location: null
        });
        setEditingId(null);
        setActiveTab(0);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Branch Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add New Branch
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {branches.map((branch) => (
                            <TableRow key={branch.id}>
                                <TableCell>{branch.name}</TableCell>
                                <TableCell>{branch.address}</TableCell>
                                <TableCell>{branch.phone}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={branch.status}
                                        color={branch.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpen(branch)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(branch.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    {editingId ? 'Edit Branch' : 'Add New Branch'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                            <Tab label="Branch Info" />
                            {!editingId && <Tab label="Manager Account" />}
                        </Tabs>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TabPanel value={activeTab} index={0}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Branch Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Opening Time"
                                        type="time"
                                        value={formData.openingTime || '09:00'}
                                        InputLabelProps={{ shrink: true }}
                                        onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Closing Time"
                                        type="time"
                                        value={formData.closingTime || '22:00'}
                                        InputLabelProps={{ shrink: true }}
                                        onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Branch Location (Click on map to set location)
                                    </Typography>
                                    <MapLocationPicker
                                        location={formData.location}
                                        onLocationChange={handleLocationChange}
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Manager Name"
                                        value={formData.managerName}
                                        onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                                        required={!editingId}
                                        disabled={editingId}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="email"
                                        label="Manager Email"
                                        value={formData.managerEmail}
                                        onChange={(e) => setFormData({...formData, managerEmail: e.target.value})}
                                        required={!editingId}
                                        disabled={editingId}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="Manager Password"
                                        value={formData.managerPassword}
                                        onChange={(e) => setFormData({...formData, managerPassword: e.target.value})}
                                        required={!editingId}
                                        disabled={editingId}
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!formData.location}
                    >
                        {editingId ? 'Save Changes' : 'Create Branch'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BranchManagement;