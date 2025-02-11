import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Switch,
    FormControlLabel,
} from '@mui/material';

const BranchMenu = () => {
    const [menuItems, setMenuItems] = useState([
        {
            id: 1,
            name: 'Chicken Burger',
            description: 'Grilled chicken with fresh vegetables',
            price: 12.99,
            category: 'Burgers',
            image: 'https://via.placeholder.com/150',
            isAvailable: true,
            inStock: true
        },
        // Add more items as needed
    ]);

    const handleAvailabilityChange = (itemId) => (event) => {
        setMenuItems(items =>
            items.map(item =>
                item.id === itemId
                    ? { ...item, isAvailable: event.target.checked }
                    : item
            )
        );
    };

    const handleStockChange = (itemId) => (event) => {
        setMenuItems(items =>
            items.map(item =>
                item.id === itemId
                    ? { ...item, inStock: event.target.checked }
                    : item
            )
        );
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Menu Management
            </Typography>

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
                                <Typography variant="body2" gutterBottom>
                                    {item.description}
                                </Typography>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    ${item.price.toFixed(2)}
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={item.isAvailable}
                                            onChange={handleAvailabilityChange(item.id)}
                                            color="primary"
                                        />
                                    }
                                    label="Available on Menu"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={item.inStock}
                                            onChange={handleStockChange(item.id)}
                                            color="success"
                                        />
                                    }
                                    label="In Stock"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default BranchMenu;