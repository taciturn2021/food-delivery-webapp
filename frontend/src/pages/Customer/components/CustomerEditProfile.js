import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getProfile, updatePassword, updateProfile } from '../../../services/api';
import CustomerHeader from '../../../components/customer/CustomerHeader';

const CustomerEditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({ username: '', email: '', firstName: '', lastName: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        getProfile()
            .then(({ data }) => setProfileData({
                username: data.username || '',
                email: data.email || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phone: data.phone || ''
            }))
            .catch(() => setProfileError('We could not load your profile.'))
            .finally(() => setLoading(false));
    }, []);

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        try {
            setSavingProfile(true);
            setProfileError('');
            await updateProfile(profileData);
            const { data } = await getProfile();
            localStorage.setItem('user', JSON.stringify(data));
            setProfileMessage('Profile saved');
        } catch (saveError) {
            setProfileError(saveError.response?.data?.message || 'We could not save your profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setPasswordError('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        try {
            setSavingPassword(true);
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordMessage('Password updated');
        } catch (saveError) {
            setPasswordError(saveError.response?.data?.message || 'We could not update your password.');
        } finally {
            setSavingPassword(false);
        }
    };

    const inputClass = 'customer-focus h-12 w-full rounded-xl border border-[var(--customer-line)] bg-[var(--customer-soft)] px-4 text-sm outline-none transition focus:border-[var(--customer-coral)]';

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader />
            <main className="customer-container pt-[7.5rem]">
                <div className="mb-7 flex items-center gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] transition hover:border-[var(--customer-coral)]"><ArrowLeft className="h-4 w-4" /></button>
                    <div>
                        <p className="customer-eyebrow">Your details</p>
                        <h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Account settings</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="customer-surface flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--customer-coral)]" /></div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="customer-surface p-5 sm:p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--customer-sage-soft)] text-[var(--customer-sage)]"><UserRound className="h-5 w-5" /></span>
                                <div><p className="customer-eyebrow">Profile</p><h2 className="mt-1 text-xl font-bold">About you</h2></div>
                            </div>
                            {profileError && <p className="mb-4 rounded-xl bg-[var(--customer-danger-soft)] px-3 py-2 text-sm text-[var(--customer-coral-dark)]">{profileError}</p>}
                            {profileMessage && <p className="mb-4 flex items-center gap-2 rounded-xl bg-[var(--customer-sage-soft)] px-3 py-2 text-sm font-semibold text-[var(--customer-sage)]"><Check className="h-4 w-4" /> {profileMessage}</p>}
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-semibold">First name<input className={`${inputClass} mt-2`} name="firstName" value={profileData.firstName} onChange={(event) => setProfileData({ ...profileData, firstName: event.target.value })} required /></label>
                                    <label className="text-sm font-semibold">Last name<input className={`${inputClass} mt-2`} name="lastName" value={profileData.lastName} onChange={(event) => setProfileData({ ...profileData, lastName: event.target.value })} required /></label>
                                </div>
                                <label className="block text-sm font-semibold">Phone number<input className={`${inputClass} mt-2`} name="phone" value={profileData.phone} onChange={(event) => setProfileData({ ...profileData, phone: event.target.value })} required /></label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-semibold text-[var(--customer-muted)]">Username<input className={`${inputClass} mt-2 bg-[var(--customer-soft)]`} value={profileData.username || user?.username || ''} disabled /></label>
                                    <label className="text-sm font-semibold text-[var(--customer-muted)]">Email<input className={`${inputClass} mt-2 bg-[var(--customer-soft)]`} value={profileData.email || user?.email || ''} disabled /></label>
                                </div>
                                <button type="submit" disabled={savingProfile} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--customer-coral)] px-5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)] disabled:opacity-50">{savingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Save profile</button>
                            </form>
                        </section>

                        <section className="customer-surface p-5 sm:p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--customer-soft)] text-[var(--customer-coral)]"><LockKeyhole className="h-5 w-5" /></span>
                                <div><p className="customer-eyebrow">Security</p><h2 className="mt-1 text-xl font-bold">Change password</h2></div>
                            </div>
                            {passwordError && <p className="mb-4 rounded-xl bg-[var(--customer-danger-soft)] px-3 py-2 text-sm text-[var(--customer-coral-dark)]">{passwordError}</p>}
                            {passwordMessage && <p className="mb-4 flex items-center gap-2 rounded-xl bg-[var(--customer-sage-soft)] px-3 py-2 text-sm font-semibold text-[var(--customer-sage)]"><Check className="h-4 w-4" /> {passwordMessage}</p>}
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                {[
                                    ['currentPassword', 'Current password'],
                                    ['newPassword', 'New password'],
                                    ['confirmPassword', 'Confirm new password']
                                ].map(([field, label]) => (
                                    <label key={field} className="relative block text-sm font-semibold">{label}
                                        <input className={`${inputClass} mt-2 pr-11`} type={showPassword[field] ? 'text' : 'password'} value={passwordData[field]} onChange={(event) => setPasswordData({ ...passwordData, [field]: event.target.value })} required />
                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, [field]: !showPassword[field] })} className="absolute right-3 top-9 text-[var(--customer-muted)]" aria-label={`Show ${label}`} title={`Show ${label}`}>{showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                    </label>
                                ))}
                                <button type="submit" disabled={savingPassword} className="flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--customer-ink)] px-5 text-sm font-bold transition hover:bg-[var(--customer-coral)] hover:text-white disabled:opacity-50">{savingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button>
                            </form>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerEditProfile;
