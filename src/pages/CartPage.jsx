import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ArrowRight, Lock, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from "./Navbar.jsx";
import LoginModal from "./LoginModal.jsx";
import LocationPickerModal from "./LocationPickerModal.jsx"; // NEW IMPORT

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { user, loading } = useAuth();

    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false); // NEW STATE
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
    const shipping = subtotal > 0 ? 500 : 0;
    const total = subtotal + shipping;

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

            text += `\n*Total:* ₹${total}`;

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

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">loading_cart...</div>;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00A152] selection:text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Link to="/" className="text-slate-500 hover:text-[#0B2C5A] text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">
                    &larr; Back to Shop
                </Link>

                <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tighter text-[#0B2C5A]">
                    shopping cart.
                </h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="text-slate-500 font-mono text-sm py-8">[ cart is empty ]</div>
                        ) : (
                            cartItems.map((item, index) => (
                                <div key={`${item.product.id}-${item.variantDetails || index}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-slate-100 relative group">
                                    <div className="col-span-1 md:col-span-6 flex items-center gap-6">
                                        <button onClick={() => removeFromCart(item.product.id, item.variantDetails)} className="absolute top-6 right-0 md:static text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="w-24 h-24 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 p-3 mix-blend-multiply">
                                            {item.product.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} className="object-contain w-full h-full" />
                                            ) : (
                                                <span className="text-[10px] font-mono text-slate-400">no_img</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 leading-tight">{item.product.name}</span>
                                            {item.variantDetails && (
                                                <span className="text-[11px] font-bold text-[#00A152] mt-1 uppercase tracking-wide">
                                                    {item.variantDetails}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 md:text-center text-slate-500 font-medium text-sm">
                                        ₹{item.product.price.toLocaleString('en-IN')}
                                    </div>

                                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                                        <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 h-10 px-1">
                                            <button onClick={() => updateQuantity(item.product.id, -1, item.variantDetails)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors text-slate-600 shadow-sm">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product.id, 1, item.variantDetails)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors text-slate-600 shadow-sm">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 md:text-right font-black text-[#0B2C5A] text-lg">
                                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:w-1/3">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 sticky top-32 shadow-sm">
                            <h2 className="text-xl font-black mb-8 text-[#0B2C5A] border-b border-slate-200 pb-4 tracking-tight lowercase">order summary.</h2>

                            <div className="space-y-4 mb-8 text-sm font-medium">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Shipping Estimate</span>
                                    <span className="text-slate-900 font-bold">₹{shipping.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                    <span className="text-3xl font-black text-[#00A152] leading-none">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Only show address input if user is logged in */}
                            {user ? (
                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Shipping Address *</label>
                                        <button
                                            onClick={() => setIsMapModalOpen(true)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-[#0B2C5A] hover:text-[#00A152] flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm transition-colors"
                                        >
                                            <MapPin className="w-3 h-3" /> Select on Map
                                        </button>
                                    </div>

                                    <textarea
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="House No, Street, City, State, ZIP"
                                        rows="4"
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B2C5A] focus:ring-4 focus:ring-[#0B2C5A]/5 transition-all text-sm resize-none"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                                        Ordering as: {user.email || user.phoneNumber}
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl text-center">
                                    <Lock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Authentication Required</p>
                                    <p className="text-xs text-slate-400 mt-1">Please log in to enter your shipping details and complete your order.</p>
                                </div>
                            )}

                            {/* Dynamic Checkout Button */}
                            {!user ? (
                                <button
                                    onClick={() => setIsLoginModalOpen(true)}
                                    className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-full transition-colors uppercase text-xs tracking-widest shadow-lg"
                                >
                                    Log In to Checkout
                                </button>
                            ) : (
                                <button
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0 || isProcessing}
                                    className="w-full flex items-center justify-center gap-3 bg-[#0B2C5A] hover:bg-[#082042] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-full transition-colors uppercase text-xs tracking-widest shadow-lg shadow-[#0B2C5A]/20 disabled:shadow-none"
                                >
                                    {isProcessing ? 'Processing...' : 'Secure Checkout'}
                                    {!isProcessing && <ArrowRight className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <LocationPickerModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} onConfirm={handleMapConfirm} />
        </div>
    );
}