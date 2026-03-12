import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, MessageCircle, Star, Twitter, Eye, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import Navbar from "./pages/Navbar.jsx";

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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00A152] selection:text-white pt-20">
            <Navbar />

            {/* Hero Section */}
            <section className="relative w-full h-[500px] md:h-[600px] flex items-center px-6 md:px-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B2C5A]/95 via-[#0B2C5A]/80 to-transparent"></div>

                <div className="relative z-10 max-w-2xl text-left">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 text-white leading-[1.1] tracking-tight">
                        Professional<br />
                        Medical Equipment<br />
                        <span className="text-[#00A152]">for Every Need</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-200 mb-8 max-w-xl font-medium leading-relaxed">
                        Sourcing the highest quality medical supplies and advanced diagnostic tools for healthcare professionals and home care.
                    </p>
                    <Link to="/shop" className="inline-flex items-center gap-2 bg-[#00A152] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#008a46] transition-all shadow-lg shadow-[#00A152]/30 uppercase tracking-widest text-sm">
                        Shop Collection
                    </Link>
                </div>
            </section>

            {/* Shop by Category Section */}
            {categoryData.length > 0 && (
                <section className="w-full bg-white py-20 px-6 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-10">
                            <h2 className="text-3xl font-black tracking-tight text-[#0B2C5A]">Shop by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {categoryData.slice(0, 4).map((category, idx) => (
                                <Link
                                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                                    key={idx}
                                    className="group relative h-48 md:h-64 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex items-end p-6 cursor-pointer shadow-sm hover:shadow-xl hover:border-[#0B2C5A]/20 transition-all duration-500"
                                >
                                    {category.imageUrl ? (
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-100 group-hover:scale-105 transition-transform duration-700"></div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C5A]/90 via-[#0B2C5A]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="relative z-10 w-full flex items-center justify-between">
                                        <div>
                                            <span className="block text-white font-bold text-lg md:text-xl tracking-tight leading-tight mb-1">
                                                {category.name}
                                            </span>
                                            <span className="block text-[11px] font-bold uppercase tracking-widest text-[#00A152] group-hover:text-white transition-colors">
                                                Explore &rarr;
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
            <section className="max-w-7xl mx-auto px-6 py-20 bg-slate-50">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-3xl font-black tracking-tight text-[#0B2C5A]">Featured Products</h2>
                    <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-[#00A152] hover:text-[#0B2C5A] transition-colors">View All &rarr;</Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-slate-400 font-mono text-sm flex items-center justify-center py-24">
                        [ loading catalogue... ]
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.slice(0, 4).map((product) => {
                            const hasVariants = product.variants && product.variants.length > 0;
                            const cartItem = cartItems.find(item => item.product.id === product.id && !item.variantDetails);

                            return (
                                <div key={product.id} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#00A152]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">

                                    {/* Variant Indicator Badge */}
                                    {hasVariants && (
                                        <span className="absolute top-8 left-8 z-10 bg-slate-900 text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                            <Layers className="w-3 h-3" /> Options
                                        </span>
                                    )}

                                    {/* Tag Badge */}
                                    {product.tag && (
                                        <span className={`absolute top-8 ${hasVariants ? 'right-8' : 'left-8'} z-10 bg-[#0B2C5A] text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow-sm`}>
                                            {product.tag}
                                        </span>
                                    )}

                                    <Link to={`/product/${product.id}`} className="block w-full aspect-square bg-slate-50 rounded-2xl mb-6 overflow-hidden relative cursor-pointer flex items-center justify-center mix-blend-multiply transition-colors group-hover:bg-[#0B2C5A]/5">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="object-contain w-3/4 h-3/4 group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <span className="font-mono text-slate-300 text-xs">no_image_data</span>
                                        )}
                                    </Link>

                                    <div className="flex flex-col flex-grow">
                                        <Link to={`/product/${product.id}`} className="block cursor-pointer hover:text-[#00A152] transition-colors mb-1">
                                            <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h4>
                                        </Link>
                                        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{product.category}</div>

                                        <div className="text-xl font-black text-[#0B2C5A] mb-6 mt-auto">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </div>

                                        <div className="mt-auto">
                                            {hasVariants ? (
                                                <Link to={`/product/${product.id}`} className="w-full bg-white border border-slate-200 hover:bg-[#0B2C5A] hover:border-[#0B2C5A] hover:text-white text-slate-700 font-bold py-3 rounded-xl transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                                                    Select Options
                                                </Link>
                                            ) : cartItem ? (
                                                <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 h-12 px-2">
                                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, -1); }} className="w-8 h-8 hover:bg-white text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-sm text-[#0B2C5A] w-8 text-center">{cartItem.quantity}</span>
                                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, 1); }} disabled={cartItem.quantity >= product.stockQuantity} className="w-8 h-8 hover:bg-white disabled:opacity-50 text-[#0B2C5A] rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.preventDefault(); addToCart(product); }} disabled={product.stockQuantity <= 0} className="w-full bg-white border border-slate-200 hover:bg-[#00A152] hover:border-[#00A152] hover:text-white disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 text-slate-700 font-bold py-3 rounded-xl transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
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

            {/* Testimonials Section (Moved Below Featured Products) */}
            <section className="max-w-7xl mx-auto px-6 py-20 bg-slate-50 border-t border-slate-100">
                <h2 className="text-3xl font-black tracking-tight text-[#0B2C5A] text-center mb-16">Trusted by Healthcare Professionals</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <div key={idx} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-shadow duration-300">
                            <div className="flex gap-1 text-yellow-400 mb-8">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                            </div>
                            <p className="text-slate-600 mb-10 text-base leading-relaxed flex-grow font-medium">
                                {testimonial.quote}
                            </p>
                            <div className="border-t border-slate-100 pt-6">
                                <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                                <p className="text-[#0B2C5A] text-xs font-bold mt-1 uppercase tracking-widest">{testimonial.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Promotional Banner */}
            <section className="w-full bg-[#0B2C5A] py-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Healthcare Essentials</h2>
                    <p className="text-slate-300 text-lg mb-10 font-medium max-w-xl mx-auto">Premium quality supplies and diagnostic tools designed for professional medical facilities and rigorous home care.</p>
                    <Link to="/shop" className="inline-block bg-[#00A152] text-white font-bold px-10 py-4 rounded-xl hover:bg-[#008a46] hover:-translate-y-1 transition-all duration-300 uppercase tracking-widest text-sm shadow-xl shadow-[#00A152]/20">
                        Explore Inventory
                    </Link>
                </div>
            </section>

            {/* Footer Restored and Styled to Match Theme */}
            <footer className="bg-white pt-20 pb-10 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm mb-16">
                    {/* Brand Column */}
                    <div>
                        <span className="text-xl font-black tracking-tighter text-[#0B2C5A] mb-6 flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#00A152] rounded-sm flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div> ALTAIR<span className="text-[#00A152]">.</span>
                        </span>
                        <p className="text-slate-500 mb-6 leading-relaxed font-medium">Providing reliable medical equipment and supplies to healthcare institutions and individuals worldwide since 2012.</p>
                        <div className="flex gap-3 text-[#0B2C5A]">
                            <a href="#" className="p-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 transition-colors"><Eye className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Customer Service</h4>
                        <ul className="space-y-4 text-slate-500 font-medium">
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">My Account</a></li>
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Track an Order</a></li>
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Support Center</a></li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Explore</h4>
                        <ul className="space-y-4 text-slate-500 font-medium">
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Equipment Maintenance</a></li>
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Quality Standards</a></li>
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Our Story</a></li>
                            <li><a href="#" className="hover:text-[#00A152] transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6 uppercase tracking-widest text-xs">Newsletter</h4>
                        <p className="text-slate-500 mb-4 font-medium">Stay updated with the latest in medical technology and supplies.</p>
                        <div className="flex flex-col gap-3">
                            <input type="email" placeholder="Email address" className="bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 w-full rounded-lg focus:outline-none focus:border-[#0B2C5A]" />
                            <button className="bg-[#0B2C5A] text-white px-4 py-3 rounded-lg hover:bg-[#082042] transition-colors font-bold uppercase tracking-widest text-[11px]">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
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