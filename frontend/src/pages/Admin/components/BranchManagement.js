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
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../../../services/api';

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
        manager_id: '',
        status: 'active'
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

    const handleOpen = (branch = null) => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                manager_id: branch.manager_id || '',
                status: branch.status
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
                await updateBranch(editingId, formData);
            } else {
                await createBranch(formData);
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
            manager_id: '',
            status: 'active'
        });
        setEditingId(null);
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
                            <Tab label="Basic Info" />
                            <Tab label="Delivery Settings" />
                            <Tab label="Order Settings" />
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
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Delivery Radius (km)"
                                        type="number"
                                        value={formData.deliveryRadius || 10}
                                        onChange={(e) => setFormData({...formData, deliveryRadius: e.target.value})}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Minimum Order Amount ($)"
                                        type="number"
                                        value={formData.minimumOrderAmount || 15}
                                        onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Maximum Concurrent Orders"
                                        type="number"
                                        value={formData.maxConcurrentOrders || 20}
                                        onChange={(e) => setFormData({...formData, maxConcurrentOrders: e.target.value})}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Preparation Time (minutes)"
                                        type="number"
                                        value={formData.preparationTimeMinutes || 30}
                                        onChange={(e) => setFormData({...formData, preparationTimeMinutes: e.target.value})}
                                        inputProps={{ min: 5 }}
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.allowScheduledOrders}
                                                onChange={(e) => setFormData({...formData, allowScheduledOrders: e.target.checked})}
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
                                        value={formData.maxScheduleDays || 7}
                                        onChange={(e) => setFormData({...formData, maxScheduleDays: e.target.value})}
                                        inputProps={{ min: 1, max: 30 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.automaticOrderAssignment}
                                                onChange={(e) => setFormData({...formData, automaticOrderAssignment: e.target.checked})}
                                            />
                                        }
                                        label="Automatic Order Assignment"
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" onClick={handleSubmit}>
                        {editingId ? 'Save Changes' : 'Add Branch'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BranchManagement;