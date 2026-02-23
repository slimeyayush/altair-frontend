import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext'; // Adjust path if needed

export default function ShopPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Ensure your backend allows this endpoint and Vercel has the env var
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
            <div className="min-h-screen bg-white flex items-center justify-center font-mono text-sm text-zinc-500">
                [ loading_catalog ]
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
        <div className="min-h-screen bg-white text-zinc-900 font-sans py-12">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-16 tracking-tighter lowercase border-b border-zinc-200 pb-8">
                    our shop.
                </h1>

                {Object.keys(groupedProducts).length === 0 ? (
                    <div className="text-zinc-500 font-mono text-sm py-8">[ no products available ]</div>
                ) : (
                    Object.entries(groupedProducts).map(([category, items]) => (
                        <div key={category} className="mb-20">
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-2xl font-black tracking-tighter lowercase">{category}.</h2>
                                <div className="h-[1px] bg-zinc-200 flex-grow mt-2"></div>
                                <span className="text-zinc-400 font-mono text-xs mt-2">{items.length} items</span>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {items.map((product) => (
                                    <div key={product.id} className="group flex flex-col">
                                        {/* Image Container */}
                                        <div className="aspect-square bg-zinc-50 border border-zinc-200 rounded-2xl mb-4 flex items-center justify-center p-6 relative overflow-hidden transition-colors group-hover:border-zinc-300 group-hover:bg-zinc-100">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-auto max-w-full h-auto object-contain mix-blend-multiply"
                                                />
                                            ) : (
                                                <span className="text-zinc-400 font-mono text-[10px]">[ no_image ]</span>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-col flex-grow">
                                            <h3 className="font-bold text-black leading-tight mb-2">{product.name}</h3>
                                            <p className="text-sm font-medium text-zinc-500 mb-4 line-clamp-2">{product.description}</p>

                                            <div className="mt-auto flex items-end justify-between">
                                                <div className="text-xl font-black tracking-tighter text-black">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </div>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stockQuantity <= 0}
                                                    className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-black hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-zinc-200"
                                                    title={product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                                                >
                                                    {product.stockQuantity <= 0 ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Out</span>
                                                    ) : (
                                                        <Plus className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}