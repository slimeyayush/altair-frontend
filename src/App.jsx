import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, Minus, Plus, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';

const App = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cartItems, addToCart, updateQuantity } = useCart();

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // 1. Fetch main grid products (Runs once on load)
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    // 2. Debounced search effect for the dropdown
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearchOpen(false);
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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00A152] selection:text-white">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-4 shrink-0">
                        <Menu className="md:hidden text-slate-600 cursor-pointer hover:text-[#0B2C5A]" />
                        <Link to="/" className="flex items-center">
                            {/* Text Logo Instead of Image */}
                            <span className="text-3xl font-black tracking-tighter text-[#0B2C5A]">
                                ALTAIR<span className="text-[#00A152]">.</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-2xl relative group z-50">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                            placeholder="Search premium medical equipment..."
                            className="w-full bg-slate-100 border border-transparent text-slate-900 rounded-full py-3 pl-6 pr-12 focus:outline-none focus:bg-white focus:border-[#0B2C5A] focus:ring-4 focus:ring-[#0B2C5A]/10 transition-all shadow-sm"
                        />
                        <Search className="absolute right-5 top-3.5 text-slate-400 w-5 h-5 group-hover:text-[#0B2C5A] transition-colors" />

                        {/* Search Dropdown */}
                        {isSearchOpen && (
                            <div className="absolute top-full mt-3 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {searchResults.length > 0 ? (
                                    searchResults.map(item => (
                                        <Link
                                            to={`/product/${item.id}`}
                                            key={item.id}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 border border-slate-100 shadow-sm">
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

                    <div className="flex items-center gap-6 shrink-0">
                        <User className="text-slate-600 cursor-pointer hover:text-[#0B2C5A] transition-colors w-6 h-6" />

                        <Link to="/cart" className="relative cursor-pointer group flex items-center">
                            <div className="p-2 bg-slate-100 rounded-full group-hover:bg-[#0B2C5A] group-hover:text-white transition-colors duration-300">
                                <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#00A152] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {totalCartItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex gap-6">
                    <Link to="/" className="text-sm font-bold text-black hover:text-zinc-500 transition-colors">Shop</Link>
                    <Link to="/rent-cpap" className="text-sm font-bold text-black hover:text-zinc-500 transition-colors">Rent CPAP</Link>
                    <Link to="/about" className="text-sm font-bold text-black hover:text-zinc-500 transition-colors">About</Link>
                </nav>
            </header>

            {/* Premium Hero Section with Subtle Color Logic */}
            <section className="relative w-full py-24 md:py-32 flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-br from-[#0B2C5A]/5 via-white to-[#00A152]/5">
                <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">

                    {/* The Logo Image Integrated into the Hero */}


                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-[#0B2C5A]">
                        Advanced care.<br/>Simplified for you.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl font-medium leading-relaxed">
                        Experience the next generation of premium medical equipment, curated for reliability and delivered directly to your home.
                    </p>
                    <button className="flex items-center gap-2 bg-[#0B2C5A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#082042] hover:shadow-lg hover:shadow-[#0B2C5A]/20 hover:-translate-y-0.5 transition-all duration-300">
                        Explore Equipment <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Dynamic Product Listings */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0B2C5A]">Featured Products</h2>
                </div>

                {products.length === 0 ? (
                    <div className="text-slate-400 font-medium text-sm flex items-center justify-center py-24">
                        Loading catalogue...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => {
                            const cartItem = cartItems.find(item => item.product.id === product.id);

                            return (
                                <div key={product.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#00A152]/30 hover:-translate-y-1 rounded-3xl p-6 flex flex-col transition-all duration-300 group relative">

                                    {product.tag && (
                                        <span className="absolute top-6 left-6 z-10 bg-[#00A152] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full pointer-events-none shadow-sm">
                                            {product.tag}
                                        </span>
                                    )}

                                    <Link to={`/product/${product.id}`} className="block w-full aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden p-6 cursor-pointer relative mix-blend-multiply transition-colors group-hover:bg-[#0B2C5A]/5">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <span className="font-mono text-slate-300 text-sm">No Image</span>
                                        )}
                                    </Link>

                                    <Link to={`/product/${product.id}`} className="block cursor-pointer hover:text-[#0B2C5A] transition-colors mb-2">
                                        <h4 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h4>
                                    </Link>

                                    <div className="text-xs font-semibold text-slate-400 mb-4 uppercase">{product.stockQuantity} available</div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl font-black text-[#0B2C5A]">₹{product.price.toLocaleString('en-IN')}</span>
                                        {product.oldPrice && (
                                            <span className="text-sm text-slate-400 line-through font-medium">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>

                                    {/* Cart Controls */}
                                    {cartItem ? (
                                        <div className="flex items-center justify-between border-2 border-[#0B2C5A] rounded-full bg-white mt-auto h-12 overflow-hidden px-1">
                                            <button
                                                onClick={(e) => { e.preventDefault(); updateQuantity(product.id, -1); }}
                                                className="w-10 h-10 hover:bg-slate-100 text-[#0B2C5A] rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg text-[#0B2C5A] w-8 text-center">{cartItem.quantity}</span>
                                            <button
                                                onClick={(e) => { e.preventDefault(); updateQuantity(product.id, 1); }}
                                                disabled={cartItem.quantity >= product.stockQuantity}
                                                className="w-10 h-10 hover:bg-slate-100 disabled:opacity-50 text-[#0B2C5A] rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                            disabled={product.stockQuantity === 0}
                                            className="w-full mt-auto bg-slate-100 hover:bg-[#0B2C5A] hover:text-white disabled:bg-slate-100 disabled:text-slate-400 text-[#0B2C5A] font-bold py-3.5 rounded-full transition-all duration-300 h-12 uppercase text-xs tracking-widest shadow-sm">
                                            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-20 pb-10 mt-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm mb-16">
                    <div className="md:col-span-1">
                        <span className="text-2xl font-black tracking-tighter text-[#0B2C5A] mb-6 block">
                            ALTAIR<span className="text-[#00A152]">.</span>
                        </span>
                        <p className="text-slate-500 mb-6 leading-relaxed">Dedicated to providing premium medical and respiratory therapy equipment directly to your doorstep.</p>
                    </div>

                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Contact</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li>Email: support@altairhealthplus.com</li>
                            <li>Location: Sector 70, Gurgaon</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><a href="#" className="hover:text-[#0B2C5A] transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-[#0B2C5A] transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[#0B2C5A] transition-colors">Return Policy</a></li>
                            <li><a href="#" className="hover:text-[#0B2C5A] transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Warehouses</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li>North: Gurgaon, Lucknow</li>
                            <li>South: Cochin, Bangalore</li>
                            <li>East: Patna, Kolkata</li>
                            <li>West: Pune, Mumbai</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs font-medium">
                    <p>&copy; 2026 Altair Health Plus. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <span>GSTIN: </span>
                        <span></span>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
                aria-label="Contact us on WhatsApp"
            >
                <MessageCircle className="w-6 h-6" />
            </a>
        </div>
    );
};

export default App;