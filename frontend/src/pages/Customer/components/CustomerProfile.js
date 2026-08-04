import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Pencil, Plus, Store, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { addAddress, deleteAddress, getCustomerAddresses, getPublicBranches, updateAddress } from '../../../services/api';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import { CustomerEmpty, CustomerError, CustomerLoading } from '../../../components/customer/CustomerStates';
import { AddressForm } from '../../../components/ui/form-address';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [addressResponse, branchResponse] = await Promise.all([
                getCustomerAddresses(),
                getPublicBranches()
            ]);
            setAddresses(addressResponse.data);
            setBranches(branchResponse.data.filter((branch) => branch.status === 'active'));
            setError(null);
        } catch (fetchError) {
            console.error('Error loading customer profile:', fetchError);
            setError('We could not load your saved addresses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const saveAddress = async (addressData) => {
        try {
            if (selectedAddress) {
                await updateAddress(selectedAddress.id, addressData);
                setNotice('Address updated');
            } else {
                await addAddress(addressData);
                setNotice('Address added');
            }
            setShowAddressForm(false);
            setSelectedAddress(null);
            await loadData();
            window.setTimeout(() => setNotice(''), 2500);
        } catch (saveError) {
            setError(saveError.response?.data?.message || 'We could not save that address.');
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Delete this saved address?')) return;
        try {
            await deleteAddress(addressId);
            setAddresses((current) => current.filter((address) => address.id !== addressId));
            setNotice('Address removed');
            window.setTimeout(() => setNotice(''), 2500);
        } catch (deleteError) {
            setError(deleteError.response?.data?.message || 'We could not remove that address.');
        }
    };

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader />
            <main className="customer-container pt-[7.5rem]">
                <div className="mb-7 flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] transition hover:border-[var(--customer-coral)]">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <p className="customer-eyebrow">Your details</p>
                        <h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Saved addresses</h1>
                    </div>
                    <button type="button" onClick={() => { setSelectedAddress(null); setShowAddressForm(true); }} className="ml-auto flex items-center gap-2 rounded-full bg-[var(--customer-coral)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]">
                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add address</span>
                    </button>
                </div>

                <div className="customer-surface mb-6 flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--customer-sage-soft)] text-lg font-black text-[var(--customer-sage)]">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                    <div>
                        <p className="text-sm text-[var(--customer-muted)]">Signed in as</p>
                        <p className="font-bold">{user?.username || 'Customer'}</p>
                    </div>
                    <button type="button" onClick={() => navigate('/customer/profile/edit')} className="ml-auto text-sm font-bold text-[var(--customer-coral-dark)] hover:underline">
                        Edit profile
                    </button>
                </div>

                {notice && <div className="mb-5 rounded-2xl border border-[var(--customer-sage)] bg-[var(--customer-sage-soft)] px-4 py-3 text-sm font-semibold text-[var(--customer-sage)]">{notice}</div>}
                {loading ? <CustomerLoading label="Loading your addresses..." /> : error ? <CustomerError message={error} onRetry={loadData} /> : addresses.length === 0 ? (
                    <CustomerEmpty
                        title="No saved addresses"
                        description="Save your delivery spot once and checkout will be much faster."
                        action={<button type="button" onClick={() => setShowAddressForm(true)} className="mt-3 rounded-full bg-[var(--customer-coral)] px-5 py-3 text-sm font-bold text-white">Add your first address</button>}
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map((address) => {
                            const branch = branches.find((item) => item.id === (address.branchId ?? address.branch_id));
                            return (
                                <article key={address.id} className="customer-surface p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--customer-soft)] text-[var(--customer-coral)]"><MapPin className="h-5 w-5" /></span>
                                            <div className="min-w-0">
                                                <h2 className="truncate font-bold">{address.street || address.street_address}</h2>
                                                <p className="mt-1 text-sm text-[var(--customer-muted)]">{address.city}, {address.state} {address.zipCode || address.postal_code}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button type="button" onClick={() => { setSelectedAddress(address); setShowAddressForm(false); }} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--customer-muted)] hover:bg-[var(--customer-soft)] hover:text-[var(--customer-ink)]" aria-label="Edit address"><Pencil className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => handleDelete(address.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--customer-muted)] hover:bg-[var(--customer-danger-soft)] hover:text-[var(--customer-coral-dark)]" aria-label="Delete address"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex items-center gap-2 border-t border-[var(--customer-line)] pt-4 text-xs font-semibold text-[var(--customer-sage)]">
                                        <Store className="h-4 w-4" /> {branch?.name || 'Branch not available'}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {(showAddressForm || selectedAddress) && (
                <AddressForm
                    address={selectedAddress}
                    branches={branches}
                    onSubmit={saveAddress}
                    onClose={() => { setShowAddressForm(false); setSelectedAddress(null); }}
                />
            )}
        </div>
    );
};

export default CustomerProfile;
