import React, { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { getFoodPlaceholder } from './foodPlaceholders';

const formatPrice = (price) => {
    const numericPrice = Number.parseFloat(price);
    return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00';
};

const MenuItemCard = ({ item, onAdd, added }) => {
    const fallbackImage = getFoodPlaceholder(item.category);
    const [imageSource, setImageSource] = useState(item.image_url || fallbackImage);

    useEffect(() => {
        setImageSource(item.image_url || fallbackImage);
    }, [item.image_url, fallbackImage]);

    return (
        <article className="group overflow-hidden rounded-[1.25rem] border border-[var(--customer-line)] bg-[var(--customer-surface)] shadow-[0_10px_30px_rgba(52,42,32,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(52,42,32,0.1)]">
            <div className="customer-image-shine h-48 overflow-hidden bg-[var(--customer-soft)] sm:h-56">
                <img
                    src={imageSource}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={() => setImageSource(fallbackImage)}
                />
                <span className="absolute left-3 top-3 rounded-full bg-[var(--customer-surface)]/90 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--customer-muted)]">
                    {item.category || 'House favorite'}
                </span>
            </div>

            <div className="flex min-h-[10.5rem] flex-col p-4 sm:p-5">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">{item.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--customer-muted)]">
                        {item.description || 'A delicious choice made fresh for your table.'}
                    </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-lg font-bold text-[var(--customer-coral-dark)]">
                        ${formatPrice(item.branch_price || item.price)}
                    </span>
                    <button
                        type="button"
                        onClick={() => onAdd(item)}
                        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                            added
                                ? 'bg-[var(--customer-sage-soft)] text-[var(--customer-sage)]'
                                : 'bg-[var(--customer-coral)] text-white hover:bg-[var(--customer-coral-dark)]'
                        }`}
                        aria-label={`Add ${item.name} to cart`}
                    >
                        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {added ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default MenuItemCard;
