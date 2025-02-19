import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : { items: [], branchId: null };
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item, quantity = 1) => {
        setCart(prevCart => {
            // If trying to add item from a different branch, clear cart first
            if (prevCart.branchId && item.branchId !== prevCart.branchId) {
                return {
                    branchId: item.branchId,
                    items: [{
                        ...item,
                        quantity
                    }]
                };
            }

            const existingItem = prevCart.items.find(i => i.id === item.id);
            
            if (existingItem) {
                return {
                    ...prevCart,
                    items: prevCart.items.map(i =>
                        i.id === item.id
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    )
                };
            }

            return {
                branchId: item.branchId,
                items: [...prevCart.items, { ...item, quantity }]
            };
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => ({
            ...prevCart,
            items: prevCart.items.filter(item => item.id !== itemId)
        }));
    };

    const updateQuantity = (itemId, quantity) => {
        setCart(prevCart => ({
            ...prevCart,
            items: prevCart.items.map(item =>
                item.id === itemId
                    ? { ...item, quantity: Math.max(0, quantity) }
                    : item
            ).filter(item => item.quantity > 0)
        }));
    };

    const clearCart = () => {
        setCart({ items: [], branchId: null });
    };

    const getTotal = () => {
        return cart.items.reduce((total, item) => {
            const price = item.branch_price || item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;