import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Loader2, MapPin, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { getCustomerAddresses, createOrder } from '../../../services/api';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import { CustomerEmpty, CustomerError, CustomerLoading } from '../../../components/customer/CustomerStates';
import { useToast } from '../../../components/ui/use-toast';

const normalizeAddress = (address) => ({
    ...address,
    street: address.street || address.street_address || '',
    city: address.city || '',
    state: address.state || '',
    zipCode: address.zipCode || address.postal_code || '',
    branchId: address.branchId ?? address.branch_id
});

const formatPrice = (price) => {
    const numericPrice = Number.parseFloat(price);
    return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00';
};

const Cart = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        const loadAddresses = async () => {
            try {
                setLoading(true);
                const response = await getCustomerAddresses();
                const branchAddresses = response.data
                    .map(normalizeAddress)
                    .filter((address) => Number(address.branchId) === Number(cart.branchId));
                setAddresses(branchAddresses);
                if (branchAddresses.length === 1) setSelectedAddressId(branchAddresses[0].id);
                setError(null);
            } catch (fetchError) {
                console.error('Error loading addresses:', fetchError);
                setError('We could not load your delivery addresses.');
            } finally {
                setLoading(false);
            }
        };

        if (cart.items.length) loadAddresses();
        else setLoading(false);
    }, [cart.branchId, cart.items.length]);

    const selectedAddress = useMemo(
        () => addresses.find((address) => address.id === selectedAddressId),
        [addresses, selectedAddressId]
    );

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast({
                title: 'Choose a delivery address',
                description: 'Select where you would like your order delivered.',
                variant: 'destructive'
            });
            return;
        }

        try {
            setPlacingOrder(true);
            const response = await createOrder({
                branch_id: cart.branchId,
                items: cart.items.map((item) => ({
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    special_instructions: item.specialInstructions || ''
                })),
                delivery_address: {
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude
                }
            });

            clearCart();
            toast({
                title: 'Order placed',
                description: 'Your kitchen has received the order.',
                variant: 'success'
            });
            navigate(`/customer/orders/${response.data.id}`);
        } catch (orderError) {
            console.error('Error placing order:', orderError);
            toast({
                title: 'Could not place order',
                description: orderError.response?.data?.message || 'Please try again in a moment.',
                variant: 'destructive'
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    if (!cart.items.length) {
        return (
            <div className="customer-page pb-20 md:pb-0">
                <CustomerHeader />
                <main className="customer-container pt-[7.5rem]">
                    <CustomerEmpty
                        title="Your bag is waiting"
                        description="Choose a branch and add something delicious before checking out."
                        action={(
                            <button type="button" onClick={() => navigate('/')} className="mt-3 rounded-full bg-[var(--customer-coral)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]">
                                Browse the menu
                            </button>
                        )}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader />
            <main className="customer-container pt-[7.5rem]">
                <div className="mb-7 flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] transition hover:border-[var(--customer-coral)]">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <p className="customer-eyebrow">Almost there</p>
                        <h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Your bag</h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                    <section className="customer-surface p-4 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-lg font-bold">Your picks</p>
                                <p className="mt-1 text-sm text-[var(--customer-muted)]">
                                    {cart.items.length} {cart.items.length === 1 ? 'dish' : 'dishes'} from this branch
                                </p>
                            </div>
                            <ShoppingBag className="h-5 w-5 text-[var(--customer-coral)]" />
                        </div>

                        <div className="divide-y divide-[var(--customer-line)]">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                                    <img
                                        src={item.image_url || '/food-placeholders/shareable.svg'}
                                        alt=""
                                        className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="font-bold">{item.name}</h2>
                                                <p className="mt-1 text-sm text-[var(--customer-muted)]">
                                                    ${formatPrice(item.branch_price || item.price)} each
                                                </p>
                                            </div>
                                            <p className="font-bold text-[var(--customer-coral-dark)]">
                                                ${formatPrice((item.branch_price || item.price) * item.quantity)}
                                            </p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 rounded-full border border-[var(--customer-line)] p-1">
                                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[var(--customer-soft)]" aria-label={`Decrease ${item.name} quantity`}>
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[var(--customer-soft)]" aria-label={`Increase ${item.name} quantity`}>
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <button type="button" onClick={() => removeFromCart(item.id)} className="flex items-center gap-1 text-xs font-semibold text-[var(--customer-muted)] transition hover:text-[var(--customer-coral-dark)]">
                                                <Trash2 className="h-3.5 w-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="customer-surface p-5 sm:p-6 lg:sticky lg:top-24">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="customer-eyebrow">Delivery details</p>
                                <h2 className="mt-1 text-xl font-bold">Where should we bring it?</h2>
                            </div>
                            <MapPin className="h-5 w-5 text-[var(--customer-coral)]" />
                        </div>

                        {loading ? (
                            <CustomerLoading label="Loading addresses..." />
                        ) : error ? (
                            <div className="mt-5">
                                <CustomerError message={error} onRetry={() => window.location.reload()} />
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="mt-5 rounded-2xl bg-[var(--customer-soft)] p-4">
                                <p className="text-sm leading-6 text-[var(--customer-muted)]">Add an address for this branch before placing your order.</p>
                                <button type="button" onClick={() => navigate('/customer/addresses')} className="mt-4 rounded-full bg-[var(--customer-coral)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]">
                                    Manage addresses
                                </button>
                            </div>
                        ) : (
                            <div className="mt-5 space-y-2">
                                {addresses.map((address) => (
                                    <button
                                        type="button"
                                        key={address.id}
                                        onClick={() => setSelectedAddressId(address.id)}
                                        className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                                            selectedAddressId === address.id
                                                ? 'border-[var(--customer-coral)] bg-[var(--customer-selected)]'
                                                : 'border-[var(--customer-line)] hover:border-[var(--customer-coral)]'
                                        }`}
                                    >
                                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selectedAddressId === address.id ? 'border-[var(--customer-coral)] bg-[var(--customer-coral)] text-white' : 'border-[var(--customer-line)]'}`}>
                                            {selectedAddressId === address.id && <Check className="h-3 w-3" />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-bold">{address.street}</span>
                                            <span className="mt-1 block text-xs leading-5 text-[var(--customer-muted)]">{address.city}, {address.state} {address.zipCode}</span>
                                        </span>
                                    </button>
                                ))}
                                <button type="button" onClick={() => navigate('/customer/addresses')} className="mt-2 w-full rounded-full border border-[var(--customer-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--customer-coral)]">
                                    Manage addresses
                                </button>
                            </div>
                        )}

                        <div className="my-6 border-t border-[var(--customer-line)]" />
                        <div className="flex items-center justify-between text-sm text-[var(--customer-muted)]">
                            <span>Subtotal</span>
                            <span className="font-bold text-[var(--customer-ink)]">${formatPrice(getTotal())}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-[var(--customer-muted)]">
                            <span>Payment</span>
                            <span className="rounded-full bg-[var(--customer-sage-soft)] px-3 py-1 text-xs font-bold text-[var(--customer-sage)]">Cash on delivery</span>
                        </div>
                        <div className="my-5 border-t border-[var(--customer-line)]" />
                        <div className="flex items-end justify-between">
                            <span className="font-bold">Total</span>
                            <span className="text-2xl font-black text-[var(--customer-coral-dark)]">${formatPrice(getTotal())}</span>
                        </div>
                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={!selectedAddress || placingOrder}
                            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--customer-coral)] px-5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {placingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                            {placingOrder ? 'Placing order...' : 'Place order'}
                        </button>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Cart;
