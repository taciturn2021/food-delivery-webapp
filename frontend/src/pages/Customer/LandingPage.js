import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../../components/customer/CustomerHeader';
import BranchSelector from './components/BranchSelector';
import CustomerMenu from './components/CustomerMenu';
import { getPublicBranches } from '../../services/api';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { useCart } from '../../context/CartContext';

const IntegratedLanding = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [branchDialogOpen, setBranchDialogOpen] = useState(true);
    const navigate = useNavigate();
    const { cart, setBranch } = useCart();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await getPublicBranches();
                const activeBranches = response.data.filter(branch => branch.status === 'active');
                setBranches(activeBranches);
                setError(null);

                // If there's a branch in cart, use that
                if (cart.branchId) {
                    const cartBranch = activeBranches.find(branch => branch.id === cart.branchId);
                    if (cartBranch) {
                        setSelectedBranch(cartBranch);
                        setBranchDialogOpen(false);
                    } else {
                        // If cart branch not found in active branches, clear selection
                        setSelectedBranch(null);
                        setBranchDialogOpen(true);
                    }
                } else {
                    // If no branch in cart, check localStorage
                    const savedBranchId = localStorage.getItem('selectedBranch');
                    if (savedBranchId) {
                        const savedBranch = activeBranches.find(branch => branch.id === parseInt(savedBranchId));
                        if (savedBranch) {
                            setSelectedBranch(savedBranch);
                            setBranchDialogOpen(false);
                        } else {
                            // If saved branch not found in active branches, clear selection
                            localStorage.removeItem('selectedBranch');
                            setSelectedBranch(null);
                            setBranchDialogOpen(true);
                        }
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
    }, [cart.branchId]);

    const handleBranchSelect = (branchId) => {
        const selected = branches.find(branch => branch.id === branchId);
        if (selected) {
            setSelectedBranch(selected);
            setBranch(branchId);
            setBranchDialogOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <CustomerHeader onBranchSelect={handleBranchSelect} />
            {/* Spacer for fixed header */}
            <div className="h-16"></div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="container mx-auto px-4 py-6 sm:py-8">
                    <div className="bg-red-100 border-l-4 border-red-500 p-3 sm:p-4 rounded text-red-700 text-sm sm:text-base">
                        {error}
                    </div>
                </div>
            ) : (
                <>
                    {selectedBranch && (
                        <CustomerMenu branchId={selectedBranch.id} />
                    )}
                </>
            )}

            <Dialog
                open={branchDialogOpen}
                onOpenChange={(open) => {
                    if (selectedBranch) setBranchDialogOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[725px] p-0 w-[95vw] max-w-full mx-auto">
                    <BranchSelector
                        branches={branches}
                        onBranchSelect={handleBranchSelect}
                        isDialog={true}
                        currentBranchId={selectedBranch?.id || cart.branchId}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IntegratedLanding;