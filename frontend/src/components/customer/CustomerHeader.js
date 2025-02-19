import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Dialog,
    IconButton,
    Box,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import BranchSelector from '../../pages/Customer/components/BranchSelector';

const CustomerHeader = ({ onBranchSelect }) => {
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleBranchSelect = (branchId) => {
        if (onBranchSelect) {
            onBranchSelect(branchId);
        }
        setBranchDialogOpen(false);
    };

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: 1 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <IconButton
                            size="large"
                            edge="start"
                            color="primary"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/')}
                        >
                            FoodDelivery
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setBranchDialogOpen(true)}
                            >
                                Select Branch
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                sx={{ color: theme.palette.primary.main }}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Dialog
                open={branchDialogOpen}
                onClose={() => setBranchDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <BranchSelector
                    onBranchSelect={handleBranchSelect}
                    isDialog={true}
                />
            </Dialog>
        </>
    );
};

export default CustomerHeader;