import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user, loading } = useAuth();

    // Helper to get auth header
    const getAuthHeader = async () => {
        if (!user) return null;
        const token = await user.getIdToken();
        return { headers: { 'Authorization': `Bearer ${token}` } };
    };

    // 1. INITIAL LOAD
    useEffect(() => {
        if (loading) return;

        if (user) {
            const fetchDbCart = async () => {
                try {
                    const config = await getAuthHeader();
                    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, config);
                    setCartItems(res.data);
                } catch (error) {
                    console.error("Failed to fetch DB cart", error);
                }
            };
            fetchDbCart();
        } else {
            const savedCart = localStorage.getItem('mediDarkCart');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        }
    }, [user, loading]);

    // 2. GUEST SYNC
    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('mediDarkCart', JSON.stringify(cartItems));
        }
    }, [cartItems, user, loading]);

    // 3. ADD TO CART (Now supports Variants)
    const addToCart = async (product, variantDetails = null) => {
        if (user) {
            try {
                const config = await getAuthHeader();
                const payload = {
                    productId: product.id,
                    quantity: 1,
                    variantId: product.selectedVariantId,
                    variantDetails: variantDetails
                };
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, payload, config);
                setCartItems(res.data);
            } catch (error) {
                console.error("Error adding to DB cart", error);
            }
        } else {
            setCartItems((prev) => {
                const existingIndex = prev.findIndex((item) => item.product.id === product.id && item.variantDetails === variantDetails);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex].quantity += 1;
                    return updated;
                }
                return [...prev, { product, quantity: 1, variantDetails }];
            });
        }
    };

    // 4. UPDATE QUANTITY (Now supports Variants)
    const updateQuantity = async (productId, delta, variantDetails = null) => {
        if (user) {
            try {
                const config = await getAuthHeader();
                // Passing variantDetails to help DB distinguish items if needed
                const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/cart/update/${productId}`, { delta, variantDetails }, config);
                setCartItems(res.data);
            } catch (error) {
                console.error("Error updating DB cart", error);
            }
        } else {
            setCartItems((prev) =>
                prev.map((item) => {
                    if (item.product.id === productId && item.variantDetails === variantDetails) {
                        return { ...item, quantity: item.quantity + delta };
                    }
                    return item;
                }).filter(item => item.quantity > 0)
            );
        }
    };

    // 5. REMOVE FROM CART (Now supports Variants)
    const removeFromCart = async (productId, variantDetails = null) => {
        if (user) {
            try {
                const config = await getAuthHeader();
                // Passing variantDetails as query param so DB can drop the exact variant
                const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/remove/${productId}?variantDetails=${encodeURIComponent(variantDetails || '')}`, config);
                setCartItems(res.data);
            } catch (error) {
                console.error("Error removing from DB cart", error);
            }
        } else {
            setCartItems((prev) => prev.filter((item) => !(item.product.id === productId && item.variantDetails === variantDetails)));
        }
    };

    // 6. CLEAR CART
    const clearCart = async () => {
        if (user) {
            try {
                const config = await getAuthHeader();
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/clear`, config);
                setCartItems([]);
            } catch (error) {
                console.error("Error clearing DB cart", error);
            }
        } else {
            setCartItems([]);
            localStorage.removeItem('mediDarkCart');
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};