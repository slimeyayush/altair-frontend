import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, Clock, Twitter, Eye, MessageCircle } from "lucide-react";
import Navbar from "./Navbar.jsx"; // Assuming Navbar is in the same directory

const featuredPost = {
    id: 1,
    title: "The Future of AI-Powered Diagnostics in Healthcare",
    excerpt: "Exploring how artificial intelligence is revolutionizing medical diagnosis and patient care, from early detection to personalized treatment plans.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop",
    category: "Innovation",
    author: "Dr. Sarah Chen",
    date: "March 15, 2026",
    readTime: "8 min read",
};

const blogPosts = [
    {
        id: 2,
        title: "Best Practices for Medical Equipment Maintenance",
        excerpt: "Learn how to extend the lifespan of your medical equipment with proper maintenance protocols and regular servicing schedules.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
        category: "Maintenance",
        author: "Michael Torres",
        date: "March 10, 2026",
        readTime: "5 min read",
    },
    {
        id: 3,
        title: "Understanding FDA Medical Device Regulations",
        excerpt: "A comprehensive guide to navigating FDA approval processes and compliance requirements for medical devices.",
        image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=400&fit=crop",
        category: "Compliance",
        author: "James Mitchell",
        date: "March 5, 2026",
        readTime: "10 min read",
    },
    {
        id: 4,
        title: "Telemedicine Equipment Essentials for 2026",
        excerpt: "Discover the must-have equipment for establishing or upgrading your telemedicine capabilities this year.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
        category: "Telemedicine",
        author: "Dr. Emily Park",
        date: "February 28, 2026",
        readTime: "6 min read",
    },
    {
        id: 5,
        title: "Sustainable Practices in Medical Equipment Manufacturing",
        excerpt: "How the medical equipment industry is embracing sustainability without compromising quality or safety standards.",
        image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop",
        category: "Sustainability",
        author: "Dr. Sarah Chen",
        date: "February 20, 2026",
        readTime: "7 min read",
    },
    {
        id: 6,
        title: "Training Staff on New Medical Technology",
        excerpt: "Effective strategies for onboarding your healthcare team when implementing new medical equipment and systems.",
        image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
        category: "Training",
        author: "Michael Torres",
        date: "February 15, 2026",
        readTime: "4 min read",
    },
];

const categories = ["All", "Innovation", "Maintenance", "Compliance", "Telemedicine", "Sustainability", "Training"];

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState("All");

    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <Navbar />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-zinc-50/50 py-16 border-b border-zinc-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl">Blog & Insights</h1>
                        <p className="mt-4 text-lg font-medium text-zinc-500 max-w-2xl">
                            Stay updated with the latest in medical technology and healthcare innovation.
                        </p>
                    </div>
                </section>

                {/* Featured Post */}
                <section className="py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Link to={`/blog/${featuredPost.id}`} className="group block">
                            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                                    <img
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="w-fit inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-black border border-zinc-200">
                                        {featuredPost.category}
                                    </span>
                                    <h2 className="mt-6 text-3xl font-black tracking-tight text-black group-hover:text-zinc-600 transition-colors sm:text-4xl leading-tight">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="mt-4 text-base font-medium leading-relaxed text-zinc-500">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5 text-black">
                                            <User className="h-4 w-4" />
                                            {featuredPost.author}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {featuredPost.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {featuredPost.readTime}
                                        </span>
                                    </div>
                                    <div className="mt-8">
                                        <span className="inline-flex items-center font-bold text-sm text-black group-hover:text-zinc-500 transition-colors uppercase tracking-widest">
                                            Read Article
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Categories */}
                <section className="border-y border-zinc-200 bg-zinc-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-3 overflow-x-auto py-5 hide-scrollbar">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`whitespace-nowrap rounded-md px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm ${
                                        activeCategory === category
                                            ? "bg-black text-white"
                                            : "bg-white text-zinc-500 border border-zinc-200 hover:text-black hover:border-black"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Blog Posts Grid */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl font-black tracking-tight text-black">Latest Articles</h2>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {blogPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/blog/${post.id}`}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-black hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="overflow-hidden bg-zinc-50">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <span className="w-fit inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-zinc-100 text-black border border-zinc-200 mb-4">
                                            {post.category}
                                        </span>
                                        <h3 className="font-bold text-lg leading-snug text-black group-hover:text-zinc-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-zinc-500 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            <span className="text-black">{post.author}</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="bg-black py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="mt-4 text-base font-medium text-zinc-400">
                                Get the latest healthcare insights, product updates, and industry news delivered to your inbox.
                            </p>
                            <form className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="h-12 rounded-md border border-zinc-800 bg-zinc-900 px-5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white sm:w-80 text-sm font-medium transition-all"
                                />
                                <button
                                    type="submit"
                                    className="h-12 rounded-md bg-white px-8 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200 shadow-lg"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Global Footer to match the rest of the app */}
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

            {/* Floating WhatsApp Button */}
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
}