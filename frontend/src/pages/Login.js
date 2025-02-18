import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Avatar,
    CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        const redirectPath = {
            'admin': '/admin',
            'branch_manager': '/branch',
            'rider': '/rider'
        }[user.role] || '/login';
        return <Navigate to={redirectPath} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Trim email to remove any accidental spaces
        const cleanedFormData = {
            email: formData.email.trim(),
            password: formData.password
        };

        console.log('Attempting login with:', { 
            email: cleanedFormData.email,
            passwordLength: cleanedFormData.password.length 
        });

        try {
            const response = await loginApi(cleanedFormData);
            console.log('Raw API Response:', response);
            
            if (response.data?.token && response.data?.user) {
                console.log('Login successful:', {
                    userId: response.data.user.id,
                    role: response.data.user.role,
                    hasToken: !!response.data.token
                });
                login(response.data.token, response.data.user);
                const redirectPath = {
                    'admin': '/admin',
                    'branch_manager': '/branch',
                    'rider': '/rider'
                }[response.data.user.role] || '/login';
                navigate(redirectPath);
            } else {
                console.error('Invalid response structure:', response.data);
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Login error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Helper text to show the expected credentials
    const helperText = process.env.NODE_ENV === 'development' ? 
        "Default admin credentials: admin@example.com / admin123" : "";

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
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
                        <LockOutlinedIcon fontSize="large" />
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
                        Sign in to your account
                    </Typography>

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
                        onSubmit={handleSubmit} 
                        noValidate 
                        sx={{ 
                            width: '100%',
                            mt: 1
                        }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            helperText={process.env.NODE_ENV === 'development' ? 
                                "Default: admin@example.com / admin123" : ""}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                position: 'relative'
                            }}
                        >
                            {loading ? (
                                <CircularProgress 
                                    size={24} 
                                    sx={{
                                        position: 'absolute',
                                        color: 'primary.light'
                                    }}
                                />
                            ) : 'Sign in'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;