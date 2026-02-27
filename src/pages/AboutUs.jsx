import React from 'react';
import Navbar from "./Navbar.jsx";
import { ShieldCheck, Stethoscope, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#1a73e8] selection:text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                        Elevating Healthcare Standard.
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        At Altair, we are dedicated to sourcing and delivering the highest quality medical equipment, diagnostic tools, and mobility aids directly to healthcare professionals and homes.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <div className="w-14 h-14 bg-[#1a73e8]/10 text-[#1a73e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Certified Quality</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Every product in our catalog undergoes rigorous quality checks to ensure compliance with global medical standards.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <div className="w-14 h-14 bg-[#1a73e8]/10 text-[#1a73e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Professional Grade</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Trusted by top hospitals and clinics, our equipment delivers precision and reliability when it matters most.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <div className="w-14 h-14 bg-[#1a73e8]/10 text-[#1a73e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Award className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Dedicated Support</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Our team provides end-to-end support, from product selection to post-purchase maintenance and guidance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}