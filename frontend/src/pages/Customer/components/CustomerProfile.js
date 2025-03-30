import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getCustomerAddresses, addAddress, updateAddress, deleteAddress, getPublicBranches } from '../../../services/api';
import { ArrowLeft, MapPin, Store, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { AddressForm } from '../../../components/ui/form-address';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import CustomerHeader from '../../../components/customer/CustomerHeader';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();

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
            setTimeout(() => setSuccessMessage(''), 3000);
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
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setError('Failed to update address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await deleteAddress(addressId);
            await loadAddresses();
            setSuccessMessage('Address deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
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
            <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 pt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
                <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => navigate('/')}
                                    className="hover:bg-orange-100 p-2 rounded-full transition-colors text-orange-600"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <h1 className="text-xl sm:text-2xl font-semibold text-orange-900">Manage Addresses</h1>
                            </div>
                            <Button 
                                onClick={() => setShowAddressForm(true)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30 text-xs sm:text-sm py-1.5 sm:py-2.5"
                                size="sm"
                            >
                                <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Add New Address
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-4 sm:mb-6 text-xs sm:text-sm">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert className="mb-4 sm:mb-6 bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        {addresses.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <h2 className="text-lg sm:text-xl font-semibold text-orange-900 mb-2">
                                    You don't have any addresses yet
                                </h2>
                                <p className="text-orange-700 mb-4 sm:mb-6 text-sm sm:text-base">
                                    Add an address to get started ordering food
                                </p>
                                <Button 
                                    onClick={() => setShowAddressForm(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30 text-xs sm:text-sm py-1.5 sm:py-2.5"
                                    size="sm"
                                >
                                    <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Add New Address
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                                {addresses.map((address) => (
                                    <Card key={address.id} className="bg-white/95 backdrop-blur-sm border-orange-100">
                                        <CardContent className="p-3 sm:p-6">
                                            <div className="flex justify-between">
                                                <div>
                                                    <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-medium text-orange-900 mb-1">
                                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                                                        <span className="line-clamp-1">{address.street}</span>
                                                    </div>
                                                    <p className="text-orange-700 text-xs sm:text-base">
                                                        {address.city}, {address.state} {address.zipCode}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-2 text-xs sm:text-sm text-orange-600">
                                                        <Store className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                        {getBranchName(address.branchId)}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 sm:gap-2 ml-2 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-9 sm:w-9 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        onClick={() => setSelectedAddress(address)}
                                                    >
                                                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-9 sm:w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-6 sm:mt-8 flex justify-center">
                            <Button 
                                variant="outline" 
                                onClick={() => navigate('/customer/profile/edit')}
                                className="border-orange-200 text-orange-700 hover:bg-orange-50 text-xs sm:text-sm py-1.5 sm:py-2.5"
                                size="sm"
                            >
                                Edit Profile
                            </Button>
                        </div>

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
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerProfile;