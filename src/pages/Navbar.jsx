

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import LoginModal from "./LoginModal.jsx";
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { cartItems } = useCart();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { user, logout, loading } = useAuth();

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

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
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 md:gap-8">

                    {/* LEFT SIDE: Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
                            <span className="text-sm font-bold text-white">A</span>
                        </div>
                        <span className="text-base font-semibold tracking-tight text-black hidden sm:block">ALTAIR Health</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/shop" className="text-xs font-medium text-zinc-500 transition-colors hover:text-black">Products</Link>
                        <Link to="/rent-cpap" className="text-xs font-medium text-zinc-500 transition-colors hover:text-black">Rent CPAP</Link>
                        <Link to="/about" className="text-xs font-medium text-zinc-500 transition-colors hover:text-black">About</Link>
                        <Link to="/contact" className="text-xs font-medium text-zinc-500 transition-colors hover:text-black">Contact</Link>
                    </nav>

                    {/* RIGHT SIDE: Search & Actions */}
                    <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">

                        {/* Search Bar */}
                        <div className="relative group w-full max-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5 z-10" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                                placeholder="Search inventory..."
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-md py-1.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
                            />

                            {/* Search Dropdown */}
                            {isSearchOpen && (
                                <div className="absolute top-[calc(100%+8px)] right-0 w-[320px] bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(item => (
                                            <Link
                                                to={`/product/${item.id}`}
                                                key={item.id}
                                                onMouseDown={() => {
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center gap-3 p-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors group/item"
                                            >
                                                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1.5 shrink-0 border border-zinc-200 group-hover/item:border-black transition-colors">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full mix-blend-multiply" />
                                                    ) : (
                                                        <span className="text-[8px] font-mono text-zinc-400">N/A</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-zinc-900 font-semibold text-xs line-clamp-1">{item.name}</span>
                                                    <span className="text-black font-bold text-[10px] mt-0.5">₹{item.price.toLocaleString('en-IN')}</span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-zinc-500 text-xs font-medium">No results found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Desktop Icons */}
                        <div className="hidden md:flex items-center gap-1">
                            {loading ? (
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
                                </div>
                            ) : user ? (
                                <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold text-xs hover:bg-zinc-800 transition-colors" title="My Profile">
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'P'}
                                </Link>
                            ) : (
                                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors">
                                    <User className="w-4 h-4" />
                                    <span className="sr-only">Account</span>
                                </button>
                            )}

                            <Link to="/cart" className="relative flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] font-medium text-white">
                                    {totalCartItems}
                                </span>
                                <span className="sr-only">Cart</span>
                            </Link>

                            <Link to="/contact" className="ml-2 bg-black hover:bg-zinc-800 text-white text-xs font-medium px-4 py-1.5 rounded-md transition-colors">
                                Get Quote
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-200 bg-white">
                        <nav className="flex flex-col px-4 pt-2 pb-6 gap-2">
                            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-md">Products</Link>
                            <Link to="/rent-cpap" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-md">Rent CPAP</Link>
                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-md">About</Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-md">Contact</Link>

                            <hr className="my-2 border-zinc-100" />

                            <div className="flex items-center justify-between px-3 py-2">
                                {user ? (
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-black">
                                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                                            {user.email ? user.email.charAt(0).toUpperCase() : 'P'}
                                        </div>
                                        My Account
                                    </Link>
                                ) : (
                                    <button onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-black">
                                        <User className="w-4 h-4" /> Sign In
                                    </button>
                                )}

                                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-black">
                                    <ShoppingCart className="w-4 h-4" /> Cart ({totalCartItems})
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            {/* FLOATING LOGOUT BUTTON */}
            {user && (
                <button
                    onClick={logout}
                    className="fixed bottom-8 left-8 bg-zinc-900 hover:bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all z-50 flex items-center justify-center"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            )}
        </>
    );
}