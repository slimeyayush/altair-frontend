import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RentCpapPage() {
    const handleRentRequest = () => {
        const phoneNumber = "918800537507"; // Your established WhatsApp number
        const text = `Hello! I am interested in renting the Auto CPAP Machine.\n\nPlease share the availability and documentation requirements.`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans py-12">
            <div className="max-w-7xl mx-auto px-6">
                <Link to="/" className="text-zinc-500 hover:text-black text-xs font-bold uppercase tracking-widest mb-8 inline-block transition-colors">
                    &larr; Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Image Section */}
                    <div className="aspect-square bg-zinc-50 border border-zinc-200 rounded-3xl flex items-center justify-center p-8 sticky top-32">
                        {/* Replace src with your actual CPAP image path */}
                        <img
                            src="/cpap-machine.png"
                            alt="Auto CPAP Machine"
                            className="w-auto max-w-full h-auto object-contain mix-blend-multiply"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <span className="text-zinc-400 font-mono text-sm hidden">[ cpap_image_placeholder ]</span>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center py-8">
                        <div className="inline-block bg-zinc-100 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6 w-max">
                            Rental Service • Delhi NCR
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter lowercase">auto cpap rental.</h1>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-4xl font-black tracking-tighter">₹4,500</span>
                            <span className="text-zinc-500 font-medium text-sm uppercase tracking-widest">/ month</span>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Terms & Deposit</h3>
                            <div className="flex justify-between items-center text-sm font-medium border-b border-zinc-200 pb-3 mb-3">
                                <span className="text-zinc-600">Refundable Security Deposit</span>
                                <span className="text-black">₹15,000</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-zinc-600">Minimum Rental Period</span>
                                <span className="text-black">1 Month</span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">What's Included</h3>
                            <ul className="space-y-4">
                                {[
                                    'Auto CPAP Machine (ResMed / Philips)',
                                    'Heated Humidifier',
                                    'Standard CPAP Mask (Nasal/Full Face)',
                                    'Standard Breathing Tube',
                                    'Power Adapter & Filters'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-sm font-medium text-black">
                                        <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-black" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={handleRentRequest}
                            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-zinc-800 text-white font-black py-4 rounded-full transition-colors uppercase text-xs tracking-widest"
                        >
                            Request via WhatsApp
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-center text-zinc-500 text-xs mt-4 font-medium">Valid ID proof and medical prescription required.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}