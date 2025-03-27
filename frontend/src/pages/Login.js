import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, UtensilsCrossed } from 'lucide-react';

const Login = () => {
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
            'customer': '/',
            'admin': '/admin',
            'branch_manager': '/branch',
            'rider': '/rider'
        }[user.role] || '/';
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
                if (response.data.user.role !== 'customer') {
                    setError('This login is for customers only. Staff members please use the admin login.');
                    return;
                }
                login(response.data.token, response.data.user);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[url('/src/components/ui/assets/food-pattern-bg.jpg')] bg-repeat bg-orange-50 py-12 px-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
            <div className="container mx-auto max-w-md relative z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-orange-100">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="absolute top-4 left-4 text-orange-600 hover:text-orange-700"
                    >
                        ← Back to Menu
                    </button>
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform">
                            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-center text-orange-900 mb-2">
                            Welcome Back!
                        </h1>
                        <p className="text-orange-600 text-center">
                            Ready to order your favorite dishes?
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Input
                                type="email"
                                placeholder="Email Address"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                name="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                                className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cooking up...
                                </>
                            ) : (
                                'Let\'s Eat!'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 flex justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-orange-700 hover:text-orange-500 font-medium"
                        >
                            New here? Join the feast!
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('')}
                            className="text-orange-700 hover:text-orange-500 font-medium"
                        >
                            Forgot Password? (not implemented yet)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;