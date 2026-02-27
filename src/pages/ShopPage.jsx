import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Eye, Star, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from "./Navbar.jsx"; // Ensure correct path

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cartItems, addToCart, updateQuantity } = useCart();

    // GET and SET search params from URL
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');

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

    // Extract unique categories for the dropdown
    const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Handle dropdown selection
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        if (newCategory === 'all') {
            setSearchParams({}); // Clear query parameter to show all
        } else {
            setSearchParams({ category: newCategory });
        }
    };

    // Filter products if a category is selected in the URL
    const filteredProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products;

    // Group the FILTERED products by category
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

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
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-100 pb-6">
                    <div>
                        {selectedCategory ? (
                            <>
                                <Link to="/shop" className="text-blue-600 text-sm font-bold hover:underline mb-3 inline-block">
                                    &larr; Back to all products
                                </Link>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                                    {selectedCategory}
                                </h1>
                            </>
                        ) : (
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                                All Products
                            </h1>
                        )}
                        <p className="text-sm text-slate-500">
                            Showing {filteredProducts.length} products {selectedCategory ? 'in this category' : 'across our catalog'}
                        </p>
                    </div>

                    {/* NEW: Dynamic Category Selector */}
                    <div className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">Category:</span>
                        <select
                            value={selectedCategory || 'all'}
                            onChange={handleCategoryChange}
                            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-600 max-w-[200px] truncate"
                        >
                            <option value="all">All Products</option>
                            {allCategories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {Object.keys(groupedProducts).length === 0 ? (
                    <div className="text-slate-500 font-mono text-sm py-8 text-center bg-slate-50 rounded-xl">
                        {selectedCategory ? `No products found in ${selectedCategory}.` : 'No products available at the moment.'}
                    </div>
                ) : (
                    Object.entries(groupedProducts).map(([category, items]) => (
                        <div key={category} className="mb-16">

                            {/* Category Header (Only show if viewing All Products) */}
                            {!selectedCategory && (
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{category}</h2>
                                    <div className="h-[1px] bg-slate-100 flex-grow mt-1"></div>
                                    <span className="text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1 rounded-full">{items.length} items</span>
                                </div>
                            )}

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map((product) => {
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
                                            <div className="p-5 flex flex-col flex-grow bg-white">
                                                <div className="flex items-center gap-1 mb-2 text-yellow-400">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                                                    <span className="text-[11px] text-slate-400 font-medium ml-1">({Math.floor(Math.random() * 200) + 42})</span>
                                                </div>

                                                <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                                                    <h3 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2 text-[15px]">{product.name}</h3>
                                                </Link>
                                                <p className="text-xs text-slate-500 mb-4">{product.category}</p>

                                                <div className="mt-auto mb-5 flex items-baseline gap-2">
                                                    <div className="text-xl font-bold text-slate-900">
                                                        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    {product.oldPrice && (
                                                        <span className="text-sm text-slate-400 line-through">₹{product.oldPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {cartItem ? (
                                                        <div className="flex-1 flex items-center justify-between border-2 border-blue-600 rounded-md bg-blue-50 h-10 px-1">
                                                            <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 hover:bg-white text-blue-600 rounded flex items-center justify-center transition-colors shadow-sm">
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-bold text-sm text-blue-600 w-8 text-center">{cartItem.quantity}</span>
                                                            <button onClick={() => updateQuantity(product.id, 1)} disabled={cartItem.quantity >= product.stockQuantity} className="w-8 h-8 hover:bg-white disabled:opacity-50 text-blue-600 rounded flex items-center justify-center transition-colors shadow-sm">
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stockQuantity <= 0}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white flex items-center justify-center gap-2 h-10 rounded-md font-bold text-sm transition-colors shadow-sm shadow-blue-600/20 disabled:shadow-none"
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                            {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="w-10 h-10 flex shrink-0 items-center justify-center bg-slate-50 text-slate-500 rounded-md hover:text-blue-600 hover:bg-slate-100 transition-colors"
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
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}