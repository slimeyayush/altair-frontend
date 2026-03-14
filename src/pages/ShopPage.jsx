import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Eye, Star, Heart, Filter, Tag } from 'lucide-react';
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
    // ADDED: Brand parameter
    const selectedBrand = searchParams.get('brand');

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

    // Extract unique categories and brands for the sidebar
    const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

    const handleCategoryChange = (category) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedCategory === category) {
            newParams.delete('category');
        } else {
            newParams.set('category', category);
        }
        setSearchParams(newParams);
    };

    // ADDED: Handler for brand checkbox toggling
    const handleBrandChange = (brand) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedBrand === brand) {
            newParams.delete('brand');
        } else {
            newParams.set('brand', brand);
        }
        setSearchParams(newParams);
    };

    // 1. FILTER LOGIC
    let processedProducts = products.filter(product => {
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        // ADDED: Check if brand matches
        const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
        const matchesStock = inStockOnly ? product.stockQuantity > 0 : true;
        return matchesCategory && matchesBrand && matchesStock;
    });

    // 2. SORT LOGIC
    if (sortOption === 'Price: Low to High') {
        processedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
        processedProducts.sort((a, b) => b.price - a.price);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-sm text-[#0B2C5A]">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0B2C5A] rounded-full animate-spin mb-4"></div>
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
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00A152] selection:text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Top Breadcrumb & Controls Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <div className="text-sm text-slate-500 mb-4 md:mb-0">
                        Showing <span className="font-bold text-[#0B2C5A]">{processedProducts.length}</span> products
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">Sort by:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none focus:border-[#0B2C5A]"
                        >
                            <option>Relevance</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT SIDEBAR: Filters */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="flex items-center gap-2 font-black tracking-tight text-xl mb-8 text-[#0B2C5A]">
                            <Filter className="w-5 h-5 text-[#00A152]" /> filters.
                        </div>

                        {/* Categories List */}
                        <div className="mb-10">
                            <h3 className="font-bold text-[#0B2C5A] mb-4 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Categories</h3>
                            <div className="space-y-3">
                                {allCategories.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${selectedCategory === cat ? 'bg-[#00A152] border-[#00A152]' : 'border-slate-300 group-hover:border-[#0B2C5A]'}`}>
                                            {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedCategory === cat}
                                            onChange={() => handleCategoryChange(cat)}
                                        />
                                        <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-[#0B2C5A] font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* NEW: Brands List */}
                        {allBrands.length > 0 && (
                            <div className="mb-10">
                                <h3 className="font-bold text-[#0B2C5A] mb-4 text-xs uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-slate-400" /> Brands
                                </h3>
                                <div className="space-y-3">
                                    {allBrands.map(brand => (
                                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${selectedBrand === brand ? 'bg-[#00A152] border-[#00A152]' : 'border-slate-300 group-hover:border-[#0B2C5A]'}`}>
                                                {selectedBrand === brand && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedBrand === brand}
                                                onChange={() => handleBrandChange(brand)}
                                            />
                                            <span className={`text-sm transition-colors ${selectedBrand === brand ? 'text-[#0B2C5A] font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                {brand}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Availability Toggle */}
                        <div>
                            <h3 className="font-bold text-[#0B2C5A] mb-4 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Availability</h3>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${inStockOnly ? 'bg-[#00A152]' : 'bg-slate-200'}`}>
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${inStockOnly ? 'translate-x-4' : 'translate-x-1.5'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={inStockOnly}
                                    onChange={() => setInStockOnly(!inStockOnly)}
                                />
                                <span className="text-sm font-bold text-slate-600">In Stock Only</span>
                            </label>
                        </div>
                    </aside>

                    {/* RIGHT MAIN CONTENT: Product Grid */}
                    <div className="flex-1">
                        {processedProducts.length === 0 ? (
                            <div className="text-center py-24 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <Package className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-slate-500 font-bold mb-2">No products match your current filters.</p>
                                <button onClick={() => { setSearchParams({}); setInStockOnly(false); }} className="text-[#00A152] font-bold hover:text-[#0B2C5A] transition-colors text-sm uppercase tracking-widest mt-2">
                                    Clear all filters &rarr;
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {processedProducts.map((product) => {
                                    const cartItem = cartItems.find(item => item.product.id === product.id && !item.variantDetails);
                                    const hasVariants = product.variants && product.variants.length > 0;

                                    return (
                                        <div key={product.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl hover:border-[#00A152]/30 hover:-translate-y-1 transition-all duration-300 relative">

                                            {/* Brand Badge */}
                                            {product.brand && (
                                                <span className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-100 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded shadow-sm">
                                                    {product.brand}
                                                </span>
                                            )}

                                            {/* Tag Badge */}
                                            {product.tag && (
                                                <span className={`absolute top-4 left-4 z-10 text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded shadow-sm ${product.tag.toLowerCase().includes('sale') ? 'bg-[#00A152]' : 'bg-[#0B2C5A]'}`}>
                                                    {product.tag}
                                                </span>
                                            )}

                                            {/* Image Section */}
                                            <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-6 overflow-hidden mix-blend-multiply transition-colors group-hover:bg-[#0B2C5A]/5">
                                                <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-auto max-w-full h-auto max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <span className="text-slate-300 font-mono text-xs">no_image_data</span>
                                                    )}
                                                </Link>
                                            </div>

                                            {/* Details Section */}
                                            <div className="p-6 flex flex-col flex-grow bg-white border-t border-slate-50">
                                                <div className="flex items-center gap-1 mb-3 text-yellow-400">
                                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                                    <span className="text-[10px] text-slate-400 font-bold ml-1 tracking-wider">({Math.floor(Math.random() * 200) + 42})</span>
                                                </div>

                                                <Link to={`/product/${product.id}`} className="hover:text-[#00A152] transition-colors">
                                                    <h3 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2 text-sm">{product.name}</h3>
                                                </Link>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">{product.category}</p>

                                                <div className="mt-auto mb-6 flex items-baseline gap-2">
                                                    <div className="text-xl font-black text-[#0B2C5A]">
                                                        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    {product.oldPrice && (
                                                        <span className="text-xs text-slate-400 line-through font-bold">₹{product.oldPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {hasVariants ? (
                                                        <Link to={`/product/${product.id}`} className="w-full bg-white border border-slate-200 hover:bg-[#0B2C5A] hover:border-[#0B2C5A] hover:text-white text-slate-700 font-bold py-3 rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                                                            Select Options
                                                        </Link>
                                                    ) : cartItem ? (
                                                        <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 h-[46px] px-2">
                                                            <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 hover:bg-white text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-bold text-sm text-[#0B2C5A] w-8 text-center">{cartItem.quantity}</span>
                                                            <button onClick={() => updateQuantity(product.id, 1)} disabled={cartItem.quantity >= product.stockQuantity} className="w-8 h-8 hover:bg-white disabled:opacity-50 text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            disabled={product.stockQuantity <= 0}
                                                            className="flex-1 bg-white border border-slate-200 hover:bg-[#00A152] hover:border-[#00A152] hover:text-white disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 text-slate-700 font-bold h-[46px] rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="w-[46px] h-[46px] flex shrink-0 items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-[#0B2C5A] hover:bg-slate-100 transition-colors"
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