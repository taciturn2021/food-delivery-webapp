import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { registerCustomer } from '../../../services/api';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Stepper } from '../../../components/ui/stepper';

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
        const inputClassName = "border-orange-200 focus:border-orange-500 focus:ring-orange-500";
        const errorClassName = "text-sm text-red-500 mt-1";
        
        switch (step) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div>
                            <Input
                                placeholder="Username"
                                name="username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className={`${inputClassName} ${formErrors.username ? 'border-red-500' : ''}`}
                            />
                            {formErrors.username && (
                                <p className={errorClassName}>{formErrors.username}</p>
                            )}
                        </div>
                        <div>
                            <Input
                                type="email"
                                placeholder="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`${inputClassName} ${formErrors.email ? 'border-red-500' : ''}`}
                            />
                            {formErrors.email && (
                                <p className={errorClassName}>{formErrors.email}</p>
                            )}
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className={`${inputClassName} ${formErrors.password ? 'border-red-500' : ''}`}
                            />
                            {formErrors.password && (
                                <p className={errorClassName}>{formErrors.password}</p>
                            )}
                        </div>
                        <div>
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className={`${inputClassName} ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                            />
                            {formErrors.confirmPassword && (
                                <p className={errorClassName}>{formErrors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    placeholder="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className={`${inputClassName} ${formErrors.firstName ? 'border-red-500' : ''}`}
                                />
                                {formErrors.firstName && (
                                    <p className={errorClassName}>{formErrors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <Input
                                    placeholder="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className={`${inputClassName} ${formErrors.lastName ? 'border-red-500' : ''}`}
                                />
                                {formErrors.lastName && (
                                    <p className={errorClassName}>{formErrors.lastName}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Input
                                placeholder="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className={`${inputClassName} ${formErrors.phone ? 'border-red-500' : ''}`}
                            />
                            {formErrors.phone && (
                                <p className={errorClassName}>{formErrors.phone}</p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
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

                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform">
                            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-center text-orange-900 mb-2">
                            Join Our Food Family!
                        </h1>
                        <p className="text-orange-600 text-center">
                            A world of delicious food awaits you
                        </p>
                    </div>

                    <Stepper 
                        steps={steps} 
                        activeStep={activeStep} 
                        className="mb-8"
                        activeColor="rgb(249, 115, 22)"
                        inactiveColor="rgb(254, 215, 170)"
                    />

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext} className="space-y-4">
                        <div className="space-y-4">
                            {renderStepContent(activeStep)}
                        </div>

                        <div className="flex justify-between mt-8 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={activeStep === 0 || loading}
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                Back
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Preparing...
                                    </>
                                ) : activeStep === steps.length - 1 ? (
                                    'Start Your Food Journey!'
                                ) : (
                                    'Next'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-orange-700 hover:text-orange-500 font-medium"
                        >
                            Already a foodie? Sign in!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegister;