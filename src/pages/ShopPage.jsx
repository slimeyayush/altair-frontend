import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Eye, Star, Heart, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from "./Navbar.jsx";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cartItems, addToCart, updateQuantity } = useCart();

    // Filters State
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');
    const [sortOption, setSortOption] = useState('Relevance');
    const [inStockOnly, setInStockOnly] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`);
                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Extract unique categories for the sidebar
    const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

    const handleCategoryChange = (category) => {
        if (selectedCategory === category) {
            setSearchParams({}); // Deselect if already clicked
        } else {
            setSearchParams({ category: category });
        }
    };

    // 1. FILTER LOGIC
    let processedProducts = products.filter(product => {
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        const matchesStock = inStockOnly ? product.stockQuantity > 0 : true;
        return matchesCategory && matchesStock;
    });

    // 2. SORT LOGIC
    if (sortOption === 'Price: Low to High') {
        processedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
        processedProducts.sort((a, b) => b.price - a.price);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-sm text-slate-500">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                Loading catalogue...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center font-mono text-sm text-red-500">
                [ {error} ]
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500 selection:text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Top Breadcrumb & Controls Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <div className="text-sm text-slate-500 mb-4 md:mb-0">
                        Showing <span className="font-bold text-slate-900">{processedProducts.length}</span> products
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">Sort by:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-600"
                        >
                            <option>Relevance</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT SIDEBAR: Filters (Matches Mockup) */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-900">
                            <Filter className="w-5 h-5 text-blue-600" /> Filters
                        </div>

                        {/* Categories List */}
                        <div className="mb-8">
                            <h3 className="font-bold text-slate-900 mb-4 text-sm">Categories</h3>
                            <div className="space-y-3">
                                {allCategories.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${selectedCategory === cat ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-600'}`}>
                                            {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedCategory === cat}
                                            onChange={() => handleCategoryChange(cat)}
                                        />
                                        <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-blue-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 text-sm">Availability</h3>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${inStockOnly ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${inStockOnly ? 'translate-x-4' : 'translate-x-1'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={inStockOnly}
                                    onChange={() => setInStockOnly(!inStockOnly)}
                                />
                                <span className="text-sm text-slate-600">In Stock Only</span>
                            </label>
                        </div>
                    </aside>

                    {/* RIGHT MAIN CONTENT: Product Grid */}
                    <div className="flex-1">
                        {processedProducts.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-slate-500 font-medium">No products match your current filters.</p>
                                <button onClick={() => { setSearchParams({}); setInStockOnly(false); }} className="mt-4 text-blue-600 font-bold hover:underline text-sm">
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {processedProducts.map((product) => {
                                    const cartItem = cartItems.find(item => item.product.id === product.id);
                                    const isSale = product.tag?.toLowerCase().includes('sale');

                                    return (
                                        <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                                            {/* Image Section */}
                                            <div className="relative aspect-square bg-[#F8F9FB] flex items-center justify-center p-6 overflow-hidden">
                                                {product.tag && (
                                                    <span className={`absolute top-3 left-3 z-10 text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-sm shadow-sm ${isSale ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                        {product.tag}
                                                    </span>
                                                )}

                                                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-red-500 hover:scale-110 transition-all">
                                                    <Heart className="w-4 h-4" />
                                                </button>

                                                <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-auto max-w-full h-auto max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <span className="text-slate-300 font-mono text-xs">No Image</span>
                                                    )}
                                                </Link>
                                            </div>

                                            {/* Details Section */}
                                            <div className="p-5 flex flex-col flex-grow bg-white border-t border-slate-100">
                                                <div className="flex items-center gap-1 mb-2 text-yellow-400">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                    <span className="text-[10px] text-slate-400 font-medium ml-1">({Math.floor(Math.random() * 200) + 42})</span>
                                                </div>

                                                <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                                                    <h3 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2 text-sm">{product.name}</h3>
                                                </Link>
                                                <p className="text-xs text-slate-500 mb-4">{product.category}</p>

                                                <div className="mt-auto mb-5 flex items-baseline gap-2">
                                                    <div className="text-lg font-black text-slate-900">
                                                        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    {product.oldPrice && (
                                                        <span className="text-xs text-slate-400 line-through">₹{product.oldPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {cartItem ? (
                                                        <div className="flex-1 flex items-center justify-between border-2 border-blue-600 rounded-md bg-blue-50 h-9 px-1">
                                                            <button onClick={() => updateQuantity(product.id, -1)} className="w-7 h-7 hover:bg-white text-blue-600 rounded flex items-center justify-center transition-colors shadow-sm">
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="font-bold text-sm text-blue-600 w-8 text-center">{cartItem.quantity}</span>
                                                            <button onClick={() => updateQuantity(product.id, 1)} disabled={cartItem.quantity >= product.stockQuantity} className="w-7 h-7 hover:bg-white disabled:opacity-50 text-blue-600 rounded flex items-center justify-center transition-colors shadow-sm">
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stockQuantity <= 0}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white flex items-center justify-center gap-2 h-9 rounded-md font-bold text-xs transition-colors shadow-sm shadow-blue-600/20 disabled:shadow-none"
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="w-9 h-9 flex shrink-0 items-center justify-center bg-slate-50 text-slate-500 rounded-md hover:text-blue-600 hover:bg-slate-100 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}