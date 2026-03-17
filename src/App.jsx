import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, MessageCircle, Star, Twitter, Eye, Layers, Shield, Truck, HeartPulse, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import Navbar from "./pages/Navbar.jsx";

const features = [
    {
        icon: Shield,
        title: "FDA Approved",
        description: "All our equipment meets rigorous FDA standards and international certifications.",
    },
    {
        icon: Truck,
        title: "Global Delivery",
        description: "Fast, secure shipping to hospitals and clinics in over 120 countries.",
    },
    {
        icon: HeartPulse,
        title: "24/7 Support",
        description: "Round-the-clock technical assistance from certified healthcare professionals.",
    },
    {
        icon: Award,
        title: "5-Year Warranty",
        description: "Comprehensive coverage on all equipment with extended service options.",
    },
];

const stats = [
    { value: "15K+", label: "Products Delivered" },
    { value: "98%", label: "Customer Satisfaction" },
    { value: "120+", label: "Countries Served" },
    { value: "24/7", label: "Expert Support" },
];

const trustedBy = [
    "Mayo Clinic",
    "Johns Hopkins",
    "Cleveland Clinic",
    "Mass General",
    "Stanford Health",
];

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

    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-black">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                    <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-32">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                                Trusted by 2,000+ healthcare institutions
                            </p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-[1.1]">
                                Precision Medical Equipment for Modern Healthcare
                            </h1>
                            <p className="text-sm md:text-base font-medium leading-relaxed text-zinc-400 mb-10 max-w-xl mx-auto">
                                ALTAIR Health delivers cutting-edge medical technology to hospitals, clinics, and healthcare professionals. Experience innovation, reliability, and excellence in every product.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/shop" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-8 py-4 rounded-md transition-all uppercase tracking-widest text-xs shadow-lg">
                                    Browse Products <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-md transition-all uppercase tracking-widest text-xs">
                                    Request a Quote
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Trusted By Strip */}
                <section className="border-b border-zinc-200 bg-zinc-50 py-6">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 md:justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Trusted by leading institutions</p>
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {trustedBy.map((name) => (
                                    <span key={name} className="text-sm font-bold text-zinc-400">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Categories (Updated to strictly match Reference UI) */}
                {categoryData.length > 0 && (
                    <section className="bg-zinc-50 py-20 border-t border-zinc-200">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-black mb-2">Product Categories</h2>
                                    <p className="text-sm font-medium text-zinc-500">Explore our comprehensive range of medical equipment.</p>
                                </div>
                                <Link to="/shop" className="hidden sm:flex items-center gap-2 bg-white border border-zinc-200 text-black hover:bg-zinc-100 hover:border-black font-bold px-6 py-3 rounded-md transition-all text-xs uppercase tracking-widest shadow-sm">
                                    View All Products <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {categoryData.slice(0, 4).map((category, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/shop?category=${encodeURIComponent(category.name)}`}
                                        className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white"
                                    >
                                        <div className="aspect-square overflow-hidden bg-zinc-100">
                                            {category.imageUrl ? (
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-zinc-200 transition-transform duration-500 group-hover:scale-105" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 p-4">
                                            <h3 className="text-base font-semibold text-white">{category.name}</h3>
                                            <p className="mt-0.5 text-xs text-white/80">
                                                Explore collection &rarr;
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-8 sm:hidden">
                                <Link to="/shop" className="flex items-center justify-center gap-2 w-full bg-white border border-zinc-200 text-black hover:bg-zinc-100 font-bold px-6 py-4 rounded-md transition-all text-xs uppercase tracking-widest shadow-sm">
                                    View All Products <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}




                {/* Features Grid */}
                <section className="py-20 bg-white">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="mx-auto max-w-xl text-center mb-16">
                            <h2 className="text-3xl font-black tracking-tight text-black mb-4">
                                Why Healthcare Leaders Choose ALTAIR
                            </h2>
                            <p className="text-sm font-medium text-zinc-500">
                                We combine innovation with reliability to deliver equipment you can trust.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div key={feature.title} className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-black hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-black mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-black text-black mb-2">{feature.title}</h3>
                                    <p className="text-sm font-medium leading-relaxed text-zinc-500">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>




                {/* Featured Products */}
                <section className="max-w-7xl mx-auto px-6 py-20 bg-white">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-3xl font-black tracking-tight text-black">Featured Inventory</h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-zinc-400 font-mono text-sm flex items-center justify-center py-24">
                            [ loading catalogue... ]
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.slice(0, 4).map((product) => {
                                const hasVariants = product.variants && product.variants.length > 0;
                                const cartItem = cartItems.find(item => item.product.id === product.id && !item.variantDetails);

                                return (
                                    <div key={product.id} className="group bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-black hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
                                        {hasVariants && (
                                            <span className="absolute top-8 left-8 z-10 bg-black text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                                                <Layers className="w-3 h-3" /> Options
                                            </span>
                                        )}
                                        {product.tag && (
                                            <span className={`absolute top-8 ${hasVariants ? 'right-8' : 'left-8'} z-10 bg-black text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm shadow-sm`}>
                                                {product.tag}
                                            </span>
                                        )}

                                        <Link to={`/product/${product.id}`} className="block w-full aspect-square bg-zinc-50 rounded-lg mb-6 overflow-hidden relative cursor-pointer flex items-center justify-center mix-blend-multiply transition-colors group-hover:bg-zinc-100">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="object-contain w-3/4 h-3/4 group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <span className="font-mono text-zinc-300 text-xs">no_image_data</span>
                                            )}
                                        </Link>

                                        <div className="flex flex-col flex-grow">
                                            <Link to={`/product/${product.id}`} className="block cursor-pointer hover:text-zinc-600 transition-colors mb-1">
                                                <h4 className="font-bold text-black leading-snug line-clamp-2">{product.name}</h4>
                                            </Link>
                                            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-3">{product.category}</div>

                                            <div className="text-xl font-black text-black mb-6 mt-auto">
                                                ₹{product.price.toLocaleString('en-IN')}
                                            </div>

                                            <div className="mt-auto">
                                                {hasVariants ? (
                                                    <Link to={`/product/${product.id}`} className="w-full bg-white border border-zinc-200 hover:bg-black hover:border-black hover:text-white text-black font-bold py-3 rounded-md transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                                                        Select Options
                                                    </Link>
                                                ) : cartItem ? (
                                                    <div className="flex items-center justify-between border border-zinc-200 rounded-md bg-zinc-50 h-12 px-2">
                                                        <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, -1); }} className="w-8 h-8 hover:bg-white hover:border hover:border-zinc-200 text-black rounded-sm flex items-center justify-center transition-colors shadow-sm">
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold text-sm text-black w-8 text-center">{cartItem.quantity}</span>
                                                        <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, 1); }} disabled={cartItem.quantity >= product.stockQuantity} className="w-8 h-8 hover:bg-white hover:border hover:border-zinc-200 disabled:opacity-50 text-black rounded-sm flex items-center justify-center transition-colors shadow-sm">
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={(e) => { e.preventDefault(); addToCart(product); }} disabled={product.stockQuantity <= 0} className="w-full bg-white border border-zinc-200 hover:bg-black hover:border-black hover:text-white disabled:bg-zinc-50 disabled:border-zinc-100 disabled:text-zinc-400 text-black font-bold py-3 rounded-md transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
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

                {/* Stats Section */}
                <section className="py-16 bg-black">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-4xl font-black tracking-tight text-white mb-2">{stat.value}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-zinc-50 border-b border-zinc-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl font-black tracking-tight text-black text-center mb-16">Trusted by Healthcare Professionals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, idx) => (
                                <div key={idx} className="bg-white p-10 rounded-xl shadow-sm border border-zinc-200 flex flex-col hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex gap-1 text-black mb-8">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                    </div>
                                    <p className="text-zinc-600 mb-10 text-sm md:text-base leading-relaxed flex-grow font-medium">
                                        {testimonial.quote}
                                    </p>
                                    <div className="border-t border-zinc-100 pt-6">
                                        <h4 className="font-black text-black">{testimonial.name}</h4>
                                        <p className="text-zinc-400 text-[10px] font-bold mt-1 uppercase tracking-widest">{testimonial.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-black py-20">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-6">
                            Ready to Transform Your Healthcare Facility?
                        </h2>
                        <p className="text-base font-medium text-zinc-400 mb-10 max-w-2xl mx-auto">
                            Get in touch with our team for personalized recommendations, bulk orders, and competitive pricing.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/contact" className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-bold px-8 py-4 rounded-md transition-all uppercase tracking-widest text-xs shadow-lg">
                                Request a Quote
                            </Link>
                            <Link to="/shop" className="w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-md transition-all uppercase tracking-widest text-xs">
                                Browse Catalog
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm mb-16">
                    <div>
                        <span className="text-xl font-black tracking-tighter text-black mb-6 flex items-center gap-2">
                            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center font-black text-white text-xs">
                                A
                            </div> ALTAIR<span className="text-zinc-400">.</span>
                        </span>
                        <p className="text-zinc-500 mb-6 leading-relaxed font-medium">Providing reliable medical equipment and supplies to healthcare institutions and individuals worldwide since 2012.</p>
                        <div className="flex gap-3 text-black">
                            <a href="#" className="p-2 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"><Eye className="w-4 h-4" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-black font-bold mb-6 uppercase tracking-widest text-xs">Customer Service</h4>
                        <ul className="space-y-4 text-zinc-500 font-medium">
                            <li><a href="#" className="hover:text-black transition-colors">My Account</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Track an Order</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Support Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-black font-bold mb-6 uppercase tracking-widest text-xs">Explore</h4>
                        <ul className="space-y-4 text-zinc-500 font-medium">
                            <li><a href="#" className="hover:text-black transition-colors">Equipment Maintenance</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Quality Standards</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Our Story</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-black font-bold mb-6 uppercase tracking-widest text-xs">Newsletter</h4>
                        <p className="text-zinc-500 mb-4 font-medium">Stay updated with the latest in medical technology and supplies.</p>
                        <div className="flex flex-col gap-3">
                            <input type="email" placeholder="Email address" className="bg-zinc-50 border border-zinc-200 text-black px-4 py-3 w-full rounded-md focus:outline-none focus:border-black" />
                            <button className="bg-black text-white px-4 py-3 rounded-md hover:bg-zinc-800 transition-colors font-bold uppercase tracking-widest text-[11px]">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    <p>&copy; 2026 ALTAIR Health. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0 items-center">
                        <span>GSTIN: 07AAACA1234A1Z5</span>
                    </div>
                </div>
            </footer>

            <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center border border-zinc-800"
                aria-label="Contact us on WhatsApp"
            >
                <MessageCircle className="w-6 h-6" />
            </a>
        </div>
    );
};

export default App;