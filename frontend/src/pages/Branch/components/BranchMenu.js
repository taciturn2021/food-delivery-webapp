import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    FormControl,
    InputLabel,
    Select,
    useTheme,
} from '@mui/material';
import {
    Edit as EditIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
    RestaurantMenu as MenuIcon,
    CheckCircle as AvailableIcon,
    Cancel as UnavailableIcon,
} from '@mui/icons-material';
import { getBranchMenu, assignMenuItemToBranch } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const categories = [
    'All',
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Sides',
    'Special Offers'
];

const BranchMenu = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        loadBranchMenu();
    }, []);

    const loadBranchMenu = async () => {
        try {
            const branchId = user.branchId;
            const response = await getBranchMenu(branchId);
            setMenuItems(response.data);
        } catch (error) {
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = (category) => {
        if (category && typeof category === 'string') {
            setSelectedCategory(category);
        }
        setFilterAnchorEl(null);
    };

    const handleEditOpen = (item) => {
        setEditItem({
            ...item,
            branch_price: item.branch_price || item.price,
            branch_availability: item.branch_availability !== undefined ? item.branch_availability : item.is_available
        });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditItem(null);
        setEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        try {
            const branchId = user.branchId;
            console.log('Edit Item:', editItem);
            await assignMenuItemToBranch({
                branch_id: branchId,
                menu_item_id: editItem.id,
                price: editItem.branch_price,
                is_available: editItem.branch_availability
            });
            setSuccess('Menu item updated successfully');
            loadBranchMenu();
            handleEditClose();
        } catch (error) {
            setError('Failed to update menu item');
        }
    };

    const handleAvailabilityChange = async (itemId, newValue) => {
        try {
            const branchId = user.branchId;
            await assignMenuItemToBranch({
                branch_id: branchId,
                menu_item_id: itemId,
                is_available: newValue,
                price: menuItems.find(item => item.id === itemId).branch_price || menuItems.find(item => item.id === itemId).price
            });
            loadBranchMenu();
        } catch (error) {
            setError('Failed to update item availability');
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">
                    Branch Menu
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search menu items..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 250 }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        onClick={handleFilterClick}
                    >
                        {selectedCategory}
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => handleFilterClose()}
            >
                {categories.map((category) => (
                    <MenuItem 
                        key={category}
                        onClick={() => handleFilterClose(category)}
                        selected={category === selectedCategory}
                    >
                        {category}
                    </MenuItem>
                ))}
            </Menu>

            <Grid container spacing={3}>
                {filteredItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative'
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                alt={item.name}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Typography variant="h6" component="h2">
                                        {item.name}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditOpen(item)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {item.description}
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" color="primary">
                                        ${Number(item.branch_price || item.price).toFixed(2)}
                                    </Typography>
                                    <Chip
                                        label={item.category}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={item.branch_availability !== undefined ? item.branch_availability : item.is_available}
                                            onChange={(e) => handleAvailabilityChange(item.id, e.target.checked)}
                                            color="success"
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {item.branch_availability !== undefined ? item.branch_availability : item.is_available ? (
                                                <AvailableIcon fontSize="small" color="success" />
                                            ) : (
                                                <UnavailableIcon fontSize="small" color="error" />
                                            )}
                                            <Typography variant="body2">
                                                {item.branch_availability !== undefined ? item.branch_availability : item.is_available ? 
                                                    'Available' : 'Unavailable'}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog 
                open={editDialogOpen} 
                onClose={handleEditClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Edit Menu Item
                </DialogTitle>
                {editItem && (
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                {editItem.name}
                            </Typography>
                            
                            <TextField
                                fullWidth
                                label="Price"
                                type="number"
                                value={editItem.branch_price}
                                onChange={(e) => setEditItem({...editItem, branch_price: e.target.value})}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{ mt: 2 }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editItem.branch_availability}
                                        onChange={(e) => setEditItem({...editItem, branch_availability: e.target.checked})}
                                        color="success"
                                    />
                                }
                                label="Available at this branch"
                                sx={{ mt: 2 }}
                            />
                        </Box>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button 
                        onClick={handleEditSave}
                        variant="contained"
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BranchMenu;