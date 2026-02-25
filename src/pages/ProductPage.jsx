import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Navbar from "./Navbar.jsx";

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems, addToCart, updateQuantity } = useCart();

    // State for description "Read More"
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_DESC_LENGTH = 150; // Characters to show before truncating

    // 1. Fetch main product
    useEffect(() => {
        let isMounted = true;

        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`)
            .then(response => {
                if (isMounted) {
                    setProduct(response.data);
                    setLoading(false);
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error("Error fetching product:", error);
                    setLoading(false);
                }
            });

        // Cleanup: Reset states securely when navigating between different products
        return () => {
            isMounted = false;
            setLoading(true);
            setProduct(null);
            setRelatedProducts([]);
        };
    }, [id]);

    // 2. Fetch related products once the main product is known
    useEffect(() => {
        let isMounted = true;

        if (product && product.category) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/category/${product.category}`)
                .then(response => {
                    if (isMounted) {
                        const filtered = response.data.filter(p => p.id !== product.id);
                        setRelatedProducts(filtered);
                    }
                })
                .catch(error => console.error("Error fetching related products:", error));
        }

        return () => {
            isMounted = false;
        };
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-sm text-slate-500">
                [ loading product data ]
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-black text-[#0B2C5A] mb-4">Product Not Found</h1>
                <button onClick={() => navigate('/shop')} className="text-[#00A152] hover:underline font-bold">Return to Shop</button>
            </div>
        );
    }

    const cartItem = cartItems.find(item => item.product.id === product.id);
    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Description Truncation Logic
    const needsTruncation = product.description && product.description.length > MAX_DESC_LENGTH;
    const displayDescription = needsTruncation && !isExpanded
        ? `${product.description.substring(0, MAX_DESC_LENGTH)}...`
        : product.description;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00A152] selection:text-white pb-20">
            <Navbar />
            {/* Simple Clean Header to maintain context */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-black tracking-tighter text-[#0B2C5A]">
                            ALTAIR<span className="text-[#00A152]">.</span>
                        </span>
                    </Link>
                    <Link to="/cart" className="relative cursor-pointer group flex items-center">
                        <div className="p-2 bg-slate-100 rounded-full group-hover:bg-[#0B2C5A] transition-colors duration-300">
                            <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        {totalCartItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#00A152] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                {totalCartItems}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 pt-8">

                {/* Top Breadcrumb Navigation */}
                <div className="flex items-center mb-8">
                    <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-[#0B2C5A] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Shop
                    </Link>
                    <span className="mx-3 text-slate-300">/</span>
                    <span className="text-sm font-medium text-slate-400 capitalize">{product.category || 'Equipment'}</span>
                </div>

                {/* Main Product Layout (Matches Screenshot Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

                    {/* Left: Product Image */}
                    <div className="bg-white rounded-3xl p-8 lg:p-16 aspect-square flex items-center justify-center border border-slate-200 shadow-sm sticky top-24">
                        {product.tag && (
                            <span className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                                {product.tag}
                            </span>
                        )}
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="object-contain w-full h-full mix-blend-multiply" />
                        ) : (
                            <span className="font-mono text-slate-300 text-sm">no_image_data</span>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col pt-4">

                        <h1 className="text-3xl md:text-5xl font-black mb-4 text-[#0B2C5A] leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        {/* Static Reviews UI to match screenshot */}
                        <div className="flex items-center gap-2 mb-6 text-yellow-400">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-sm text-slate-500 font-medium ml-2">(124 Customer Reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-black text-[#0B2C5A] tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.oldPrice && (
                                <span className="text-lg text-slate-400 line-through font-medium mb-1">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        {/* Expandable Description */}
                        <div className="mb-8">
                            <p className="text-slate-600 leading-relaxed text-base">
                                {displayDescription || "No detailed description provided for this product."}
                            </p>
                            {needsTruncation && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-[#0B2C5A] font-bold text-sm hover:underline mt-2 focus:outline-none"
                                >
                                    {isExpanded ? "Read Less" : "Read More"}
                                </button>
                            )}
                        </div>

                        {/* Bullet Points to match screenshot vibe */}
                        <ul className="space-y-3 mb-10 border-t border-slate-100 pt-8">
                            <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <ShieldCheck className="w-5 h-5 text-[#00A152]" /> Premium medical-grade quality
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <Truck className="w-5 h-5 text-[#00A152]" /> Fast, secure shipping available
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <RotateCcw className="w-5 h-5 text-[#00A152]" /> 30-day hassle-free returns
                            </li>
                        </ul>

                        {/* Action Area (Cart) */}
                        <div className="mt-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Availability</span>
                                <span className={`text-sm font-bold ${product.stockQuantity > 0 ? 'text-[#00A152]' : 'text-red-500'}`}>
                                    {product.stockQuantity > 0 ? `${product.stockQuantity} In Stock` : 'Out of Stock'}
                                </span>
                            </div>

                            {cartItem ? (
                                <div className="flex gap-4">
                                    <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 h-14 px-2 w-32 shrink-0">
                                        <button onClick={() => updateQuantity(product.id, -1)} className="w-10 h-10 hover:bg-white text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="font-bold text-lg text-[#0B2C5A]">{cartItem.quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, 1)} disabled={cartItem.quantity >= product.stockQuantity} className="w-10 h-10 hover:bg-white disabled:opacity-50 text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button onClick={() => navigate('/cart')} className="flex-1 bg-[#00A152] hover:bg-[#008a46] text-white font-bold rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center">
                                        View Cart
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stockQuantity === 0}
                                    className="w-full bg-[#0B2C5A] hover:bg-[#082042] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold h-14 rounded-xl transition-all duration-300 text-sm shadow-sm flex items-center justify-center gap-3">
                                    <ShoppingCart className="w-5 h-5" />
                                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products Section (Matches the new App.jsx card styles) */}
                {/* Related Products Section (Grid format) */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-slate-200 pt-16 pb-12">
                        <h2 className="text-2xl font-black mb-8 tracking-tight text-[#0B2C5A]">You May Also Like</h2>

                        {/* Standard 4-Column Grid (Sliced to 4 items max) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.slice(0, 4).map((item) => (
                                <Link
                                    to={`/product/${item.id}`}
                                    key={item.id}
                                    className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#00A152]/30 hover:-translate-y-1 rounded-3xl p-5 flex flex-col transition-all duration-300 group"
                                >
                                    <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-5 flex items-center justify-center overflow-hidden p-6 relative mix-blend-multiply transition-colors group-hover:bg-[#0B2C5A]/5">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <span className="font-mono text-slate-300 text-xs">no_image_data</span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug line-clamp-2">{item.name}</h4>
                                    <p className="text-xs text-slate-500 mb-3">{item.category}</p>

                                    <div className="flex items-end gap-2 mt-auto mb-4">
                                        <span className="text-lg font-black text-[#0B2C5A]">₹{item.price.toLocaleString('en-IN')}</span>
                                    </div>

                                    <div className="w-full border border-slate-200 text-[#0B2C5A] font-bold text-xs py-2.5 rounded-lg text-center group-hover:bg-[#0B2C5A] group-hover:text-white transition-colors">
                                        View Details
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}