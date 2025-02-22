import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { registerCustomer } from '../../../services/api';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Avatar,
    CircularProgress,
    Link,
    Stepper,
    Step,
    StepLabel,
    Grid
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const CustomerRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const steps = ['Account Details', 'Personal Information'];

    const validateStep = (step) => {
        const errors = {};
        
        if (step === 0) {
            if (!formData.username) errors.username = 'Username is required';
            else if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
            
            if (!formData.email) errors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
            
            if (!formData.password) errors.password = 'Password is required';
            else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
            
            if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
            else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        } else if (step === 1) {
            if (!formData.firstName) errors.firstName = 'First name is required';
            if (!formData.lastName) errors.lastName = 'Last name is required';
            if (!formData.phone) errors.phone = 'Phone number is required';
            else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) errors.phone = 'Please enter a valid phone number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = async (e) => {
        e.preventDefault();
        if (validateStep(activeStep)) {
            setActiveStep(prevStep => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(activeStep)) return;

        setLoading(true);
        setError('');

        try {
            const customerData = {
                username: formData.username,
                email: formData.email.toLowerCase(),
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone
            };

            const response = await registerCustomer(customerData);
            if (response.data?.token && response.data?.user) {
                await login(response.data.token, response.data.user);
                navigate('/');
            } else {
                setError('Registration failed. Please try again.');
                setActiveStep(0);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            // If there's a username/email conflict, go back to first step
            if (errorMessage.includes('exists')) {
                setActiveStep(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                error={!!formErrors.username}
                                helperText={formErrors.username}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="password"
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                error={!!formErrors.password}
                                helperText={formErrors.password}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                error={!!formErrors.confirmPassword}
                                helperText={formErrors.confirmPassword}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="firstName"
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                error={!!formErrors.firstName}
                                helperText={formErrors.firstName}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                error={!!formErrors.lastName}
                                helperText={formErrors.lastName}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="phone"
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                error={!!formErrors.phone}
                                helperText={formErrors.phone}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(45deg, #FF5F6D 30%, #FFC371 90%)',
                py: 12,
                px: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper 
                    elevation={6} 
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                >
                    <Avatar sx={{ 
                        m: 1, 
                        bgcolor: 'secondary.main',
                        width: 56,
                        height: 56
                    }}>
                        <PersonAddIcon fontSize="large" />
                    </Avatar>

                    <Typography
                        component="h1"
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ 
                            mb: 3,
                            fontWeight: 600,
                            color: 'primary.main'
                        }}
                    >
                        Create Account
                    </Typography>

                    <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                width: '100%'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                        noValidate 
                        sx={{ width: '100%' }}
                    >
                        {renderStepContent(activeStep)}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0 || loading}
                                sx={{ mr: 1 }}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 
                                    activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
                            </Button>
                        </Box>

                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Link href="/login" variant="body2" sx={{ color: 'text.secondary' }}>
                                Already have an account? Sign in
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CustomerRegister;