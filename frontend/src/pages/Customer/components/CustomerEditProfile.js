import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getProfile, updateProfile, updatePassword } from '../../../services/api';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import CustomerHeader from '../../../components/customer/CustomerHeader';

const CustomerEditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    
    const [loading, setLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordMatch, setPasswordMatch] = useState({
        match: true,
        touched: false
    });

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const response = await getProfile();
                const userData = response.data;
                setProfileData({
                    username: userData.username || '',
                    email: userData.email || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    phone: userData.phone || ''
                });
            } catch (error) {
                setProfileError('Failed to load profile information');
                console.error('Error loading profile:', error);
            }
        };
        loadUserProfile();
    }, []);

    useEffect(() => {
        if (passwordData.newPassword || passwordData.confirmPassword) {
            setPasswordMatch({
                match: passwordData.newPassword === passwordData.confirmPassword,
                touched: true
            });
        } else {
            setPasswordMatch({ match: true, touched: false });
        }
    }, [passwordData.newPassword, passwordData.confirmPassword]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileError('');
        
        try {
            await updateProfile(profileData);
            setSuccessMessage('Profile updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            
            // Refresh user data in localStorage
            const response = await getProfile();
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            setProfileError(error.response?.data?.message || 'Failed to update profile');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        setPasswordError('');

        try {
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccessMessage('Password updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordMatch({ match: true, touched: false });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CustomerHeader />
            <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 pt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <button 
                                onClick={() => navigate(-1)}
                                className="hover:bg-orange-100 p-2 rounded-full transition-colors text-orange-600"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h1 className="text-2xl font-semibold text-orange-900">Edit Profile</h1>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Profile Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-orange-900 mb-4">Profile Information</h2>
                                {profileError && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription>{profileError}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div>
                                        <Input
                                            name="username"
                                            value={profileData.username}
                                            onChange={handleProfileChange}
                                            disabled
                                            placeholder="Username"
                                            className="border-orange-200 bg-orange-50/50"
                                        />
                                        <p className="text-sm text-orange-600/70 mt-1">Username cannot be changed</p>
                                    </div>
                                    
                                    <div>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            disabled
                                            placeholder="Email"
                                            className="border-orange-200 bg-orange-50/50"
                                        />
                                        <p className="text-sm text-orange-600/70 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleProfileChange}
                                            placeholder="First Name"
                                            required
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                        <Input
                                            name="lastName"
                                            value={profileData.lastName}
                                            onChange={handleProfileChange}
                                            placeholder="Last Name"
                                            required
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            placeholder="Phone Number"
                                            required
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Profile'
                                        )}
                                    </Button>
                                </form>
                            </div>

                            {/* Change Password Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-orange-900 mb-4">Change Password</h2>
                                {passwordError && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription>{passwordError}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type={showPassword.currentPassword ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Current Password"
                                            required
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('currentPassword')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                                        >
                                            {showPassword.currentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type={showPassword.newPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="New Password"
                                            required
                                            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                                        >
                                            {showPassword.newPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type={showPassword.confirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm New Password"
                                            required
                                            className={
                                                passwordMatch.touched && !passwordMatch.match
                                                    ? 'border-red-500 focus-visible:ring-red-500'
                                                    : 'border-orange-200 focus:border-orange-500 focus:ring-orange-500'
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                                        >
                                            {showPassword.confirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                        {passwordMatch.touched && !passwordMatch.match && (
                                            <p className="text-sm text-red-500 mt-1">Passwords don't match</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading || (passwordMatch.touched && !passwordMatch.match)}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {successMessage && (
                            <Alert className="mt-6 bg-green-50 text-green-700 border-green-200">
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        <div className="mt-8 flex justify-center">
                            <Button 
                                variant="outline" 
                                onClick={() => navigate('/customer/addresses')}
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                Manage Addresses
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerEditProfile;