import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import LoginModal from "./LoginModal.jsx";
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cartItems } = useCart();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { user, logout, loading } = useAuth();

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) return;

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/search?q=${searchQuery}`);
                setSearchResults(response.data);
                setIsSearchOpen(true);
            } catch (error) {
                console.error("Search error:", error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <>
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">

                    {/* LEFT SIDE: Logo & Navigation */}
                    <div className="flex items-center gap-10">
                        {/* Mobile Menu Icon */}
                        <Menu className="md:hidden text-slate-600 cursor-pointer hover:text-[#0B2C5A] transition-colors" />

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 shrink-0 group">
                            <div className="w-7 h-7 bg-[#00A152] rounded-md flex items-center justify-center group-hover:bg-[#0B2C5A] transition-colors shadow-sm text-white font-black text-xs">
                                A
                            </div>
                            <span className="text-xl font-black tracking-tighter text-[#0B2C5A]">
                                ALTAIR<span className="text-[#00A152]">.</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
                            <Link to="/shop" className="hover:text-[#0B2C5A] transition-colors">Shop</Link>
                            <Link to="/rent-cpap" className="hover:text-[#0B2C5A] transition-colors">Rent CPAP</Link>
                            <Link to="/about" className="hover:text-[#0B2C5A] transition-colors">About</Link>
                            <Link to="/contact" className="hover:text-[#0B2C5A] transition-colors">Contact</Link>
                        </nav>
                    </div>

                    {/* RIGHT SIDE: Search & Icons */}
                    <div className="flex items-center gap-6 flex-1 justify-end">

                        {/* Search Bar */}
                        <div className="hidden md:block relative group w-full max-w-[320px] z-50">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-hover:text-[#0B2C5A] peer-focus:text-[#0B2C5A] transition-colors z-10" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    if (!val.trim()) {
                                        setSearchResults([]);
                                        setIsSearchOpen(false);
                                    }
                                }}
                                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                                placeholder="Search equipment, brands..."
                                className="w-full peer bg-slate-50 border border-slate-200 text-slate-900 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-[#0B2C5A] focus:ring-4 focus:ring-[#0B2C5A]/10 transition-all"
                            />

                            {/* Search Dropdown */}
                            {isSearchOpen && (
                                <div className="absolute top-[calc(100%+12px)] right-0 w-[400px] bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(item => (
                                            <Link
                                                to={`/product/${item.id}`}
                                                key={item.id}
                                                onMouseDown={() => {
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group/item"
                                            >
                                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shrink-0 border border-slate-100 group-hover/item:border-[#0B2C5A]/20 transition-colors">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full mix-blend-multiply" />
                                                    ) : (
                                                        <span className="text-[8px] font-mono text-slate-400">no_img</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-slate-900 font-bold text-sm line-clamp-1 group-hover/item:text-[#0B2C5A] transition-colors">{item.name}</span>
                                                    <span className="text-[#00A152] font-black text-xs mt-1">₹{item.price.toLocaleString('en-IN')}</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-sm font-medium">No products found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Icons Section */}
                        <div className="flex items-center gap-5 shrink-0">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-slate-200 border-t-[#0B2C5A] rounded-full animate-spin" />
                            ) : user ? (
                                <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0B2C5A] text-white font-bold text-sm shadow-sm hover:bg-[#082042] transition-colors" title="My Profile">
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'P'}
                                </Link>
                            ) : (
                                <button onClick={() => setIsLoginModalOpen(true)} className="text-slate-500 hover:text-[#0B2C5A] transition-colors p-1" title="Login">
                                    <User className="w-5 h-5" />
                                </button>
                            )}

                            {/* Cart Icon */}
                            <Link to="/cart" className="relative cursor-pointer group flex items-center p-1">
                                <ShoppingCart className="w-5 h-5 text-slate-500 group-hover:text-[#0B2C5A] transition-colors" />
                                {totalCartItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#00A152] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {totalCartItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </header> {/* <-- MODAL WAS HERE, I MOVED IT BELOW THIS LINE */}

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            {/* FLOATING LOGOUT BUTTON */}
            {user && (
                <button
                    onClick={logout}
                    className="fixed bottom-8 left-8 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            )}
        </>
    );
}