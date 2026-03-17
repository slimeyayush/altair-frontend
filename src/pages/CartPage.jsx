"use client"

import React, { useState, useEffect } from 'react';
import { Minus, Plus, X, ArrowRight, Lock, MapPin, ShoppingBag, Shield, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from "./Navbar.jsx";
import LoginModal from "./LoginModal.jsx";
import LocationPickerModal from "./LocationPickerModal.jsx";

const benefits = [
    { icon: Truck, text: "Free shipping on orders over ₹5,000" },
    { icon: Shield, text: "5-year warranty on all products" },
    { icon: RotateCcw, text: "30-day return policy" },
];

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { user, loading } = useAuth();

    const [address, setAddress] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const savedAddress = localStorage.getItem(`address_${user.uid}`);
            if (savedAddress) {
                setAddress(savedAddress);
            }
        }
    }, [user]);

    const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 500;
    const tax = subtotal * 0.18; // Example 18% GST calculation
    const total = subtotal + shipping + tax;

    // Map confirm handler
    const handleMapConfirm = (fetchedAddress) => {
        setAddress(fetchedAddress);
        if (user) {
            localStorage.setItem(`address_${user.uid}`, fetchedAddress); // Save for future
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }

        const contactInfo = user.email || user.phoneNumber;

        if (!address.trim()) {
            alert("Please enter a shipping address.");
            return;
        }

        setIsProcessing(true);

        const payload = {
            customerEmail: contactInfo,
            shippingAddress: address,
            items: cartItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                variantId: item.product.selectedVariantId || null
            }))
        };

        try {
            const token = await user.getIdToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders/checkout`, payload, { headers });
            const orderId = response.data.id;

            const phoneNumber = "919899541587";
            let text = `Hello! I have placed an order.\n\n*Order ID:* #${orderId}\n*Contact:* ${contactInfo}\n*Address:* ${address}\n\n`;

            cartItems.forEach(item => {
                const variantText = item.variantDetails ? ` [${item.variantDetails}]` : '';
                text += `- ${item.quantity}x ${item.product.name}${variantText} (₹${item.product.price})\n`;
            });

            text += `\n*Total Paid:* ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

            clearCart();
            window.open(whatsappUrl, '_blank');
            navigate('/');

        } catch (error) {
            console.error("Checkout failed:", error);
            alert(error.response?.data || "An error occurred during checkout.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-sm text-black">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4"></div>
                Loading cart...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <Navbar />

            <main className="flex-1">
                {/* Page Header */}
                <section className="bg-zinc-50/50 py-12 border-b border-zinc-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Shopping Cart</h1>
                        <p className="mt-2 text-lg font-medium text-zinc-500">
                            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
                        </p>
                    </div>
                </section>

                {cartItems.length > 0 ? (
                    <section className="py-12">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid gap-8 lg:grid-cols-3">

                                {/* Cart Items List */}
                                <div className="lg:col-span-2">
                                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                        <div className="divide-y divide-zinc-100">
                                            {cartItems.map((item, index) => (
                                                <div key={`${item.product.id}-${item.variantDetails || index}`} className="flex flex-col sm:flex-row gap-4 p-6 hover:bg-zinc-50/50 transition-colors">

                                                    {/* Image */}
                                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 flex items-center justify-center p-2 mix-blend-multiply">
                                                        {item.product.imageUrl ? (
                                                            <img
                                                                src={item.product.imageUrl}
                                                                alt={item.product.name}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-[10px] font-mono text-zinc-400">no_img</span>
                                                        )}
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex flex-1 flex-col justify-between">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <Link to={`/product/${item.product.id}`} className="font-semibold text-black hover:text-zinc-600 transition-colors line-clamp-2 leading-tight">
                                                                    {item.product.name}
                                                                </Link>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <p className="text-xs font-medium text-zinc-500 font-mono">
                                                                        SKU: ALT-{item.product.id.toString().padStart(5, "0")}
                                                                    </p>
                                                                    {item.variantDetails && (
                                                                        <>
                                                                            <span className="text-zinc-300 text-xs">|</span>
                                                                            <span className="text-[10px] font-bold text-black uppercase tracking-widest bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                                                                                {item.variantDetails}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => removeFromCart(item.product.id, item.variantDetails)}
                                                                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                                                title="Remove Item"
                                                            >
                                                                <X className="h-5 w-5" />
                                                                <span className="sr-only">Remove</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4 sm:mt-0">
                                                            {/* Quantity Control */}
                                                            <div className="flex items-center rounded-md border border-zinc-200 bg-zinc-50/50">
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, -1, item.variantDetails)}
                                                                    className="p-1.5 hover:bg-white hover:text-black text-zinc-500 transition-colors border border-transparent hover:border-zinc-200 rounded-l-md"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </button>
                                                                <span className="w-10 text-center text-sm font-semibold text-black">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, 1, item.variantDetails)}
                                                                    disabled={item.quantity >= item.product.stockQuantity}
                                                                    className="p-1.5 hover:bg-white hover:text-black disabled:opacity-50 disabled:hover:bg-transparent text-zinc-500 transition-colors border border-transparent hover:border-zinc-200 rounded-r-md"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </button>
                                                            </div>

                                                            <p className="text-lg font-bold text-black">
                                                                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <Link to="/shop" className="text-sm font-semibold text-zinc-500 hover:text-black transition-colors order-2 sm:order-1">
                                            &larr; Continue Shopping
                                        </Link>
                                        <button
                                            onClick={clearCart}
                                            className="w-full sm:w-auto bg-white border border-zinc-200 hover:bg-zinc-50 text-black font-semibold px-4 py-2 rounded-md transition-colors text-xs uppercase tracking-widest shadow-sm order-1 sm:order-2"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </div>

                                {/* Order Summary Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sticky top-24">
                                        <h2 className="text-lg font-bold text-black border-b border-zinc-100 pb-4">Order Summary</h2>

                                        {/* Promo Code */}
                                        <div className="mt-6">
                                            <label className="text-xs font-semibold text-zinc-600">Promo Code</label>
                                            <div className="mt-1.5 flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter code"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value)}
                                                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                                />
                                                <button className="bg-zinc-100 border border-zinc-200 text-black font-semibold px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors text-sm shadow-sm">
                                                    Apply
                                                </button>
                                            </div>
                                        </div>

                                        {/* Summary Lines */}
                                        <div className="mt-6 space-y-3 border-t border-zinc-100 pt-6">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-zinc-500">Subtotal</span>
                                                <span className="text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-zinc-500">Estimated Shipping</span>
                                                <span className="text-black">{shipping === 0 ? "Free" : `₹${shipping.toLocaleString('en-IN')}`}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-zinc-500">Estimated Tax (18%)</span>
                                                <span className="text-black">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                            </div>
                                            <hr className="border-zinc-100 my-4" />
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-black text-base">Total</span>
                                                <span className="text-2xl font-black text-black leading-none">
                                                    ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Address Input Area */}
                                        <div className="mt-8 border-t border-zinc-100 pt-6">
                                            {user ? (
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-xs font-semibold text-zinc-600">Shipping Address *</label>
                                                        <button
                                                            onClick={() => setIsMapModalOpen(true)}
                                                            className="text-[10px] font-bold uppercase tracking-widest text-black hover:text-zinc-500 flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded transition-colors"
                                                        >
                                                            <MapPin className="w-3 h-3" /> Use Map
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        required
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        placeholder="House No, Street, City, State, ZIP"
                                                        rows="3"
                                                        className="w-full bg-white border border-zinc-200 text-black rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black transition-all text-sm resize-none"
                                                    />
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                        Ordering as: {user.email || user.phoneNumber}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-center">
                                                    <Lock className="w-4 h-4 text-zinc-400 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Authentication Required</p>
                                                    <p className="text-[11px] text-zinc-500 font-medium mt-1">Please log in to enter your shipping details.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Checkout Button */}
                                        <div className="mt-6">
                                            {!user ? (
                                                <button
                                                    onClick={() => setIsLoginModalOpen(true)}
                                                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-md transition-colors uppercase text-xs tracking-widest shadow-md"
                                                >
                                                    Log In to Checkout
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleCheckout}
                                                    disabled={cartItems.length === 0 || isProcessing}
                                                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-3.5 rounded-md transition-colors uppercase text-xs tracking-widest shadow-md disabled:shadow-none"
                                                >
                                                    {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                                                    {!isProcessing && <ArrowRight className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Benefits */}
                                        <div className="mt-6 space-y-3 pt-6 border-t border-zinc-100">
                                            {benefits.map((benefit) => (
                                                <div key={benefit.text} className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                                                    <benefit.icon className="h-4 w-4 shrink-0 text-black" />
                                                    <span>{benefit.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    /* Empty Cart State */
                    <section className="py-24">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-md text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 mb-6">
                                    <ShoppingBag className="h-10 w-10 text-zinc-400" />
                                </div>
                                <h2 className="text-xl font-bold text-black">Your cart is empty</h2>
                                <p className="mt-2 text-sm font-medium text-zinc-500 mb-8">
                                    Browse our products and find the medical equipment you need.
                                </p>
                                <Link
                                    to="/shop"
                                    className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold px-8 py-3.5 rounded-md transition-colors shadow-lg"
                                >
                                    Browse Products
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Modals */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <LocationPickerModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} onConfirm={handleMapConfirm} />
        </div>
    );
}