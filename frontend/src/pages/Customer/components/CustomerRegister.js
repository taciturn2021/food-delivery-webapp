import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Link,
    useTheme,
    alpha
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { registerCustomer } from '../../../services/api';

const CustomerRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await registerCustomer({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'customer'
            });

            // Log the user in after successful registration
            login(response.data.token, response.data.user);
            navigate('/customer/profile');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                py: 8
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                underline="hover"
                                sx={{ cursor: 'pointer' }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CustomerRegister;