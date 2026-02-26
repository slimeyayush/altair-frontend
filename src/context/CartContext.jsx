import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Ensure this path is correct

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

    // 1. INITIAL LOAD: Fetch DB cart if logged in, else Local Storage
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

    // 2. GUEST SYNC: Save to local storage only if NOT logged in
    useEffect(() => {
        if (!user && !loading) {
            localStorage.setItem('mediDarkCart', JSON.stringify(cartItems));
        }
    }, [cartItems, user, loading]);

    // 3. ADD TO CART
    const addToCart = async (product) => {
        if (user) {
            try {
                const config = await getAuthHeader();
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, { productId: product.id, quantity: 1 }, config);
                setCartItems(res.data); // Server dictates the new state
            } catch (error) {
                console.error("Error adding to DB cart", error);
            }
        } else {
            setCartItems((prev) => {
                const existing = prev.find((item) => item.product.id === product.id);
                if (existing) {
                    return prev.map((item) =>
                        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                }
                return [...prev, { product, quantity: 1 }];
            });
        }
    };

    // 4. UPDATE QUANTITY
    const updateQuantity = async (productId, delta) => {
        if (user) {
            try {
                const config = await getAuthHeader();
                const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/cart/update/${productId}`, { delta }, config);
                setCartItems(res.data);
            } catch (error) {
                console.error("Error updating DB cart", error);
            }
        } else {
            setCartItems((prev) =>
                prev.map((item) => {
                    if (item.product.id === productId) {
                        return { ...item, quantity: item.quantity + delta };
                    }
                    return item;
                }).filter(item => item.quantity > 0)
            );
        }
    };

    // 5. REMOVE FROM CART
    const removeFromCart = async (productId) => {
        if (user) {
            try {
                const config = await getAuthHeader();
                const res = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/remove/${productId}`, config);
                setCartItems(res.data);
            } catch (error) {
                console.error("Error removing from DB cart", error);
            }
        } else {
            setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
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