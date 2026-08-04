import React, { useEffect, useMemo, useState } from 'react';
import { Search, UtensilsCrossed } from 'lucide-react';
import { getPublicBranchMenu } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import MenuItemCard from '../../../components/customer/MenuItemCard';
import CustomerCartBar from '../../../components/customer/CustomerCartBar';
import { CustomerError, CustomerLoading, CustomerNoResults } from '../../../components/customer/CustomerStates';

const CustomerMenu = ({ branchId, branch }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [addedItems, setAddedItems] = useState({});
    const { cart, addToCart, getTotal } = useCart();

    const loadMenu = async () => {
        try {
            setLoading(true);
            const response = await getPublicBranchMenu(branchId);
            const availableItems = response.data
                .filter((item) => item.branch_availability !== false)
                .map((item) => ({
                    ...item,
                    price: Number.parseFloat(item.price) || 0,
                    branch_price: item.branch_price ? Number.parseFloat(item.branch_price) : null
                }));
            setMenuItems(availableItems);
            setError(null);
        } catch (fetchError) {
            console.error('Error fetching menu:', fetchError);
            setError('We could not load this menu right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setActiveCategory('All');
        setSearchQuery('');
        loadMenu();
    }, [branchId]);

    const categories = useMemo(
        () => ['All', ...new Set(menuItems.map((item) => item.category || 'Other'))],
        [menuItems]
    );

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        return menuItems.filter((item) => {
            const matchesCategory = activeCategory === 'All' || (item.category || 'Other') === activeCategory;
            const matchesSearch = !normalizedQuery ||
                `${item.name} ${item.description || ''}`.toLowerCase().includes(normalizedQuery);
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, menuItems, searchQuery]);

    const groupedItems = useMemo(() => filteredItems.reduce((groups, item) => {
        const category = item.category || 'Other';
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
    }, {}), [filteredItems]);

    const handleAddToCart = (item) => {
        addToCart({ ...item, branchId: Number.parseInt(branchId, 10) });
        setAddedItems((current) => ({ ...current, [item.id]: true }));
        window.setTimeout(() => {
            setAddedItems((current) => ({ ...current, [item.id]: false }));
        }, 1000);
    };

    if (loading) return <CustomerLoading label="Setting the table..." />;
    if (error) return <CustomerError message={error} onRetry={loadMenu} />;

    return (
        <section className="pb-10">
            <div className="customer-surface mb-8 p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--customer-sage-soft)] text-[var(--customer-sage)]">
                            <UtensilsCrossed className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="customer-eyebrow">The menu</p>
                            <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">{branch?.name || 'Today’s selection'}</h2>
                        </div>
                    </div>
                    <label className="relative block w-full lg:max-w-xs">
                        <span className="sr-only">Search menu</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--customer-muted)]" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search the menu..."
                            className="customer-focus h-11 w-full rounded-full border border-[var(--customer-line)] bg-[var(--customer-soft)] pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--customer-muted)] focus:border-[var(--customer-coral)]"
                        />
                    </label>
                </div>

                <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Menu categories">
                    {categories.map((category) => (
                        <button
                            type="button"
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                                activeCategory === category
                                    ? 'bg-[var(--customer-coral)] text-white'
                                    : 'bg-[var(--customer-soft)] text-[var(--customer-muted)] hover:bg-[var(--customer-soft-hover)] hover:text-[var(--customer-ink)]'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <CustomerNoResults query={searchQuery} />
            ) : (
                <div className="space-y-10">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <section key={category} aria-labelledby={`category-${category}`}>
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div>
                                    <p className="customer-eyebrow">From the kitchen</p>
                                    <h3 id={`category-${category}`} className="mt-1 text-2xl font-black tracking-[-0.05em]">{category}</h3>
                                </div>
                                <span className="text-sm text-[var(--customer-muted)]">{items.length} {items.length === 1 ? 'dish' : 'dishes'}</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {items.map((item) => (
                                    <MenuItemCard
                                        key={item.id}
                                        item={item}
                                        onAdd={handleAddToCart}
                                        added={addedItems[item.id]}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <CustomerCartBar cart={cart} total={getTotal()} />
        </section>
    );
};

export default CustomerMenu;
