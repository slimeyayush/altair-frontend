import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from "./Navbar.jsx";
import { User, MapPin, Package, LogOut, Settings, Heart, Clock } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // UI State for Tabs to match the new design
    const [activeTab, setActiveTab] = useState('account');

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
            // Replaced alert with a cleaner UX feel, or you can keep it
            // alert("Address saved successfully!");
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    // Redirect guests to home
    if (!user) return <Navigate to="/" />;

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50/50 text-zinc-900 font-sans selection:bg-black selection:text-white">
            <Navbar />

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-4">

                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-1">
                            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="font-semibold text-black truncate">{user.email || 'Verified User'}</h2>
                                        <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-0.5">Active Account</p>
                                    </div>
                                </div>

                                <nav className="mt-8 space-y-1">
                                    <button
                                        onClick={() => setActiveTab('account')}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'account' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}
                                    >
                                        <User className="h-4 w-4" /> Account Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}
                                    >
                                        <Package className="h-4 w-4" /> Order History
                                    </button>
                                    {/* Placeholder Tabs to match design strictly */}
                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 cursor-not-allowed">
                                        <Heart className="h-4 w-4" /> Wishlist (Soon)
                                    </button>
                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 cursor-not-allowed">
                                        <Settings className="h-4 w-4" /> Settings (Soon)
                                    </button>

                                    <hr className="my-4 border-zinc-100" />

                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" /> Sign Out
                                    </button>
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3">

                            {/* Horizontal Tabs (Mobile/Tablet fallback & Desktop alignment) */}
                            <div className="mb-6 flex items-center gap-2 border-b border-zinc-200 pb-px overflow-x-auto hide-scrollbar">
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'account' ? 'border-black text-black' : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'}`}
                                >
                                    Account
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'}`}
                                >
                                    Orders
                                </button>
                            </div>

                            {/* ACCOUNT TAB */}
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    {/* Account Info Card */}
                                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-black mb-6">Account Information</h3>
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
                                                <p className="mt-1.5 text-sm font-medium text-black bg-zinc-50 p-3 rounded-md border border-zinc-100 cursor-not-allowed">
                                                    {user.email || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Account Status</label>
                                                <div className="mt-1.5 flex items-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active & Verified
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Card */}
                                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-black">Saved Address</h3>
                                            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-widest rounded">Default</span>
                                        </div>
                                        <p className="text-sm text-zinc-500 mb-4">
                                            This address will automatically pre-fill when you proceed to checkout.
                                        </p>

                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                                            <textarea
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="House No, Street, City, State, ZIP"
                                                rows="3"
                                                className="w-full bg-white border border-zinc-200 rounded-md py-3 pl-10 pr-4 text-sm font-medium text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none transition-all"
                                            />
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={handleSaveAddress}
                                                disabled={isSaving}
                                                className="bg-black hover:bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-md text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                                            >
                                                {isSaving ? (
                                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                                                ) : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-zinc-100 p-6 bg-zinc-50/50">
                                        <h3 className="text-lg font-semibold text-black">Order History</h3>
                                        <p className="text-sm text-zinc-500 mt-1">View and track your recent equipment purchases.</p>
                                    </div>

                                    <div className="divide-y divide-zinc-100">
                                        {isLoadingOrders ? (
                                            <div className="flex justify-center py-12">
                                                <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="text-center py-16 px-6">
                                                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-black font-semibold mb-2">No orders found</h3>
                                                <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">You haven't placed any orders yet. Browse our catalog to find premium medical equipment.</p>
                                                <Link to="/shop" className="inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white text-sm font-bold px-6 py-2.5 rounded-md transition-colors shadow-sm">
                                                    Browse Products
                                                </Link>
                                            </div>
                                        ) : (
                                            orders.map((order) => (
                                                <div key={order.id} className="p-6 hover:bg-zinc-50/50 transition-colors">
                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                        <div>
                                                            <p className="font-semibold text-black text-sm">Order #{order.id}</p>
                                                            <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    Processing Date: N/A
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded border ${
                                                                order.status === 'DELIVERED' ? 'bg-black text-white border-black' :
                                                                    order.status === 'SHIPPED' ? 'bg-zinc-100 text-black border-zinc-200' :
                                                                        'bg-white text-zinc-600 border-zinc-200'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                            <p className="font-bold text-black text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>

                                                    {/* Shipping details sub-box */}
                                                    <div className="mt-5 rounded-lg border border-zinc-100 bg-zinc-50 p-4 flex gap-3">
                                                        <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                                        <div className="text-xs text-zinc-600">
                                                            <span className="font-bold text-black block mb-0.5">Shipping Destination</span>
                                                            {order.shippingAddress}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}