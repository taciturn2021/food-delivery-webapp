import React, { useState } from 'react';
import { ArrowLeft, Loader2, LockKeyhole, UtensilsCrossed } from 'lucide-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        const from = location.state?.from?.pathname || ({ customer: '/', admin: '/admin', branch_manager: '/branch', rider: '/rider' }[user.role] || '/');
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await loginApi({ email: formData.email.trim(), password: formData.password });
            if (response.data?.token && response.data?.user) {
                if (response.data.user.role !== 'customer') {
                    setError('This entrance is for customers. Staff members should use the staff login.');
                    return;
                }
                login(response.data.token, response.data.user);
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
        } catch (loginError) {
            setError(loginError.response?.data?.message || 'That email and password combination did not work.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'customer-focus h-12 w-full rounded-xl border border-[var(--customer-line)] bg-[var(--customer-soft)] px-4 text-sm outline-none transition focus:border-[var(--customer-coral)]';

    return (
        <div className="customer-page flex min-h-screen items-center px-4 py-8 sm:py-12">
            <main className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--customer-line)] bg-[var(--customer-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative hidden overflow-hidden bg-[var(--customer-surface-raised)] p-10 text-[var(--customer-ink)] md:block lg:p-14">
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--customer-coral)]/20" />
                    <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[var(--customer-gold)]/10" />
                    <div className="relative flex h-full flex-col justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--customer-coral)] text-xl text-white">✦</span>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--customer-coral)]">Welcome back</p>
                            <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.07em]">Pull up a chair.</h1>
                            <p className="mt-5 max-w-xs text-sm leading-6 text-[var(--customer-muted)]">Your favorite local dishes are closer than you think.</p>
                        </div>
                        <p className="text-xs text-[var(--customer-muted)]">Table &amp; Thyme</p>
                    </div>
                </div>

                <div className="p-6 sm:p-10 lg:p-14">
                    <button type="button" onClick={() => navigate('/')} className="mb-10 flex items-center gap-2 text-sm font-semibold text-[var(--customer-muted)] hover:text-[var(--customer-ink)]">
                        <ArrowLeft className="h-4 w-4" /> Back to menu
                    </button>
                    <div className="mb-8 md:hidden">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--customer-soft)] text-[var(--customer-coral)]"><UtensilsCrossed className="h-5 w-5" /></span>
                    </div>
                    <p className="customer-eyebrow">Customer sign in</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.06em]">Welcome back.</h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--customer-muted)]">Sign in to pick up where you left off.</p>

                    {error && <div className="mt-6 rounded-xl border border-[var(--customer-coral)] bg-[var(--customer-danger-soft)] px-4 py-3 text-sm leading-6 text-[var(--customer-coral-dark)]">{error}</div>}
                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                        <label className="block text-sm font-bold">Email address<input className={`${inputClass} mt-2`} type="email" autoComplete="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required /></label>
                        <label className="block text-sm font-bold">Password<div className="relative mt-2"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--customer-muted)]" /><input className={`${inputClass} pl-11`} type="password" autoComplete="current-password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required /></div></label>
                        <button type="submit" disabled={loading} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--customer-coral)] px-5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)] disabled:opacity-50">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />} {loading ? 'Opening your table...' : 'Sign in'}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-[var(--customer-muted)]">
                        New here? <button type="button" onClick={() => navigate('/register', { state: location.state })} className="font-bold text-[var(--customer-coral-dark)] hover:underline">Create an account</button>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;
