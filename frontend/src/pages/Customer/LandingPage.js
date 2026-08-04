import React, { useEffect, useState } from 'react';
import { ArrowDown, Clock3, MapPin } from 'lucide-react';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerMenu from './components/CustomerMenu';
import BranchSelector from './components/BranchSelector';
import { CustomerError, CustomerLoading } from '../../components/customer/CustomerStates';
import { getPublicBranches } from '../../services/api';
import { useCart } from '../../context/CartContext';

const LandingPage = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cart, setBranch } = useCart();

    const loadBranches = async () => {
        try {
            setLoading(true);
            const response = await getPublicBranches();
            const activeBranches = response.data.filter((branch) => branch.status === 'active');
            setBranches(activeBranches);

            const savedBranchId = cart.branchId || Number(localStorage.getItem('selectedBranch'));
            const savedBranch = activeBranches.find((branch) => branch.id === savedBranchId);
            setSelectedBranch(savedBranch || null);
            setError(null);
        } catch (fetchError) {
            console.error('Error fetching branches:', fetchError);
            setError('We could not load the kitchens right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, [cart.branchId]);

    const handleBranchSelect = (branchId) => {
        const branch = branches.find((item) => item.id === branchId);
        if (!branch) return;
        setBranch(branchId);
        setSelectedBranch(branch);
    };

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader onBranchSelect={handleBranchSelect} />
            <main className="customer-container pt-[5.75rem]">
                <section className="max-w-3xl pb-8 pt-6 sm:pb-10 sm:pt-10">
                    <p className="customer-eyebrow">Night kitchen</p>
                    <h1 className="mt-3 text-4xl font-black leading-[0.98] tracking-[-0.065em] sm:text-5xl lg:text-6xl">
                        Order something good.{' '}
                        <span className="text-[var(--customer-coral)]">Tonight.</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[var(--customer-muted)] sm:text-lg">
                        Local kitchens, real menus, delivered while it still tastes like it should.
                    </p>
                    {selectedBranch ? (
                        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-[var(--customer-line)] bg-[var(--customer-surface)] px-4 py-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--customer-sage-soft)] text-[var(--customer-sage)]">
                                <MapPin className="h-5 w-5" />
                            </span>
                            <span>
                                <span className="block text-xs text-[var(--customer-muted)]">Browsing</span>
                                <span className="block font-bold">{selectedBranch.name}</span>
                            </span>
                            <span className="ml-1 hidden items-center gap-1 text-xs font-semibold text-[var(--customer-sage)] sm:flex">
                                <Clock3 className="h-3.5 w-3.5" /> Open
                            </span>
                        </div>
                    ) : (
                        <a
                            href="#choose-branch"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--customer-coral)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]"
                        >
                            Choose a kitchen <ArrowDown className="h-4 w-4" />
                        </a>
                    )}
                </section>

                {loading ? (
                    <CustomerLoading label="Finding nearby kitchens..." />
                ) : error ? (
                    <CustomerError message={error} onRetry={loadBranches} />
                ) : selectedBranch ? (
                    <CustomerMenu branchId={selectedBranch.id} branch={selectedBranch} />
                ) : (
                    <section id="choose-branch" className="scroll-mt-24 pb-12">
                        <BranchSelector branches={branches} onBranchSelect={handleBranchSelect} />
                    </section>
                )}
            </main>
        </div>
    );
};

export default LandingPage;
