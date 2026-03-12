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

    // UI States
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    // Variant Selection States
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const MAX_DESC_LENGTH = 150;

    // 1. Fetch main product
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setProduct(null);
        setRelatedProducts([]);
        setActiveImage(null);
        setSelectedType(null);
        setSelectedSize(null);

        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`)
            .then(response => {
                if (isMounted) {
                    const p = response.data;
                    setProduct(p);
                    setActiveImage(p.imageUrl);

                    // Pre-select first variant type and size if variants exist
                    if (p.variants && p.variants.length > 0) {
                        const firstVariant = p.variants[0];
                        setSelectedType(firstVariant.variantType);
                        setSelectedSize(firstVariant.variantSize);
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

    // 2. Fetch related products
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

    // --- VARIANT LOGIC ---
    const hasVariants = product.variants && product.variants.length > 0;

    // Derive available types and sizes from the variants array
    const availableTypes = hasVariants ? [...new Set(product.variants.map(v => v.variantType).filter(Boolean))] : [];

    // Filter available sizes based on the currently selected type
    const availableSizes = hasVariants && selectedType
        ? [...new Set(product.variants.filter(v => v.variantType === selectedType).map(v => v.variantSize).filter(Boolean))]
        : [];

    // Identify the specific variant object the user has configured
    const currentVariant = hasVariants ? product.variants.find(v =>
        v.variantType === selectedType && v.variantSize === selectedSize
    ) : null;

    // Determine Display Price (Use variant override if it exists, otherwise base product price)
    const displayPrice = currentVariant && currentVariant.priceOverride
        ? currentVariant.priceOverride
        : product.price;

    // Determine Stock (Use variant stock if variant exists, otherwise base product stock)
    const displayStock = currentVariant
        ? currentVariant.stockQuantity
        : product.stockQuantity;

    // Build the variant string to match the CartContext signature
    const variantString = currentVariant
        ? `${currentVariant.variantType} ${currentVariant.variantSize ? '- ' + currentVariant.variantSize : ''}`.trim()
        : null;

    // Find if this exact configuration is already in the cart
    const cartItem = cartItems.find(item =>
        item.product.id === product.id && item.variantDetails === variantString
    );

    // Image Gallery Array
    const allImages = [product.imageUrl, ...(product.additionalImages?.map(img => img.imageUrl) || [])].filter(Boolean);

    // Description Truncation
    const needsTruncation = product.description && product.description.length > MAX_DESC_LENGTH;
    const displayDescription = needsTruncation && !isExpanded
        ? `${product.description.substring(0, MAX_DESC_LENGTH)}...`
        : product.description;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00A152] selection:text-white pb-20">

            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-8">

                <div className="flex items-center mb-8">
                    <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-[#0B2C5A] transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Shop
                    </Link>
                    <span className="mx-3 text-slate-300">/</span>
                    <span className="text-sm font-medium text-slate-400 capitalize">{product.category || 'Equipment'}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

                    {/* Left: Product Image & Gallery */}
                    <div className="flex flex-col gap-4 sticky top-24">
                        <div className="bg-white rounded-3xl p-8 lg:p-16 aspect-square flex items-center justify-center border border-slate-200 shadow-sm relative">
                            {product.tag && (
                                <span className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm z-10">
                                    {product.tag}
                                </span>
                            )}
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} className="object-contain w-full h-full mix-blend-multiply transition-opacity duration-300" />
                            ) : (
                                <span className="font-mono text-slate-300 text-sm">no_image_data</span>
                            )}
                        </div>

                        {/* Thumbnail Gallery (Only shows if there are additional images) */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto py-2 px-1 snap-x no-scrollbar">
                                {allImages.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(imgUrl)}
                                        className={`w-20 h-20 shrink-0 bg-white rounded-xl border-2 p-2 flex items-center justify-center snap-start transition-all ${activeImage === imgUrl ? 'border-[#0B2C5A] shadow-md' : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                                    >
                                        <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col pt-4">

                        <h1 className="text-3xl md:text-5xl font-black mb-4 text-[#0B2C5A] leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-6 text-yellow-400">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-sm text-slate-500 font-medium ml-2">(124 Customer Reviews)</span>
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-black text-[#0B2C5A] tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</span>
                            {product.oldPrice && displayPrice <= product.price && (
                                <span className="text-lg text-slate-400 line-through font-medium mb-1">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>

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

                        {/* DYNAMIC VARIANT SELECTORS */}
                        {hasVariants && (
                            <div className="mb-8 border-y border-slate-100 py-6 space-y-6">
                                {/* Type Selector */}
                                {availableTypes.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Type</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {availableTypes.map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setSelectedType(type);
                                                        // Auto-select first size of the new type
                                                        const sizesForType = product.variants.filter(v => v.variantType === type).map(v => v.variantSize).filter(Boolean);
                                                        if (sizesForType.length > 0) setSelectedSize(sizesForType[0]);
                                                        else setSelectedSize(null);
                                                    }}
                                                    className={`py-2 px-5 rounded-lg text-sm font-bold border transition-all ${
                                                        selectedType === type
                                                            ? 'bg-[#0B2C5A] border-[#0B2C5A] text-white shadow-md'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-[#0B2C5A] hover:text-[#0B2C5A]'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selector */}
                                {availableSizes.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Size</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {availableSizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`py-2 px-6 rounded-lg text-sm font-bold border transition-all ${
                                                        selectedSize === size
                                                            ? 'bg-[#00A152] border-[#00A152] text-white shadow-md'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-[#00A152] hover:text-[#00A152]'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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

                        <div className="mt-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Availability</span>
                                <span className={`text-sm font-bold ${displayStock > 0 ? 'text-[#00A152]' : 'text-red-500'}`}>
                                    {displayStock > 0 ? `${displayStock} In Stock` : 'Out of Stock'}
                                </span>
                            </div>

                            {cartItem ? (
                                <div className="flex gap-4">
                                    <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 h-14 px-2 w-32 shrink-0">
                                        <button onClick={() => updateQuantity(product.id, -1, variantString)} className="w-10 h-10 hover:bg-white text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="font-bold text-lg text-[#0B2C5A]">{cartItem.quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, 1, variantString)} disabled={cartItem.quantity >= displayStock} className="w-10 h-10 hover:bg-white disabled:opacity-50 text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button onClick={() => navigate('/cart')} className="flex-1 bg-[#00A152] hover:bg-[#008a46] text-white font-bold rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center">
                                        View Cart
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        // Package the variant ID if one is selected to send to the cart/backend
                                        const checkoutProduct = currentVariant
                                            ? { ...product, price: displayPrice, selectedVariantId: currentVariant.id }
                                            : product;

                                        addToCart(checkoutProduct, variantString);
                                    }}
                                    disabled={displayStock === 0 || (hasVariants && !currentVariant)}
                                    className="w-full bg-[#0B2C5A] hover:bg-[#082042] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold h-14 rounded-xl transition-all duration-300 text-sm shadow-sm flex items-center justify-center gap-3">
                                    <ShoppingCart className="w-5 h-5" />
                                    {displayStock === 0 ? 'Out of Stock' : (hasVariants && !currentVariant) ? 'Select Configuration' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-slate-200 pt-16 pb-12">
                        <h2 className="text-2xl font-black mb-8 tracking-tight text-[#0B2C5A]">You May Also Like</h2>

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