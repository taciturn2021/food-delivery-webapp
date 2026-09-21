import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, UserRound } from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { registerCustomer } from '../../../services/api';

const CustomerRegister = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();

    if (user) {
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: ''
    });

    const steps = ['Account', 'About you'];
    const inputClass = 'customer-focus h-12 w-full rounded-xl border border-[var(--customer-line)] bg-[var(--customer-soft)] px-4 text-sm outline-none transition focus:border-[var(--customer-coral)]';

    const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

    const validateStep = () => {
        const errors = {};
        if (activeStep === 0) {
            if (!formData.username || formData.username.length < 3) errors.username = 'Use at least 3 characters.';
            if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email.';
            if (!formData.password || formData.password.length < 6) errors.password = 'Use at least 6 characters.';
            if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
        } else {
            if (!formData.firstName) errors.firstName = 'First name is required.';
            if (!formData.lastName) errors.lastName = 'Last name is required.';
            if (!formData.phone || !/^\+?[\d\s-]{10,}$/.test(formData.phone)) errors.phone = 'Enter a valid phone number.';
        }
        setFormErrors(errors);
        return !Object.keys(errors).length;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateStep()) return;
        if (activeStep === 0) {
            setActiveStep(1);
            setError('');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await registerCustomer({
                username: formData.username,
                email: formData.email.toLowerCase(),
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone
            });
            if (response.data?.token && response.data?.user) {
                await login(response.data.token, response.data.user);
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch (registerError) {
            const message = registerError.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
            if (message.toLowerCase().includes('exists')) setActiveStep(0);
        } finally {
            setLoading(false);
        }
    };

    const field = (name, label, type = 'text', placeholder = label) => (
        <label className="block text-sm font-bold">
            {label}
            <input className={`${inputClass} mt-2 ${formErrors[name] ? 'border-[var(--customer-coral)]' : ''}`} type={type} value={formData[name]} placeholder={placeholder} onChange={(event) => updateField(name, event.target.value)} />
            {formErrors[name] && <span className="mt-1 block text-xs font-normal text-[var(--customer-coral-dark)]">{formErrors[name]}</span>}
        </label>
    );

    return (
        <div className="customer-page flex min-h-screen items-center px-4 py-8 sm:py-12">
            <main className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--customer-line)] bg-[var(--customer-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative hidden overflow-hidden bg-[var(--customer-surface-raised)] p-10 text-[var(--customer-ink)] md:block lg:p-14">
                    <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[var(--customer-coral)]/15" />
                    <div className="relative flex h-full flex-col justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--customer-coral)] text-xl text-white">✦</span>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--customer-coral)]">A better table awaits</p>
                            <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.07em]">Join the neighborhood.</h1>
                            <p className="mt-5 max-w-xs text-sm leading-6 text-[var(--customer-muted)]">Save your favorite spots, keep your addresses handy, and order with less fuss.</p>
                        </div>
                        <p className="text-xs text-[var(--customer-muted)]">Table &amp; Thyme</p>
                    </div>
                </div>

                <div className="p-6 sm:p-10 lg:p-14">
                    <button type="button" onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-sm font-semibold text-[var(--customer-muted)] hover:text-[var(--customer-ink)]"><ArrowLeft className="h-4 w-4" /> Back to menu</button>
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--customer-sage-soft)] text-[var(--customer-sage)]"><UserRound className="h-5 w-5" /></span>
                        <div><p className="customer-eyebrow">New customer</p><h2 className="mt-1 text-3xl font-black tracking-[-0.06em]">Make it yours.</h2></div>
                    </div>
                    <div className="mt-8 flex items-center gap-3">
                        {steps.map((step, index) => <React.Fragment key={step}><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index <= activeStep ? 'bg-[var(--customer-coral)] text-white' : 'bg-[var(--customer-soft)] text-[var(--customer-muted)]'}`}>{index < activeStep ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`text-xs font-bold ${index === activeStep ? 'text-[var(--customer-ink)]' : 'text-[var(--customer-muted)]'}`}>{step}</span>{index < steps.length - 1 && <span className="h-px flex-1 bg-[var(--customer-line)]" />}</React.Fragment>)}
                    </div>
                    {error && <div className="mt-6 rounded-xl border border-[var(--customer-coral)] bg-[var(--customer-danger-soft)] px-4 py-3 text-sm leading-6 text-[var(--customer-coral-dark)]">{error}</div>}
                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                        {activeStep === 0 ? (
                            <>
                                {field('username', 'Username')}
                                {field('email', 'Email address', 'email')}
                                {field('password', 'Password', 'password')}
                                {field('confirmPassword', 'Confirm password', 'password')}
                            </>
                        ) : (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">{field('firstName', 'First name')}{field('lastName', 'Last name')}</div>
                                {field('phone', 'Phone number', 'tel')}
                            </>
                        )}
                        <div className="flex gap-3 pt-2">
                            {activeStep === 1 && <button type="button" onClick={() => { setActiveStep(0); setFormErrors({}); }} className="h-12 rounded-full border border-[var(--customer-line)] px-5 text-sm font-bold transition hover:border-[var(--customer-ink)]">Back</button>}
                            <button type="submit" disabled={loading} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--customer-coral)] px-5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)] disabled:opacity-50">
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />} {activeStep === 0 ? 'Continue' : 'Create account'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-8 text-center text-sm text-[var(--customer-muted)]">Already have an account? <button type="button" onClick={() => navigate('/login', { state: location.state })} className="font-bold text-[var(--customer-coral-dark)] hover:underline">Sign in</button></p>
                </div>
            </main>
        </div>
    );
};

export default CustomerRegister;
