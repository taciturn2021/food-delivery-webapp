import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getPublicBranches } from '../../services/api';
import { 
  ShoppingCart, 
  MapPin, 
  User, 
  Package, 
  LogOut, 
  Menu as MenuIcon,
  X
} from 'lucide-react';
import BranchSelector from '../../pages/Customer/components/BranchSelector';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';

const CustomerHeader = ({ onBranchSelect }) => {
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [branches, setBranches] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cart, clearCart, setBranch } = useCart();

    // Close mobile menu when navigating
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [navigate]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await getPublicBranches();
                const activeBranches = response.data.filter(branch => branch.status === 'active');
                setBranches(activeBranches);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, []);

    const handleBranchSelect = (branchId) => {
        if (cart.branchId !== branchId) {
            clearCart();
            setBranch(branchId);
            navigate('/');
        }
        if (onBranchSelect) {
            onBranchSelect(branchId);
        }
        setBranchDialogOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setProfileOpen(false);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <h1 
                            className="text-xl font-semibold text-orange-600 cursor-pointer hover:text-orange-700 transition-colors flex items-center gap-2" 
                            onClick={() => navigate('/')}
                        >
                            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                🍽️
                            </span>
                            <span className="hidden xs:inline">FoodDelivery</span>
                        </h1>

                        {/* Desktop menu */}
                        <div className="hidden md:flex items-center space-x-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate('/cart')}
                                className="relative border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Cart
                                {cart.items.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                        {cart.items.length}
                                    </span>
                                )}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setBranchDialogOpen(true)}
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                <MapPin className="mr-2 h-4 w-4" />
                                Select Branch
                            </Button>
                            
                            {user ? (
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="relative p-0 w-9 h-9 rounded-full"
                                        onClick={() => setProfileOpen(!profileOpen)}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold shadow-md">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                    </Button>
                                    
                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl py-2 border border-orange-100 z-50">
                                            <div className="px-4 py-2">
                                                <p className="text-sm font-medium text-orange-900">{user.username}</p>
                                                <p className="text-xs text-orange-600">{user.email}</p>
                                            </div>
                                            <div className="border-t border-orange-100 my-1"></div>
                                            <button 
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center text-orange-900" 
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    navigate('/customer/profile/edit');
                                                }}
                                            >
                                                <User className="mr-2 h-4 w-4 text-orange-600" /> Edit Profile
                                            </button>
                                            <button 
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center text-orange-900"
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    navigate('/customer/addresses');
                                                }}
                                            >
                                                <MapPin className="mr-2 h-4 w-4 text-orange-600" /> Manage Addresses
                                            </button>
                                            <button 
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center text-orange-900"
                                                onClick={() => {
                                                    setProfileOpen(false);
                                                    navigate('/customer/orders');
                                                }}
                                            >
                                                <Package className="mr-2 h-4 w-4 text-orange-600" /> My Orders
                                            </button>
                                            <div className="border-t border-orange-100 my-1"></div>
                                            <button 
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center text-red-600" 
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate('/login')}
                                        className="text-orange-700 hover:bg-orange-50"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => navigate('/register')}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile navigation */}
                        <div className="flex md:hidden items-center space-x-2">
                            {/* Cart button visible on mobile */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate('/cart')}
                                className="relative p-2 text-orange-700"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cart.items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                        {cart.items.length}
                                    </span>
                                )}
                            </Button>
                            
                            {/* Mobile menu toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-orange-700"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <MenuIcon className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Mobile menu panel */}
            <div className={`fixed top-16 right-0 bottom-0 z-40 w-64 bg-white/95 backdrop-blur-sm border-l border-orange-100 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 space-y-4">
                    {/* User info on mobile */}
                    {user && (
                        <div className="border-b border-orange-100 pb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold shadow-md">
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-orange-900">{user.username}</p>
                                    <p className="text-xs text-orange-600">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile navigation links */}
                    <div className="space-y-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setBranchDialogOpen(true)}
                            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 justify-start"
                        >
                            <MapPin className="mr-2 h-4 w-4" />
                            Select Branch
                        </Button>

                        {user ? (
                            <>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate('/customer/profile/edit')}
                                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 justify-start"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate('/customer/addresses')}
                                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 justify-start"
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Manage Addresses
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate('/customer/orders')}
                                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 justify-start"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    My Orders
                                </Button>
                                <div className="pt-2 border-t border-orange-100">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleLogout}
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50 justify-start"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 justify-start"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Sign In
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30 justify-start"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Register
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                <DialogContent className="sm:max-w-[725px] p-0 w-[95vw] max-w-full mx-auto">
                    <BranchSelector
                        branches={branches}
                        onBranchSelect={handleBranchSelect}
                        isDialog={true}
                        currentBranchId={cart.branchId}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CustomerHeader;