import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerCartBar = ({ cart, total }) => {
    const navigate = useNavigate();

    if (!cart.items.length) return null;

    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden">
            <button
                type="button"
                onClick={() => navigate('/cart')}
                className="flex w-full items-center justify-between rounded-2xl bg-[var(--customer-coral)] px-4 py-3 text-left text-white shadow-[0_12px_35px_rgba(32,37,34,0.3)] transition hover:bg-[var(--customer-coral-dark)]"
            >
                <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <ShoppingBag className="h-5 w-5" />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
                        </span>
                        <span className="block text-xs text-white/65">Ready when you are</span>
                    </span>
                </span>
                <span className="flex items-center gap-2 text-sm font-bold">
                    ${Number(total || 0).toFixed(2)}
                    <ArrowRight className="h-4 w-4" />
                </span>
            </button>
        </div>
    );
};

export default CustomerCartBar;
