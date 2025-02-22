import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
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
    Link
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect logged in users
    if (user) {
        const redirectPath = {
            'admin': '/admin',
            'branch_manager': '/branch',
            'rider': '/rider'
        }[user.role] || '/admin/login';
        return <Navigate to={redirectPath} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const cleanedFormData = {
            email: formData.email.trim(),
            password: formData.password
        };

        try {
            const response = await loginApi(cleanedFormData);
            
            if (response.data?.token && response.data?.user) {
                if (response.data.user.role === 'customer') {
                    setError('This login is for staff members only. Customers please use the main login.');
                    return;
                }
                login(response.data.token, response.data.user);
                const redirectPath = {
                    'admin': '/admin',
                    'branch_manager': '/branch',
                    'rider': '/rider'
                }[response.data.user.role] || '/admin/login';
                navigate(redirectPath);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56
                    }}>
                        <AdminPanelSettingsIcon fontSize="large" />
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
                        Staff Login
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
                            sx={{ 
                                mt: 3, 
                                mb: 2,
                                py: 1.5,
                                fontSize: '1.1rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                        
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Link href="/login" variant="body2" sx={{ color: 'text.secondary' }}>
                                Back to Customer Login
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AdminLogin;