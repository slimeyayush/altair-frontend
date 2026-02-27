import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/CartContext'; // Adjust path if needed. Assuming you export useAuth from AuthContext.
import Navbar from "./Navbar.jsx";
import { User, MapPin, Package, LogOut, ExternalLink } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (user) {
            // Load saved address from local storage tied to this specific user
            const saved = localStorage.getItem(`address_${user.uid}`);
            if (saved) setAddress(saved);

            fetchMyOrders();
        }
    }, [user]);

    const fetchMyOrders = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleSaveAddress = () => {
        setIsSaving(true);
        localStorage.setItem(`address_${user.uid}`, address);
        setTimeout(() => {
            setIsSaving(false);
            alert("Address saved successfully!");
        }, 500);
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

    // Redirect guests to home
    if (!user) return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white pb-20">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Profile & Settings */}
                    <div className="md:col-span-1 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl">
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 truncate max-w-[150px]">{user.email || 'Phone User'}</h2>
                                    <span className="text-xs text-green-500 font-bold bg-green-50 px-2 py-1 rounded-md">Verified</span>
                                </div>
                            </div>

                            <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 py-2.5 rounded-lg transition-colors">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                                <MapPin className="w-5 h-5 text-blue-600" /> Default Shipping Address
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                This address will automatically pre-fill when you go to checkout.
                            </p>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="House No, Street, City, State, ZIP"
                                rows="4"
                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 resize-none mb-4"
                            />
                            <button
                                onClick={handleSaveAddress}
                                disabled={isSaving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md text-sm transition-colors shadow-sm disabled:opacity-70"
                            >
                                {isSaving ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Order History */}
                    <div className="md:col-span-2">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[500px]">
                            <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                                <Package className="w-5 h-5 text-blue-600" /> Order History
                            </div>

                            {isLoadingOrders ? (
                                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold mb-2">No orders yet</h3>
                                    <p className="text-slate-500 text-sm mb-6">Looks like you haven't placed an order yet.</p>
                                    <Link to="/shop" className="text-blue-600 font-bold text-sm hover:underline">Start Shopping &rarr;</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="border border-slate-100 rounded-lg p-5 hover:border-slate-200 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <span className="text-xs text-slate-400 font-mono block mb-1">Order #{order.id}</span>
                                                    <span className="font-bold text-slate-900 text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                                </div>
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-widest inline-block text-center ${
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md">
                                                <span className="font-bold text-slate-700 block mb-1">Shipped to:</span>
                                                {order.shippingAddress}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}