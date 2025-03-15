import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Grid,
    TextField,
    Alert,
    Snackbar,
    Divider,
    IconButton,
    InputAdornment,
    CircularProgress,
    useTheme,
    alpha,
    FormHelperText
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    ArrowBack as ArrowBackIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getProfile, updateProfile, updatePassword } from '../../../services/api';
import CustomerHeader from '../../../components/customer/CustomerHeader';

const CustomerEditProfile = () => {
    const navigate = useNavigate();
    const theme = useTheme();
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

    // Check password matching as user types
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
            
            // Refresh user data in localStorage
            const response = await getProfile();
            localStorage.setItem('user', JSON.stringify(response.data));
            // Note: We don't have direct setUser in context, but localStorage update
            // will be picked up on next page load or app refresh
        } catch (error) {
            setProfileError(error.response?.data?.message || 'Failed to update profile');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPasswordError('');
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        try {
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccessMessage('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            // Reset password matching state
            setPasswordMatch({ match: true, touched: false });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
            console.error('Error updating password:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CustomerHeader />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                    py: 8,
                    mt: 8
                }}
            >
                <Container maxWidth="lg">
                    <Paper sx={{ p: 4 }}>
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                            <IconButton sx={{ mr: 1 }} onClick={() => navigate(-1)}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" component="h1">
                                Edit Profile
                            </Typography>
                        </Box>

                        <Grid container spacing={4}>
                            {/* Profile Information Section */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Profile Information
                                </Typography>
                                {profileError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {profileError}
                                    </Alert>
                                )}
                                <Box component="form" onSubmit={handleProfileSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Username"
                                                name="username"
                                                value={profileData.username}
                                                onChange={handleProfileChange}
                                                disabled
                                                helperText="Username cannot be changed"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                disabled
                                                helperText="Email cannot be changed"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                name="firstName"
                                                value={profileData.firstName}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                name="lastName"
                                                value={profileData.lastName}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                disabled={loading}
                                            >
                                                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>

                            {/* Change Password Section */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Change Password
                                </Typography>
                                {passwordError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {passwordError}
                                    </Alert>
                                )}
                                <Box component="form" onSubmit={handlePasswordSubmit}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Current Password"
                                                name="currentPassword"
                                                type={showPassword.currentPassword ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => togglePasswordVisibility('currentPassword')}
                                                                edge="end"
                                                            >
                                                                {showPassword.currentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="New Password"
                                                name="newPassword"
                                                type={showPassword.newPassword ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => togglePasswordVisibility('newPassword')}
                                                                edge="end"
                                                            >
                                                                {showPassword.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Confirm New Password"
                                                name="confirmPassword"
                                                type={showPassword.confirmPassword ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                error={passwordMatch.touched && !passwordMatch.match}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {passwordMatch.touched && (
                                                                passwordMatch.match 
                                                                    ? <CheckIcon style={{ color: 'green' }} /> 
                                                                    : <CloseIcon color="error" />
                                                            )}
                                                            <IconButton
                                                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                                                edge="end"
                                                            >
                                                                {showPassword.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                            {passwordMatch.touched && !passwordMatch.match && (
                                                <FormHelperText error>
                                                    Passwords don't match
                                                </FormHelperText>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                disabled={loading || (passwordMatch.touched && !passwordMatch.match)}
                                            >
                                                {loading ? <CircularProgress size={24} /> : 'Update Password'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate('/customer/addresses')}
                            >
                                Manage Addresses
                            </Button>
                        </Box>
                    </Paper>
                </Container>
                
                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={6000}
                    onClose={() => setSuccessMessage('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={() => setSuccessMessage('')} 
                        severity="success"
                        sx={{ width: '100%' }}
                    >
                        {successMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
};

export default CustomerEditProfile;