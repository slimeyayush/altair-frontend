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

    // Fetch main grid products
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) return; // Exit early. The onChange handler manages the empty state.

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

    // NEW: Extract unique categories AND grab the first available image for each category
    // Extract unique categories AND grab the first available image
    const categoryData = products.reduce((acc, product) => {
        if (product.category) {
            // If category doesn't exist yet, add it (with image or null)
            if (acc[product.category] === undefined) {
                acc[product.category] = product.imageUrl || null;
            }
            // If it exists but has no image, and the current product DOES have an image, update it
            else if (acc[product.category] === null && product.imageUrl) {
                acc[product.category] = product.imageUrl;
            }
        }
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00A152] selection:text-white">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-4 shrink-0">
                        <Menu className="md:hidden text-slate-600 cursor-pointer hover:text-[#0B2C5A]" />
                        <Link to="/" className="flex items-center">
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

                <nav className="hidden md:block border-t border-slate-100 bg-white">
                    <div className="max-w-7xl mx-auto px-6 flex gap-10 text-xs tracking-widest uppercase font-bold py-4 text-slate-500">
                        <Link to="/shop" className="hover:text-[#0B2C5A] transition-colors">Shop</Link>
                        <Link to="/rent-cpap" className="hover:text-[#0B2C5A] transition-colors">Rent CPAP</Link>
                        <Link to="/about" className="hover:text-[#0B2C5A] transition-colors">About</Link>
                    </div>
                </nav>
            </header>

            {/* MODIFIED: Slimmer Hero Section so Categories appear Above the Fold */}
            <section className="relative w-full py-12 md:py-16 flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-br from-[#0B2C5A]/5 via-white to-[#00A152]/5 border-b border-slate-200/50">
                <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-[1.1] tracking-tight text-[#0B2C5A]">
                        Advanced care.<br/>Simplified for you.
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 mb-6 max-w-2xl font-medium leading-relaxed">
                        Experience the next generation of premium medical equipment, curated for reliability and delivered directly to your home.
                    </p>
                    <Link to="/shop" className="flex items-center gap-2 bg-[#0B2C5A] text-white px-6 py-3 rounded-full font-bold hover:bg-[#082042] hover:shadow-lg hover:shadow-[#0B2C5A]/20 hover:-translate-y-0.5 transition-all duration-300 text-sm">
                        Explore Equipment <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* MODIFIED: Shop by Category Section with Dynamic Product Images */}
            {Object.keys(categoryData).length > 0 && (
                <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#0B2C5A] mb-6">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {Object.entries(categoryData).map(([categoryName, imageUrl], idx) => (
                            <Link
                                to="/shop"
                                key={idx}
                                className="group relative h-32 md:h-40 rounded-2xl overflow-hidden bg-white flex items-end p-5 cursor-pointer shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300"
                            >
                                {/* Image Layer */}
                                {imageUrl ? (
                                    <div className="absolute inset-0 p-4">
                                        <img
                                            src={imageUrl}
                                            alt={categoryName}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                                        <span className="text-slate-300 text-xs font-mono">no_img</span>
                                    </div>
                                )}

                                {/* Gradient Overlay for Text Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                                {/* Category Text */}
                                <span className="relative z-10 text-white font-bold text-base md:text-lg tracking-tight leading-tight group-hover:-translate-y-1 transition-transform duration-300">
                                    {categoryName}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Dynamic Product Listings */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-[#0B2C5A]">Featured Products</h2>
                    <Link to="/shop" className="text-sm font-bold text-[#0B2C5A] hover:text-[#00A152] transition-colors hidden md:block">View All</Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-slate-400 font-medium text-sm flex items-center justify-center py-24">
                        Loading catalogue...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.slice(0, 8).map((product) => {
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

                                    <Link to={`/product/${product.id}`} className="block cursor-pointer hover:text-[#0B2C5A] transition-colors mb-1">
                                        <h4 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h4>
                                    </Link>

                                    <div className="text-xs text-slate-500 mb-4">{product.category}</div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-xl font-black text-[#0B2C5A]">₹{product.price.toLocaleString('en-IN')}</span>
                                        {product.oldPrice && (
                                            <span className="text-sm text-slate-400 line-through font-medium">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>

                                    {/* Cart Controls */}
                                    {cartItem ? (
                                        <div className="flex items-center justify-between border border-[#0B2C5A] rounded-xl bg-slate-50 mt-auto h-12 overflow-hidden px-1">
                                            <button
                                                onClick={(e) => { e.preventDefault(); updateQuantity(product.id, -1); }}
                                                className="w-10 h-10 hover:bg-white text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg text-[#0B2C5A] w-8 text-center">{cartItem.quantity}</span>
                                            <button
                                                onClick={(e) => { e.preventDefault(); updateQuantity(product.id, 1); }}
                                                disabled={cartItem.quantity >= product.stockQuantity}
                                                className="w-10 h-10 hover:bg-white disabled:opacity-50 text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                            disabled={product.stockQuantity === 0}
                                            className="w-full mt-auto bg-slate-50 border border-slate-200 hover:bg-[#0B2C5A] hover:border-[#0B2C5A] hover:text-white disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 text-[#0B2C5A] font-bold py-3 rounded-xl transition-all duration-300 h-12 text-sm shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Promotional Banner */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-gradient-to-r from-[#0B2C5A] to-[#124285] rounded-3xl p-12 md:p-20 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00A152]/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <h2 className="relative z-10 text-3xl md:text-5xl font-black tracking-tight mb-4">Healthcare Essentials</h2>
                    <p className="relative z-10 text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">Quality Supplies for Professional Facilities and Home Care</p>
                    <Link to="/shop" className="relative z-10 inline-block bg-white text-[#0B2C5A] font-bold px-8 py-4 rounded-full hover:bg-slate-50 hover:shadow-lg transition-all duration-300">
                        View Essentials
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-20 pb-10 mt-8">
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