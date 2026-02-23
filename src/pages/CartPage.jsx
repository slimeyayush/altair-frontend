import React from 'react';
import {useState} from "react";
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

import { useCart } from '../context/CartContext'; // Adjust path if necessary



import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 500 : 0;
    const total = subtotal + shipping;

    const handleCheckout = async () => {
        if (!email) {
            alert("Please enter your email address to proceed.");
            return;
        }

        setIsProcessing(true);

        // 1. Format payload for Spring Boot DTO
        const payload = {
            customerEmail: email,
            items: cartItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }))
        };

        try {
            // 2. Send to Backend
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/orders/checkout`, payload);
            const orderId = response.data.id;

            // 3. Generate WhatsApp Message with official Order ID
            const phoneNumber = "918800537507";
            let text = `Hello! I have placed an order.\n\n*Order ID:* #${orderId}\n*Email:* ${email}\n\n`;

            cartItems.forEach(item => {
                text += `- ${item.quantity}x ${item.product.name} (₹${item.product.price})\n`;
            });

            text += `\n*Total:* ₹${total}`;

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

            // 4. Cleanup and Redirect
            clearCart();
            window.open(whatsappUrl, '_blank');
            navigate('/'); // Send user back to home page

        } catch (error) {
            console.error("Checkout failed:", error);
            // Handle insufficient stock or validation errors from backend
            alert(error.response?.data || "An error occurred during checkout. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-50 font-sans py-12">
            <div className="max-w-7xl mx-auto px-6">
                <Link to="/" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">
                    &larr; Back to Shop
                </Link>
                <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tighter">shopping cart.</h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3 space-y-4">
                        {/* Cart Items Mapping (Same as before) */}
                        {cartItems.length === 0 ? (
                            <div className="text-zinc-500 font-mono text-sm py-8">[ cart is empty ]</div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-zinc-900 relative">
                                    <div className="col-span-1 md:col-span-6 flex items-center gap-6">
                                        <button onClick={() => removeFromCart(item.product.id)} className="absolute top-6 right-0 md:static text-zinc-600 hover:text-red-500 transition">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="w-24 h-24 rounded-xl border border-zinc-900 bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0 p-2">
                                            {item.product.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} className="object-contain w-full h-full" />
                                            ) : (
                                                <span className="text-[10px] font-mono text-zinc-700">no_img</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-white pr-8 md:pr-0 leading-tight">{item.product.name}</span>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 md:text-center text-zinc-400 font-medium">
                                        <span className="md:hidden text-zinc-600 mr-2 text-sm uppercase tracking-widest">Price:</span>
                                        ₹{item.product.price.toLocaleString('en-IN')}
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                                        <div className="flex items-center border border-zinc-700 rounded-full bg-black h-10 px-1">
                                            <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-900 rounded-full transition-colors">
                                                <Minus className="w-3 h-3 text-white" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.id, 1)} disabled={item.quantity >= item.product.stockQuantity} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-900 disabled:opacity-50 rounded-full transition-colors">
                                                <Plus className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 md:text-right font-black text-white text-lg">
                                        <span className="md:hidden text-zinc-600 mr-2 text-sm uppercase tracking-widest font-normal">Subtotal:</span>
                                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:w-1/3">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 sticky top-32">
                            <h2 className="text-xl font-black mb-8 text-white border-b border-zinc-800 pb-4 tracking-tight">order summary.</h2>

                            <div className="space-y-4 mb-8 text-sm font-medium">
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>Shipping</span>
                                    <span className="text-white">₹{shipping.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-800 pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                                    <span className="text-3xl font-black text-white leading-none">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Email Input Required for Backend */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="contact@example.com"
                                    className="w-full bg-black border border-zinc-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white transition-colors text-sm"
                                />
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0 || isProcessing}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-600 text-black font-black py-4 rounded-full transition-colors uppercase text-xs tracking-widest"
                            >
                                {isProcessing ? 'Processing...' : 'Secure Checkout'}
                                {!isProcessing && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}