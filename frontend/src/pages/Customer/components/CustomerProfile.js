import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    useTheme,
    alpha,
    Snackbar,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon,
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon,
    Store as StoreIcon,
    MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { getCustomerAddresses, addAddress, updateAddress, deleteAddress, getPublicBranches } from '../../../services/api';
import CustomerHeader from '../../../components/customer/CustomerHeader';

// A component to recenter the map when location changes
const MapCenterSetter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.latitude && center.longitude) {
            map.setView([center.latitude, center.longitude], 15);
        }
    }, [center, map]);
    return null;
};

const AddressForm = ({ address, onSubmit, onClose, branches }) => {
    const [formData, setFormData] = useState({
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        branchId: address?.branchId || '',
        latitude: address?.latitude || null,
        longitude: address?.longitude || null
    });
    const [error, setError] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [defaultCenter, setDefaultCenter] = useState({ latitude: 31.5204, longitude: 74.3587 });
    const mapRef = useRef(null);

    // Get user's current location when adding a new address
    useEffect(() => {
        if (!address) {  // Only when adding new address, not editing
            getUserLocation();
        }
    }, [address]);

    const getUserLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setDefaultCenter({ latitude, longitude });
                    
                    if (!address) {
                        // Only update form data if we're adding a new address (not editing)
                        setFormData(prev => ({
                            ...prev,
                            latitude,
                            longitude
                        }));
                    }
                    setLocationLoading(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setLocationLoading(false);
        }
    };

    const LocationMarker = () => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));
            }
        });

        return formData.latitude && formData.longitude ? (
            <Marker position={[formData.latitude, formData.longitude]} />
        ) : null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.latitude || !formData.longitude) {
            setError('Please select a location on the map');
            return;
        }
        if (!formData.branchId) {
            setError('Please select a branch');
            return;
        }
        onSubmit(formData);
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{address ? 'Edit Address' : 'Add New Address'}</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street Address"
                                value={formData.street}
                                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="State"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="ZIP Code"
                                value={formData.zipCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Associate with Branch</InputLabel>
                                <Select
                                    value={formData.branchId}
                                    label="Associate with Branch"
                                    onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                                >
                                    {branches.map(branch => (
                                        <MenuItem key={branch.id} value={branch.id}>
                                            {branch.name} - {branch.address}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1">
                                    Mark your location on the map
                                </Typography>
                                <Tooltip title="Use my current location">
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={getUserLocation}
                                        disabled={locationLoading}
                                        startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocationIcon />}
                                    >
                                        Current Location
                                    </Button>
                                </Tooltip>
                            </Box>
                            <Box sx={{ height: 300, width: '100%', mb: 2, position: 'relative' }}>
                                {locationLoading && (
                                    <Box sx={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        right: 0, 
                                        bottom: 0, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        zIndex: 999
                                    }}>
                                        <CircularProgress />
                                    </Box>
                                )}
                                <MapContainer
                                    center={[
                                        formData.latitude || defaultCenter.latitude, 
                                        formData.longitude || defaultCenter.longitude
                                    ]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    ref={mapRef}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker />
                                    <MapCenterSetter center={defaultCenter} />
                                </MapContainer>
                            </Box>
                            {error && <Alert severity="error">{error}</Alert>}
                        </Grid>
                    </Grid>
                    <DialogActions>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {address ? 'Update' : 'Add'} Address
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const CustomerProfile = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        loadAddresses();
        loadBranches();
    }, []);

    const loadAddresses = async () => {
        try {
            const response = await getCustomerAddresses();
            setAddresses(response.data);
        } catch (error) {
            setError('Failed to load addresses');
        }
    };

    const loadBranches = async () => {
        try {
            const response = await getPublicBranches();
            const activeBranches = response.data.filter(branch => branch.status === 'active');
            setBranches(activeBranches);
        } catch (error) {
            setError('Failed to load branches');
        }
    };

    const handleAddAddress = async (addressData) => {
        try {
            await addAddress(addressData);
            await loadAddresses();
            setShowAddressForm(false);
            setSuccessMessage('Address added successfully');
        } catch (error) {
            setError('Failed to add address');
        }
    };

    const handleUpdateAddress = async (addressData) => {
        try {
            await updateAddress(selectedAddress.id, addressData);
            await loadAddresses();
            setSelectedAddress(null);
            setSuccessMessage('Address updated successfully');
        } catch (error) {
            setError('Failed to update address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await deleteAddress(addressId);
            await loadAddresses();
            setSuccessMessage('Address deleted successfully');
        } catch (error) {
            setError('Failed to delete address');
        }
    };
    
    const getBranchName = (branchId) => {
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : 'Unknown Branch';
    };

    return (
        <>
            <CustomerHeader />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                    py: 8,
                    mt: 8
                }}
            >
                <Container maxWidth="lg">
                    <Paper sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton sx={{ mr: 1 }} onClick={() => navigate('/')}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant="h4" component="h1">
                                    Manage Addresses
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setShowAddressForm(true)}
                            >
                                Add New Address
                            </Button>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {addresses.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    You don't have any addresses yet
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Add an address to get started ordering food
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowAddressForm(true)}
                                >
                                    Add New Address
                                </Button>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {addresses.map((address) => (
                                    <Grid item xs={12} md={6} key={address.id}>
                                        <Card>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LocationIcon color="primary" />
                                                            {address.street}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {address.city}, {address.state} {address.zipCode}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                                            <StoreIcon fontSize="small" color="action" />
                                                            {getBranchName(address.branchId)}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setSelectedAddress(address)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteAddress(address.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate('/customer/profile/edit')}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Paper>

                    {(showAddressForm || selectedAddress) && (
                        <AddressForm
                            address={selectedAddress}
                            branches={branches}
                            onSubmit={selectedAddress ? handleUpdateAddress : handleAddAddress}
                            onClose={() => {
                                setShowAddressForm(false);
                                setSelectedAddress(null);
                            }}
                        />
                    )}
                </Container>
                
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={6000}
                    onClose={() => setSuccessMessage('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={() => setSuccessMessage('')} 
                        severity="success"
                        sx={{ width: '100%' }}
                    >
                        {successMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
};

export default CustomerProfile;