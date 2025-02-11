import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

const MenuManagement = () => {
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [menuItems, setMenuItems] = useState([
        // Dummy data - will be replaced with API calls
        {
            id: 1,
            name: 'Chicken Burger',
            description: 'Grilled chicken with fresh vegetables',
            price: 12.99,
            category: 'Burgers',
            image: 'https://via.placeholder.com/150',
        },
        // Add more dummy items...
    ]);

    const categories = [
        'Burgers',
        'Pizza',
        'Sides',
        'Beverages',
        'Desserts',
    ];

    const handleOpen = (item = null) => {
        setEditingItem(item);
        setOpen(true);
    };

    const handleClose = () => {
        setEditingItem(null);
        setOpen(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // TODO: Implement menu item creation/editing logic
        handleClose();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Menu Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add New Item
                </Button>
            </Box>

            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={item.image}
                                alt={item.name}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {item.name}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {item.category}
                                </Typography>
                                <Typography variant="body2">
                                    {item.description}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    ${item.price.toFixed(2)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpen(item)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Item Name"
                            defaultValue={editingItem?.name}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            defaultValue={editingItem?.description}
                            margin="normal"
                            multiline
                            rows={3}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            defaultValue={editingItem?.price}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: '$',
                            }}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select
                                defaultValue={editingItem?.category || ''}
                                label="Category"
                                required
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Image URL"
                            defaultValue={editingItem?.image}
                            margin="normal"
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" onClick={handleSubmit}>
                        {editingItem ? 'Save Changes' : 'Add Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuManagement;