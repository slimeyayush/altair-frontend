import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from "./Navbar.jsx"; // Adjust path if needed

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cartItems, addToCart, updateQuantity } = useCart();

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

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-slate-500">
                [ loading_catalog ]
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-red-500">
                [ {error} ]
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12">
          <Navbar />
            <div className="max-w-7xl mx-auto px-6">

                {/* Altair Minimalist Header */}
                <h1 className="text-4xl md:text-5xl font-black mb-16 tracking-tighter lowercase border-b border-slate-200 pb-8 text-[#0B2C5A]">
                    our shop.
                </h1>

                {Object.keys(groupedProducts).length === 0 ? (
                    <div className="text-slate-500 font-mono text-sm py-8">[ no products available ]</div>
                ) : (
                    Object.entries(groupedProducts).map(([category, items]) => (
                        <div key={category} className="mb-20">

                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-black tracking-tighter lowercase text-[#0B2C5A]">{category}.</h2>
                                <div className="h-[1px] bg-slate-200 flex-grow mt-2"></div>
                                <span className="text-slate-400 font-mono text-xs mt-2">{items.length} items</span>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {items.map((product) => {
                                    const cartItem = cartItems.find(item => item.product.id === product.id);

                                    return (
                                        <div key={product.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col group hover:shadow-xl hover:border-slate-200 transition-all duration-300">

                                            {/* Image Section - Clickable */}
                                            <Link to={`/product/${product.id}`} className="relative aspect-square bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
                                                {product.tag && (
                                                    <span className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                        {product.tag}
                                                    </span>
                                                )}

                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-auto max-w-full h-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300 font-mono text-[10px]">[ no_image ]</span>
                                                )}
                                            </Link>

                                            {/* Details Section */}
                                            <div className="p-5 flex flex-col flex-grow">

                                                {/* Visual Star Rating Layout */}
                                                <div className="flex items-center gap-1 mb-2 text-yellow-400">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                    <span className="text-[10px] text-slate-400 font-medium ml-1">({Math.floor(Math.random() * 200) + 12})</span>
                                                </div>

                                                {/* Title & Category */}
                                                <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                                                    <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2 text-sm">{product.name}</h3>
                                                </Link>
                                                <p className="text-xs text-slate-500 mb-4">{product.category}</p>

                                                {/* Price */}
                                                <div className="mt-auto mb-4 flex items-baseline gap-2">
                                                    <div className="text-lg font-black text-slate-900">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </div>
                                                    {product.oldPrice && (
                                                        <span className="text-xs text-slate-400 line-through">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                                                    )}
                                                </div>

                                                {/* Buttons Row */}
                                                <div className="flex items-center gap-2">

                                                    {/* Cart Controls or Add Button */}
                                                    {cartItem ? (
                                                        <div className="flex-1 flex items-center justify-between border border-blue-600 rounded-lg bg-blue-50 h-10 px-1">
                                                            <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 hover:bg-white text-blue-700 rounded flex items-center justify-center transition-colors shadow-sm">
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-bold text-sm text-blue-700 w-8 text-center">{cartItem.quantity}</span>
                                                            <button onClick={() => updateQuantity(product.id, 1)} disabled={cartItem.quantity >= product.stockQuantity} className="w-8 h-8 hover:bg-white disabled:opacity-50 text-blue-700 rounded flex items-center justify-center transition-colors shadow-sm">
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stockQuantity <= 0}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white flex items-center justify-center gap-2 h-10 rounded-lg font-bold text-xs transition-colors shadow-sm"
                                                        >
                                                            <ShoppingCart className="w-4 h-4" />
                                                            {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                        </button>
                                                    )}

                                                    {/* View Item Button */}
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="w-10 h-10 flex shrink-0 items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
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