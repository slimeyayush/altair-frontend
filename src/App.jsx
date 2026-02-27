import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, MessageCircle, Star, Twitter, Eye, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import Navbar from "./pages/Navbar.jsx"; // Adjust path based on where you saved it

const App = () => {
    const [products, setProducts] = useState([]);
    const { cartItems, addToCart, updateQuantity } = useCart();

    // Fetch main grid products
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    // Dynamically extract unique categories from the database products
    const categoryData = [...new Set(products.map(p => p.category).filter(Boolean))].map(category => {
        const firstProduct = products.find(p => p.category === category && p.imageUrl);
        return {
            name: category,
            imageUrl: firstProduct ? firstProduct.imageUrl : null
        };
    });

    // Hardcoded Testimonials matching the design
    const testimonials = [
        {
            quote: "\"Altair Health Plus has been our primary supplier for diagnostic tools for over three years. Their commitment to precision and reliability is unmatched in the industry.\"",
            name: "Dr. Sarah Chen",
            title: "Chief of Surgery, Central Hospital"
        },
        {
            quote: "\"The speed of delivery and the professional-grade quality of their patient care equipment helped us upgrade our clinic facilities significantly within budget.\"",
            name: "James Wilson",
            title: "Clinic Administrator, Star Health Services"
        },
        {
            quote: "\"Excellent support and maintenance services. Their surgical instrumentation is of the highest standard, ensuring the best outcomes for our patients.\"",
            name: "Dr. Elena Rodriguez",
            title: "Senior Oncologist, Metro Medical Center"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
            {/* Injected Reusable Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section className="relative w-full h-[500px] md:h-[600px] flex items-center px-6 md:px-16 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>

                <div className="relative z-10 max-w-2xl text-left">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 text-white leading-[1.1] tracking-tight">
                        Professional<br />
                        Medical Equipment<br />
                        <span className="text-blue-400">for Every Need</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-200 mb-8 max-w-xl font-medium leading-relaxed">
                        Sourcing the highest quality medical supplies and advanced diagnostic tools for healthcare professionals and home care.
                    </p>
                    <Link to="/shop" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        Shop Now
                    </Link>
                </div>
            </section>

            {/* Shop by Category Section (Light & Aesthetic Theme) */}
            {categoryData.length > 0 && (
                <section className="w-full bg-slate-50 py-16 px-6 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Shop by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {categoryData.slice(0, 4).map((category, idx) => (
                                <Link
                                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                                    key={idx}
                                    className="group relative h-48 md:h-56 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-end p-6 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Image Base */}
                                    {category.imageUrl ? (
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-100 group-hover:scale-105 transition-transform duration-700"></div>
                                    )}

                                    {/* Clean Gradient Overlay - Makes text pop without darkening the whole card */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>

                                    {/* Category Text */}
                                    <div className="relative z-10 w-full flex items-center justify-between">
                                        <div>
                                            <span className="block text-white font-bold text-lg md:text-xl tracking-tight leading-tight mb-1">
                                                {category.name}
                                            </span>
                                            <span className="block text-xs font-medium text-blue-300 group-hover:text-white transition-colors">
                                                Explore Collection &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-6 py-16 bg-white">
                <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Featured Products</h2>
                    <Link to="/shop" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">View All</Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-slate-400 font-medium text-sm flex items-center justify-center py-24">
                        Loading catalogue...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.slice(0, 4).map((product) => {
                            const cartItem = cartItems.find(item => item.product.id === product.id);

                            return (
                                <div key={product.id} className="group flex flex-col h-full">
                                    {/* Image Container */}
                                    <Link to={`/product/${product.id}`} className="block w-full aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden relative cursor-pointer flex items-center justify-center border border-slate-100">
                                        {product.tag && (
                                            <span className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm pointer-events-none">
                                                {product.tag}
                                            </span>
                                        )}
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="object-contain w-3/4 h-3/4 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                                        ) : (
                                            <span className="font-mono text-slate-300 text-sm">No Image</span>
                                        )}
                                    </Link>

                                    {/* Product Info */}
                                    <div className="flex flex-col flex-grow">
                                        <Link to={`/product/${product.id}`} className="block cursor-pointer hover:text-blue-600 transition-colors">
                                            <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">{product.name}</h4>
                                        </Link>
                                        <div className="text-xs text-slate-500 mt-1 mb-2">{product.category}</div>
                                        <div className="text-lg font-bold text-blue-600 mb-4">
                                            ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>

                                        {/* Dynamic Cart Logic Restored */}
                                        <div className="mt-auto">
                                            {cartItem ? (
                                                <div className="flex items-center justify-between border border-blue-600 rounded-md bg-blue-50 h-10 px-1">
                                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, -1); }} className="w-8 h-8 hover:bg-white text-blue-600 rounded flex items-center justify-center transition-colors">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-sm text-blue-600 w-8 text-center">{cartItem.quantity}</span>
                                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, 1); }} disabled={cartItem.quantity >= product.stockQuantity} className="w-8 h-8 hover:bg-white disabled:opacity-50 text-blue-600 rounded flex items-center justify-center transition-colors">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.preventDefault(); addToCart(product); }} disabled={product.stockQuantity <= 0} className="w-full bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 text-slate-700 font-bold py-2 rounded-md transition-all duration-300 text-sm flex items-center justify-center gap-2">
                                                    <ShoppingCart className="w-4 h-4" />
                                                    {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Promotional Banner */}
            <section className="w-full bg-gradient-to-r from-[#185adb] to-[#0a3d91] py-16 px-6 text-center text-white relative overflow-hidden my-8">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Healthcare Essentials</h2>
                    <p className="text-blue-100 text-lg mb-8">Quality Supplies for Professional Facilities</p>
                    <Link to="/shop" className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-md hover:bg-slate-50 hover:shadow-lg transition-all duration-300">
                        View Essentials
                    </Link>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="max-w-7xl mx-auto px-6 py-16 bg-slate-50">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 text-center mb-12">Trusted by Healthcare Professionals</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                            <div className="flex gap-1 text-yellow-400 mb-6">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-slate-600 mb-8 text-sm leading-relaxed flex-grow italic">
                                {testimonial.quote}
                            </p>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
                                <p className="text-blue-600 text-xs mt-1">{testimonial.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm mb-12">
                    {/* Brand Column */}
                    <div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-sm"></div> ALTAIR
                        </span>
                        <p className="text-slate-500 mb-6 leading-relaxed">Providing reliable medical equipment and supplies to healthcare institutions and individuals worldwide since 2012.</p>
                        <div className="flex gap-3 text-blue-600">
                            <a href="#" className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"><Eye className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Customer Service</h4>
                        <ul className="space-y-3 text-slate-500">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">My Account</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Track an Order</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Support Center</a></li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Explore</h4>
                        <ul className="space-y-3 text-slate-500">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Equipment Maintenance</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Quality Standards</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Our Story</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Newsletter</h4>
                        <p className="text-slate-500 mb-4">Providing reliable medical equipment and supplies to healthcare institutions.</p>
                        <div className="flex">
                            <input type="email" placeholder="Email address" className="bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2 w-full rounded-l-md focus:outline-none focus:border-blue-600" />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors font-bold">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs">
                    <p>&copy; 2026 Altair Health Plus. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0 items-center">
                        <span>GSTIN: 07AAACA1234A1Z5</span>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
                aria-label="Contact us on WhatsApp"
            >
                <MessageCircle className="w-6 h-6" />
            </a>
        </div>
    );
};

export default App;