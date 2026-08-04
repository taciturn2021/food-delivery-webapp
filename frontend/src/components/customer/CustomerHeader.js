import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    House,
    LogOut,
    MapPin,
    Menu as MenuIcon,
    ShoppingBag,
    UserRound,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getPublicBranches } from '../../services/api';
import BranchSelector from '../../pages/Customer/components/BranchSelector';
import { Dialog, DialogContent } from '../ui/dialog';

const CustomerHeader = ({ onBranchSelect }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cart, clearCart, setBranch } = useCart();
    const [branches, setBranches] = useState([]);
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        getPublicBranches()
            .then((response) => {
                if (mounted) {
                    setBranches(response.data.filter((branch) => branch.status === 'active'));
                }
            })
            .catch((error) => console.error('Error fetching branches:', error));

        return () => {
            mounted = false;
        };
    }, []);

    const selectedBranch = useMemo(
        () => branches.find((branch) => branch.id === cart.branchId),
        [branches, cart.branchId]
    );

    const handleBranchSelect = (branchId) => {
        if (cart.branchId !== branchId) {
            clearCart();
            setBranch(branchId);
        }

        onBranchSelect?.(branchId);
        setBranchDialogOpen(false);
        setMobileMenuOpen(false);
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const goTo = (path) => {
        setProfileOpen(false);
        setMobileMenuOpen(false);
        navigate(path);
    };

    return (
        <>
            <header className="customer-header fixed inset-x-0 top-0 z-50">
                <div className="customer-container">
                    <div className="flex h-16 items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => goTo('/')}
                            className="flex shrink-0 items-center gap-2.5 text-left"
                            aria-label="Go to home"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--customer-coral)] text-base font-black text-white">
                                ✦
                            </span>
                            <span className="hidden text-lg font-extrabold tracking-[-0.04em] sm:block">
                                Table &amp; Thyme
                            </span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setBranchDialogOpen(true)}
                                className="hidden max-w-[15rem] items-center gap-2 rounded-full border border-[var(--customer-line)] bg-[var(--customer-surface)] px-3 py-2 text-left transition hover:border-[var(--customer-coral)] sm:flex"
                            >
                                <MapPin className="h-4 w-4 shrink-0 text-[var(--customer-coral)]" />
                                <span className="min-w-0">
                                    <span className="block text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--customer-muted)]">
                                        Branch
                                    </span>
                                    <span className="block truncate text-xs font-bold">
                                        {selectedBranch?.name || 'Choose location'}
                                    </span>
                                </span>
                            </button>

                            {user && (
                                <button
                                    type="button"
                                    onClick={() => goTo('/customer/orders')}
                                    className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[var(--customer-muted)] transition hover:bg-[var(--customer-soft)] hover:text-[var(--customer-ink)] md:inline-flex"
                                >
                                    Orders
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => goTo('/cart')}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] bg-[var(--customer-surface)] transition hover:border-[var(--customer-coral)]"
                                aria-label={`Cart with ${cart.items.length} unique items`}
                            >
                                <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
                                {cart.items.length > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--customer-coral)] px-1 text-[0.65rem] font-bold text-white">
                                        {cart.items.length}
                                    </span>
                                )}
                            </button>

                            {user ? (
                                <div className="relative hidden md:block">
                                    <button
                                        type="button"
                                        onClick={() => setProfileOpen((open) => !open)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--customer-soft)] text-sm font-bold transition hover:bg-[var(--customer-coral)] hover:text-white"
                                        aria-label="Open account menu"
                                        aria-expanded={profileOpen}
                                    >
                                        {user.username?.[0]?.toUpperCase() || <UserRound className="h-4 w-4" />}
                                    </button>
                                    {profileOpen && (
                                        <div className="customer-surface absolute right-0 top-12 w-64 overflow-hidden p-2">
                                            <div className="border-b border-[var(--customer-line)] px-3 pb-3 pt-2">
                                                <p className="font-bold">{user.username}</p>
                                                <p className="mt-1 truncate text-xs text-[var(--customer-muted)]">{user.email}</p>
                                            </div>
                                            <button type="button" onClick={() => goTo('/customer/profile/edit')} className="customer-soft-hover mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm">
                                                <UserRound className="h-4 w-4 text-[var(--customer-coral)]" /> Account
                                            </button>
                                            <button type="button" onClick={() => goTo('/customer/addresses')} className="customer-soft-hover flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm">
                                                <MapPin className="h-4 w-4 text-[var(--customer-coral)]" /> Addresses
                                            </button>
                                            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--customer-coral)] transition hover:bg-[var(--customer-danger-soft)]">
                                                <LogOut className="h-4 w-4" /> Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden items-center gap-2 md:flex">
                                    <button type="button" onClick={() => goTo('/login')} className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--customer-muted)] hover:text-[var(--customer-ink)]">
                                        Sign in
                                    </button>
                                    <button type="button" onClick={() => goTo('/register')} className="rounded-full bg-[var(--customer-coral)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]">
                                        Join us
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((open) => !open)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] md:hidden"
                                aria-label="Toggle navigation"
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-x-0 top-16 z-40 border-b border-[var(--customer-line)] bg-[var(--customer-surface)] px-4 py-4 shadow-xl md:hidden">
                    <div className="customer-container space-y-2">
                        <button type="button" onClick={() => setBranchDialogOpen(true)} className="customer-soft flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left">
                            <MapPin className="h-5 w-5 text-[var(--customer-coral)]" />
                            <span>
                                <span className="block text-xs text-[var(--customer-muted)]">Ordering from</span>
                                <span className="block font-bold">{selectedBranch?.name || 'Choose a branch'}</span>
                            </span>
                        </button>
                        <button type="button" onClick={() => goTo('/customer/orders')} className="customer-soft-hover flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold">
                            <ClipboardList className="h-5 w-5 text-[var(--customer-sage)]" /> My orders
                        </button>
                        {user ? (
                            <>
                                <button type="button" onClick={() => goTo('/customer/profile/edit')} className="customer-soft-hover flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold">
                                    <UserRound className="h-5 w-5 text-[var(--customer-sage)]" /> Account
                                </button>
                                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[var(--customer-coral)] hover:bg-[var(--customer-danger-soft)]">
                                    <LogOut className="h-5 w-5" /> Sign out
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => goTo('/login')} className="customer-soft-hover flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold">
                                <UserRound className="h-5 w-5 text-[var(--customer-sage)]" /> Sign in
                            </button>
                        )}
                    </div>
                </div>
            )}

            <nav className="customer-mobile-nav fixed inset-x-0 bottom-0 z-40 flex items-center justify-around py-2 md:hidden">
                <button type="button" onClick={() => goTo('/')} className="flex min-w-16 flex-col items-center gap-1 px-3 py-1 text-[0.65rem] font-semibold text-[var(--customer-muted)]">
                    <House className="h-5 w-5" /> Home
                </button>
                <button type="button" onClick={() => goTo('/customer/orders')} className="flex min-w-16 flex-col items-center gap-1 px-3 py-1 text-[0.65rem] font-semibold text-[var(--customer-muted)]">
                    <ClipboardList className="h-5 w-5" /> Orders
                </button>
                <button type="button" onClick={() => goTo('/cart')} className="flex min-w-16 flex-col items-center gap-1 px-3 py-1 text-[0.65rem] font-semibold text-[var(--customer-coral)]">
                    <ShoppingBag className="h-5 w-5" /> Bag
                </button>
            </nav>

            <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                <DialogContent className="customer-surface max-h-[85vh] w-[min(94vw,42rem)] overflow-y-auto border-[var(--customer-line)] bg-[var(--customer-surface)] p-0 text-[var(--customer-ink)]">
                    <BranchSelector branches={branches} currentBranchId={cart.branchId} onBranchSelect={handleBranchSelect} isDialog />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CustomerHeader;
