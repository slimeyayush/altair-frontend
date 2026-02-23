import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems, addToCart, updateQuantity } = useCart();

    // 1. Fetch main product
    useEffect(() => {
        setLoading(true);
        axios.get(`\`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`)
            .then(response => {
                setProduct(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching product:", error);
                setLoading(false);
            });
    }, [id]);

    // 2. Fetch related products once the main product is known
    useEffect(() => {
        if (product && product.category) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/category/${product.category}`)
                .then(response => {
                    // Filter out the current product so it doesn't recommend itself
                    const filtered = response.data.filter(p => p.id !== product.id);
                    setRelatedProducts(filtered);
                })
                .catch(error => console.error("Error fetching related products:", error));
        }
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm text-zinc-500">
                [ loading product data ]
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-black mb-4">Product Not Found</h1>
                <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white underline">Return Home</button>
            </div>
        );
    }

    const cartItem = cartItems.find(item => item.product.id === product.id);

    return (
        <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-blue-500 selection:text-white py-12 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">
                        <ArrowLeft className="w-4 h-4" /> Back to Catalogue
                    </Link>
                    <Link to="/cart" className="relative cursor-pointer group">
                        <ShoppingCart className="text-zinc-400 group-hover:text-white transition-colors" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
                        )}
                    </Link>
                </div>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-24">

                    <div className="bg-zinc-950 rounded-3xl p-12 aspect-square flex items-center justify-center border border-zinc-900 sticky top-24">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="object-contain w-full h-full drop-shadow-2xl" />
                        ) : (
                            <span className="font-mono text-zinc-700 text-sm">no_image_data</span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        {product.tag && (
                            <span className="self-start mb-6 bg-white text-black text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
                {product.tag}
              </span>
                        )}

                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tighter">
                            {product.name}
                        </h1>

                        <div className="text-xs font-mono text-zinc-500 mb-8 uppercase border-b border-zinc-900 pb-8">
                            {product.stockQuantity} units available • Category: {product.category || 'Equipment'}
                        </div>

                        <div className="flex items-end gap-4 mb-10">
                            <span className="text-5xl font-black text-white tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.oldPrice && (
                                <span className="text-xl text-zinc-600 line-through font-medium mb-1">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        <div className="prose prose-invert prose-zinc mb-12">
                            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-zinc-400 text-sm">Description</h3>
                            <p className="text-zinc-300 leading-relaxed text-lg font-medium">
                                {product.description || "No detailed description provided for this product. Contact support for more information regarding specifications."}
                            </p>
                        </div>

                        <div className="mt-auto">
                            {cartItem ? (
                                <div className="flex items-center justify-between border border-white rounded-full bg-black h-16 overflow-hidden px-2 max-w-sm">
                                    <button
                                        onClick={() => updateQuantity(product.id, -1)}
                                        className="w-12 h-12 hover:bg-zinc-900 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <Minus className="w-5 h-5 text-white" />
                                    </button>
                                    <span className="font-black text-2xl text-white w-12 text-center">{cartItem.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(product.id, 1)}
                                        disabled={cartItem.quantity >= product.stockQuantity}
                                        className="w-12 h-12 hover:bg-zinc-900 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <Plus className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stockQuantity === 0}
                                    className="w-full max-w-sm bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-600 text-black font-black py-5 rounded-full transition-colors uppercase text-sm tracking-widest">
                                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-zinc-900 pt-16 pb-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-10 tracking-tighter">you might also need.</h2>

                        {/* Horizontal Scroll Container */}
                        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {relatedProducts.map((item) => (
                                <Link
                                    to={`/product/${item.id}`}
                                    key={item.id}
                                    className="min-w-[280px] md:min-w-[320px] snap-start bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col transition-colors group"
                                >
                                    <div className="w-full aspect-square bg-zinc-950 rounded-xl mb-6 flex items-center justify-center overflow-hidden p-6">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="font-mono text-zinc-700 text-xs">no_image_data</span>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2 leading-tight h-12 line-clamp-2">{item.name}</h4>
                                    <div className="flex items-end gap-2 mt-auto">
                                        <span className="text-xl font-black text-white">₹{item.price.toLocaleString('en-IN')}</span>
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