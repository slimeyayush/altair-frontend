import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw, Check } from 'lucide-react';
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

    const [isExpanded, setIsExpanded] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    // Instead of string matching, we store the actual selected variant object ID
    const [selectedVariantId, setSelectedVariantId] = useState(null);

    const MAX_DESC_LENGTH = 150;

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setProduct(null);
        setRelatedProducts([]);
        setActiveImage(null);
        setSelectedVariantId(null);

        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`)
            .then(response => {
                if (isMounted) {
                    const p = response.data;
                    setProduct(p);
                    setActiveImage(p.imageUrl);

                    // Pre-select first variant if variants exist
                    if (p.variants && p.variants.length > 0) {
                        setSelectedVariantId(p.variants[0].id);
                    }

                    setLoading(false);
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error("Error fetching product:", error);
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [id]);

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
        return () => { isMounted = false; };
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center font-mono text-sm text-zinc-500">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4 mx-auto"></div>
                loading inventory data...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-black mb-4 tracking-tight">Product Not Found</h1>
                <button onClick={() => navigate('/shop')} className="text-zinc-500 hover:text-black underline underline-offset-4 font-medium transition-colors">Return to Shop</button>
            </div>
        );
    }

    // --- VARIANT LOGIC (Relational) ---
    const hasVariants = product.variants && product.variants.length > 0;

    // Identify the specific variant object the user has selected
    const currentVariant = hasVariants ? product.variants.find(v => v.id === selectedVariantId) : null;

    // Determine Display Price
    // If a variant is selected, use priceOverride (if exists) OR the linked product's true price. Else, base price.
    const displayPrice = currentVariant
        ? (currentVariant.priceOverride ? currentVariant.priceOverride : currentVariant.linkedProduct.price)
        : product.price;

    // Determine Stock (Use linked standalone product stock, otherwise base parent stock)
    const displayStock = currentVariant
        ? currentVariant.linkedProduct.stockQuantity
        : product.stockQuantity;

    // Find if this exact configuration is already in the cart
    const cartItem = cartItems.find(item =>
        item.product.id === product.id && item.variantId === (currentVariant ? currentVariant.id : null)
    );

    const allImages = [product.imageUrl, ...(product.additionalImages?.map(img => img.imageUrl) || [])].filter(Boolean);
    const needsTruncation = product.description && product.description.length > MAX_DESC_LENGTH;
    const displayDescription = needsTruncation && !isExpanded
        ? `${product.description.substring(0, MAX_DESC_LENGTH)}...`
        : product.description;

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white pb-20">

            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                <div className="flex items-center mb-8">
                    <Link to="/shop" className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors text-xs font-semibold uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Back to Shop
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

                    {/* Left: Product Image & Gallery */}
                    <div className="flex flex-col gap-4 sticky top-24">
                        <div className="bg-zinc-50 rounded-xl p-8 lg:p-16 aspect-square flex items-center justify-center border border-zinc-200 shadow-sm relative overflow-hidden group">
                            {product.tag && (
                                <span className="absolute top-6 left-6 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-sm shadow-sm z-10">
                                    {product.tag}
                                </span>
                            )}
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} className="object-contain w-full h-full mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <span className="font-mono text-zinc-300 text-xs">no_image_data</span>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto py-2 px-1 snap-x hide-scrollbar">
                                {allImages.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(imgUrl)}
                                        className={`w-20 h-20 shrink-0 bg-zinc-50 rounded-lg border-2 p-2 flex items-center justify-center snap-start transition-all ${activeImage === imgUrl ? 'border-black shadow-sm' : 'border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-300'}`}
                                    >
                                        <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col pt-4">

                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                            {product.brand || product.category || 'Equipment'}
                        </p>

                        <h1 className="text-3xl md:text-4xl font-black mb-4 text-black leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-6 text-yellow-500">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-xs text-zinc-500 font-medium ml-2 underline underline-offset-4 cursor-pointer hover:text-black transition-colors">(124 Reviews)</span>
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-black text-black tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</span>
                            {product.oldPrice && displayPrice <= product.price && (
                                <span className="text-base text-zinc-400 line-through font-medium mb-1">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        <div className="mb-8">
                            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
                                {displayDescription || "No detailed description provided for this product."}
                            </p>
                            {needsTruncation && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-black font-bold text-xs uppercase tracking-widest hover:text-zinc-500 mt-3 transition-colors focus:outline-none"
                                >
                                    {isExpanded ? "Read Less" : "Read More"}
                                </button>
                            )}
                        </div>

                        {/* DYNAMIC VARIANT SELECTORS (Relational) */}
                        {hasVariants && (
                            <div className="mb-8 border-y border-zinc-200 py-6 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Configuration Options</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {product.variants.map(variant => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariantId(variant.id)}
                                                className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                                                    selectedVariantId === variant.id
                                                        ? 'bg-zinc-50 border-black shadow-sm ring-1 ring-black'
                                                        : 'bg-white border-zinc-200 hover:border-zinc-400'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedVariantId === variant.id ? 'border-black bg-black text-white' : 'border-zinc-300'}`}>
                                                        {selectedVariantId === variant.id && <Check className="w-3 h-3" />}
                                                    </div>
                                                    <span className={`text-sm font-semibold ${selectedVariantId === variant.id ? 'text-black' : 'text-zinc-600'}`}>
                                                        {variant.variantLabel}
                                                    </span>
                                                </div>
                                                <span className={`text-sm font-bold ${selectedVariantId === variant.id ? 'text-black' : 'text-zinc-500'}`}>
                                                    ₹{variant.priceOverride ? variant.priceOverride.toLocaleString('en-IN') : variant.linkedProduct.price.toLocaleString('en-IN')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <ul className="space-y-3 mb-10 border-t border-zinc-200 pt-8">
                            <li className="flex items-center gap-3 text-xs text-zinc-600 font-semibold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4 text-black" /> Premium medical-grade quality
                            </li>
                            <li className="flex items-center gap-3 text-xs text-zinc-600 font-semibold uppercase tracking-wider">
                                <Truck className="w-4 h-4 text-black" /> Fast, secure shipping available
                            </li>
                            <li className="flex items-center gap-3 text-xs text-zinc-600 font-semibold uppercase tracking-wider">
                                <RotateCcw className="w-4 h-4 text-black" /> 30-day hassle-free returns
                            </li>
                        </ul>

                        <div className="mt-auto bg-zinc-50 p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xs font-bold text-black uppercase tracking-widest">Availability</span>
                                <span className={`text-xs font-bold uppercase tracking-widest ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {displayStock > 0 ? `${displayStock} In Stock` : 'Out of Stock'}
                                </span>
                            </div>

                            {cartItem ? (
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-between border border-zinc-300 rounded-md bg-white h-12 px-1 w-32 shrink-0">
                                        <button onClick={() => updateQuantity(product.id, -1, currentVariant?.id)} className="w-8 h-8 hover:bg-zinc-100 text-black rounded-sm flex items-center justify-center transition-colors">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold text-base text-black">{cartItem.quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, 1, currentVariant?.id)} disabled={cartItem.quantity >= displayStock} className="w-8 h-8 hover:bg-zinc-100 disabled:opacity-50 text-black rounded-sm flex items-center justify-center transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button onClick={() => navigate('/cart')} className="flex-1 bg-white border border-zinc-300 hover:bg-zinc-100 text-black font-bold rounded-md transition-colors text-xs uppercase tracking-widest shadow-sm flex items-center justify-center">
                                        View Cart
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        // We pass the parent product, the specific variant ID, and the display label
                                        const checkoutProduct = { ...product, price: displayPrice };
                                        addToCart(checkoutProduct, currentVariant?.id, currentVariant?.variantLabel);
                                    }}
                                    disabled={displayStock === 0 || (hasVariants && !currentVariant)}
                                    className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold h-12 rounded-md transition-all duration-300 text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-3">
                                    <ShoppingCart className="w-4 h-4" />
                                    {displayStock === 0 ? 'Out of Stock' : (hasVariants && !currentVariant) ? 'Select Configuration' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-zinc-200 pt-16 pb-12">
                        <h2 className="text-2xl font-black mb-8 tracking-tight text-black">You May Also Like</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.slice(0, 4).map((item) => (
                                <Link
                                    to={`/product/${item.id}`}
                                    key={item.id}
                                    className="bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-black rounded-xl p-4 flex flex-col transition-all duration-300 group"
                                >
                                    <div className="w-full aspect-square bg-zinc-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden p-4 relative mix-blend-multiply transition-colors group-hover:bg-zinc-100">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="font-mono text-zinc-300 text-[10px]">no_image</span>
                                        )}
                                    </div>
                                    <h4 className="text-xs font-semibold text-black mb-1 leading-snug line-clamp-2">{item.name}</h4>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-3">{item.category}</p>

                                    <div className="flex items-end gap-2 mt-auto mb-4">
                                        <span className="text-sm font-bold text-black">₹{item.price.toLocaleString('en-IN')}</span>
                                    </div>

                                    <div className="w-full border border-zinc-200 text-black font-semibold text-[10px] uppercase tracking-widest py-2.5 rounded-md text-center group-hover:bg-black group-hover:text-white transition-colors">
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