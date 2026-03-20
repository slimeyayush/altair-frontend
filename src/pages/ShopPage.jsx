import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Star, Filter, Tag, LayoutGrid, List, Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from "./Navbar.jsx";

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cartItems, addToCart, updateQuantity } = useCart();

    // UI View State (Grid or List)
    const [viewMode, setViewMode] = useState("grid");

    // Filters State
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');
    const selectedBrand = searchParams.get('brand');

    const [sortOption, setSortOption] = useState('Relevance');
    const [inStockOnly, setInStockOnly] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/categories`)
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load products. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Extract unique brands for the sidebar directly from products
    const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

    const handleCategoryChange = (categoryName) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedCategory === categoryName) {
            newParams.delete('category');
        } else {
            newParams.set('category', categoryName);
        }
        setSearchParams(newParams);
    };

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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-sm text-black">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4"></div>
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
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 font-sans selection:bg-black selection:text-white pb-20">
            <Navbar />

            <main className="flex-1">
                {/* Page Header */}
                <section className="bg-zinc-50/50 py-8 border-b border-zinc-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Products</h1>
                        <p className="mt-1.5 text-sm text-zinc-500">
                            Browse our comprehensive range of medical equipment and supplies.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Top Controls Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-zinc-100 gap-4">
                        <div className="text-sm text-zinc-500">
                            Showing <span className="font-semibold text-black">{processedProducts.length}</span> products
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                <span>Sort by:</span>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="bg-white border border-zinc-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:border-black text-xs cursor-pointer"
                                >
                                    <option>Relevance</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>

                            <div className="hidden sm:flex rounded-md border border-zinc-200 bg-white">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-black"}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <div className="w-px bg-zinc-200"></div>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-zinc-100 text-black" : "text-zinc-400 hover:text-black"}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        {/* LEFT SIDEBAR: Filters */}
                        <aside className="w-full md:w-56 shrink-0 space-y-8">
                            <div className="flex items-center gap-2 font-semibold text-sm text-black uppercase tracking-widest border-b border-zinc-200 pb-2">
                                <Filter className="w-4 h-4" /> Filters
                            </div>

                            {/* Categories List (Mapped from Database state) */}
                            {categories.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-black mb-4 text-sm">Categories</h3>
                                    <div className="space-y-3">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedCategory === cat.name}
                                                    onChange={() => handleCategoryChange(cat.name)}
                                                />
                                                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${selectedCategory === cat.name ? 'bg-black border-black text-white' : 'border-zinc-300 bg-transparent group-hover:border-black'}`}>
                                                    {selectedCategory === cat.name && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className={`text-sm transition-colors ${selectedCategory === cat.name ? 'text-black font-medium' : 'text-zinc-600 group-hover:text-black'}`}>
                                                    {cat.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Brands List */}
                            {allBrands.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-black mb-4 text-sm flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" /> Brands
                                    </h3>
                                    <div className="space-y-3">
                                        {allBrands.map(brand => (
                                            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedBrand === brand}
                                                    onChange={() => handleBrandChange(brand)}
                                                />
                                                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${selectedBrand === brand ? 'bg-black border-black text-white' : 'border-zinc-300 bg-transparent group-hover:border-black'}`}>
                                                    {selectedBrand === brand && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className={`text-sm transition-colors ${selectedBrand === brand ? 'text-black font-medium' : 'text-zinc-600 group-hover:text-black'}`}>
                                                    {brand}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Availability Toggle */}
                            <div>
                                <h3 className="font-semibold text-black mb-4 text-sm">Availability</h3>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${inStockOnly ? 'bg-black' : 'bg-zinc-200'}`}>
                                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${inStockOnly ? 'translate-x-4' : 'translate-x-1'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-600">In Stock Only</span>
                                </label>
                            </div>
                        </aside>

                        {/* RIGHT MAIN CONTENT: Product Grid */}
                        <div className="flex-1">
                            {processedProducts.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col items-center">
                                    <div className="text-sm font-medium text-black">No products found</div>
                                    <p className="mt-1 text-xs text-zinc-500">Try adjusting your search or filter criteria.</p>
                                    <button onClick={() => { setSearchParams({}); setInStockOnly(false); }} className="mt-4 text-xs font-semibold text-black underline underline-offset-4 hover:text-zinc-600 transition-colors">
                                        Clear all filters
                                    </button>
                                </div>
                            ) : (
                                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                                    {processedProducts.map((product) => {
                                        const cartItem = cartItems.find(item => item.product.id === product.id && !item.variantDetails);
                                        const hasVariants = product.variants && product.variants.length > 0;

                                        return (
                                            <div key={product.id} className={`group rounded-lg border border-zinc-200 bg-white transition-all hover:border-black hover:shadow-md ${viewMode === "list" ? "flex flex-col sm:flex-row p-3 gap-4" : "flex flex-col"}`}>

                                                {/* Image Section */}
                                                <div className={`relative overflow-hidden bg-zinc-100 ${viewMode === "list" ? "h-48 sm:h-32 sm:w-32 shrink-0 rounded-md" : "aspect-square rounded-t-lg"}`}>
                                                    {/* Brand Badge */}
                                                    {product.brand && (
                                                        <span className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm text-black border border-zinc-200 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                            {product.brand}
                                                        </span>
                                                    )}

                                                    {/* Tag Badge */}
                                                    {product.tag && (
                                                        <span className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                            {product.tag}
                                                        </span>
                                                    )}

                                                    <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center mix-blend-multiply">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <span className="text-zinc-400 font-mono text-[10px]">no_image</span>
                                                        )}
                                                    </Link>

                                                    {!product.stockQuantity && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                                                            <span className="text-xs font-bold text-black bg-white px-2 py-1 rounded border border-zinc-200">Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details Section */}
                                                <div className={`flex flex-col flex-1 ${viewMode === "list" ? "justify-between" : "p-4"}`}>
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-0.5">{product.category}</p>
                                                        <Link to={`/product/${product.id}`} className="hover:text-zinc-600 transition-colors">
                                                            <h3 className="font-semibold text-sm text-black leading-tight line-clamp-2">{product.name}</h3>
                                                        </Link>

                                                        <div className="mt-1.5 flex items-center gap-1.5">
                                                            <div className="flex items-center gap-0.5 text-yellow-500">
                                                                <Star className="h-3 w-3 fill-current" />
                                                                <span className="text-xs font-medium text-black ml-0.5">4.8</span>
                                                            </div>
                                                            <span className="text-[10px] text-zinc-400">({Math.floor(Math.random() * 100) + 12})</span>
                                                        </div>
                                                    </div>

                                                    <div className={`mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${viewMode === "list" && "sm:mt-auto"}`}>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-sm font-bold text-black">
                                                                ₹{product.price.toLocaleString('en-IN')}
                                                            </span>
                                                            {product.oldPrice && (
                                                                <span className="text-[10px] text-zinc-400 line-through">₹{product.oldPrice.toLocaleString()}</span>
                                                            )}
                                                        </div>

                                                        {/* Cart Actions */}
                                                        <div className={`flex items-center gap-2 ${viewMode === "list" ? "w-full sm:w-auto" : "w-full"}`}>
                                                            {hasVariants ? (
                                                                <Link to={`/product/${product.id}`} className="w-full bg-white border border-zinc-200 hover:bg-black hover:text-white text-black font-semibold h-9 px-3 rounded-md text-xs transition-colors flex items-center justify-center shadow-sm">
                                                                    Select Options
                                                                </Link>
                                                            ) : cartItem ? (
                                                                <div className="flex w-full sm:w-[110px] items-center justify-between border border-zinc-200 rounded-md bg-zinc-50 h-9 px-1">
                                                                    <button onClick={() => updateQuantity(product.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-white border border-transparent hover:border-zinc-200 rounded-sm text-black transition-colors">
                                                                        <Minus className="w-3 h-3" />
                                                                    </button>
                                                                    <span className="font-semibold text-xs text-black">{cartItem.quantity}</span>
                                                                    <button onClick={() => updateQuantity(product.id, 1)} disabled={cartItem.quantity >= product.stockQuantity} className="w-7 h-7 flex items-center justify-center hover:bg-white border border-transparent hover:border-zinc-200 disabled:opacity-50 text-black rounded-sm transition-colors">
                                                                        <Plus className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => addToCart(product)}
                                                                    disabled={product.stockQuantity <= 0}
                                                                    className="w-full sm:w-auto flex-1 bg-white border border-zinc-200 hover:bg-black hover:border-black hover:text-white disabled:bg-zinc-50 disabled:text-zinc-400 text-black font-semibold h-9 px-4 rounded-md text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                                >
                                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                                    Add
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}