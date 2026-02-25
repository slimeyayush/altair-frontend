import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Adjust path based on where Navbar.jsx is located

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cartItems } = useCart();

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Debounced search effect
    useEffect(() => {
        // If empty, just do nothing. The onChange handler takes care of clearing it.
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
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6 md:gap-8">

                {/* LEFT SIDE: Logo & Navigation */}
                <div className="flex items-center gap-10 lg:gap-14">
                    {/* Mobile Menu Icon */}
                    <Menu className="md:hidden text-slate-600 cursor-pointer hover:text-[#0B2C5A]" />

                    {/* Logo */}
                    <Link to="/" className="flex items-center shrink-0">
                        <span className="text-2xl font-black tracking-tighter text-[#0B2C5A]">
                            ALTAIR<span className="text-[#00A152]">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
                        <Link to="/shop" className="hover:text-[#0B2C5A] transition-colors">Shop</Link>
                        <Link to="/rent-cpap" className="hover:text-[#0B2C5A] transition-colors">Rent CPAP</Link>
                        <Link to="/about" className="hover:text-[#0B2C5A] transition-colors">About</Link>
                        <Link to="/contact" className="hover:text-[#0B2C5A] transition-colors">Contact</Link>
                    </nav>
                </div>

                {/* RIGHT SIDE: Search & Icons */}
                <div className="flex items-center gap-6 lg:gap-8 flex-1 justify-end">

                    {/* Search Bar (Matches Screenshot Style) */}
                    <div className="hidden md:block relative group w-full max-w-[320px] z-50">
                        {/* Search Icon moved to the left */}
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-hover:text-[#0B2C5A] peer-focus:text-[#0B2C5A] transition-colors z-10" />

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                // Clear results immediately when user deletes the text
                                if (!val.trim()) {
                                    setSearchResults([]);
                                    setIsSearchOpen(false);
                                }
                            }}
                            onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                            placeholder="Search equipment, brands..."
                            className="w-full peer bg-slate-50 border border-slate-200 text-slate-900 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-[#0B2C5A] focus:ring-4 focus:ring-[#0B2C5A]/5 transition-all"
                        />

                        {/* Search Dropdown */}
                        {isSearchOpen && (
                            <div className="absolute top-[calc(100%+8px)] right-0 w-[400px] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <Link
                                            to={`/product/${item.id}`}
                                            key={item.id}
                                            onMouseDown={() => {
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shrink-0 border border-slate-100 shadow-sm">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full" />
                                                ) : (
                                                    <span className="text-[8px] font-mono text-slate-400">no_img</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <span className="text-slate-900 font-bold text-sm line-clamp-1">{item.name}</span>
                                                <span className="text-[#00A152] font-semibold text-xs mt-1">₹{item.price.toLocaleString('en-IN')}</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-sm font-medium">
                                        No products found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-5 shrink-0">
                        <Link to="/admin/login" className="text-slate-600 hover:text-[#0B2C5A] transition-colors p-1">
                            <User className="w-5 h-5" />
                        </Link>

                        <Link to="/cart" className="relative cursor-pointer group flex items-center p-1">
                            <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-[#0B2C5A] transition-colors" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#00A152] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {totalCartItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}