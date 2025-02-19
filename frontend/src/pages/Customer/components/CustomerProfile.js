import React, { useState, useEffect } from 'react';
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
    useTheme,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { getCustomerAddresses, addAddress, updateAddress, deleteAddress } from '../../../services/api';

const AddressForm = ({ address, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        latitude: address?.latitude || null,
        longitude: address?.longitude || null
    });
    const [error, setError] = useState('');

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
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Mark your location on the map
                            </Typography>
                            <Box sx={{ height: 300, width: '100%', mb: 2 }}>
                                <MapContainer
                                    center={[formData.latitude || 0, formData.longitude || 0]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker />
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
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const response = await getCustomerAddresses();
            setAddresses(response.data);
        } catch (error) {
            setError('Failed to load addresses');
        }
    };

    const handleAddAddress = async (addressData) => {
        try {
            await addAddress(addressData);
            await loadAddresses();
            setShowAddressForm(false);
        } catch (error) {
            setError('Failed to add address');
        }
    };

    const handleUpdateAddress = async (addressData) => {
        try {
            await updateAddress(selectedAddress.id, addressData);
            await loadAddresses();
            setSelectedAddress(null);
        } catch (error) {
            setError('Failed to update address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await deleteAddress(addressId);
            await loadAddresses();
        } catch (error) {
            setError('Failed to delete address');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                py: 8
            }}
        >
            <Container maxWidth="lg">
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h1">
                            My Profile
                        </Typography>
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

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Account Information
                                    </Typography>
                                    <Typography variant="body1">
                                        Username: {user?.username}
                                    </Typography>
                                    <Typography variant="body1">
                                        Email: {user?.email}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" gutterBottom>
                                My Addresses
                            </Typography>
                            <Grid container spacing={2}>
                                {addresses.map((address) => (
                                    <Grid item xs={12} key={address.id}>
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
                        </Grid>
                    </Grid>
                </Paper>

                {(showAddressForm || selectedAddress) && (
                    <AddressForm
                        address={selectedAddress}
                        onSubmit={selectedAddress ? handleUpdateAddress : handleAddAddress}
                        onClose={() => {
                            setShowAddressForm(false);
                            setSelectedAddress(null);
                        }}
                    />
                )}
            </Container>
        </Box>
    );
};

export default CustomerProfile;