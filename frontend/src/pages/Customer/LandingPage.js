import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Container,
    Dialog,
    Box,
    CircularProgress,
    Grid,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from '@mui/icons-material';
import CustomerHeader from '../../components/customer/CustomerHeader';
import BranchSelector from './components/BranchSelector';
import { getPublicBranches } from '../../services/api';
import CustomerMenu from './components/CustomerMenu';  // Imported CustomerMenu

const IntegratedLanding = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [branchDialogOpen, setBranchDialogOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await getPublicBranches();
                const activeBranches = response.data.filter(branch => branch.status === 'active');
                setBranches(activeBranches);
                setError(null);

                // Check for previously selected branch
                const savedBranchId = localStorage.getItem('selectedBranch');
                if (savedBranchId) {
                    const savedBranch = activeBranches.find(branch => branch.id === parseInt(savedBranchId));
                    if (savedBranch) {
                        setSelectedBranch(savedBranch);
                        setBranchDialogOpen(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
                setError('Unable to load branches. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    const handleBranchSelect = (branchId) => {
        const selected = branches.find(branch => branch.id === branchId);
        setSelectedBranch(selected);
        localStorage.setItem('selectedBranch', branchId);
        setBranchDialogOpen(false);
    };

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <CustomerHeader onBranchSelect={handleBranchSelect} />
            {/* Spacer for fixed AppBar */}
            <Box sx={{ height: 64 }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            ) : (
                <>
                    {selectedBranch && (
                        <CustomerMenu branchId={selectedBranch.id} />
                    )}
                </>
            )}

            <Dialog
                open={branchDialogOpen}
                onClose={() => {
                    if (selectedBranch) setBranchDialogOpen(false);
                }}
                maxWidth="md"
                fullWidth
                disableEscapeKeyDown={!selectedBranch}
            >
                <BranchSelector
                    branches={branches}
                    onBranchSelect={handleBranchSelect}
                    isDialog={true}
                />
            </Dialog>
        </Box>
    );
};

export default IntegratedLanding;