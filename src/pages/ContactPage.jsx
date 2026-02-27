import React, { useState } from 'react';
import Navbar from "./Navbar.jsx";
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export default function ContactPage() {
    // Replace with your actual WhatsApp business number (e.g., 919876543210 for India)
    const WHATSAPP_NUMBER = "919876543210";

    const [formData, setFormData] = useState({
        name: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWhatsAppSubmit = (e) => {
        e.preventDefault();

        // Format the message
        const text = `Hello Altair Support,\n\nMy name is ${formData.name}.\n\n${formData.message}`;

        // Encode the text for URL and open WhatsApp
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

        window.open(whatsappUrl, '_blank');

        // Clear form after sending
        setFormData({ name: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#1a73e8] selection:text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-slate-500">
                        Have a question about our equipment or need technical support? Send us a message and we'll reply directly on WhatsApp.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Left Side: Contact Information */}
                    <div className="bg-slate-900 text-white p-10 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-8">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-[#1a73e8] shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Office Location</h4>
                                        <p className="text-slate-400 text-sm">Sector 70, Gurgaon<br/>Haryana, India</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-[#1a73e8] shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Phone</h4>
                                        <p className="text-slate-400 text-sm">+91 98765 43210</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-[#1a73e8] shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Email</h4>
                                        <p className="text-slate-400 text-sm">support@altairhealthplus.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500">
                            Our support team is available Monday through Saturday, 9:00 AM to 6:00 PM IST.
                        </div>
                    </div>

                    {/* Right Side: WhatsApp Form */}
                    <div className="p-10">
                        <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                        <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">How can we help you?</label>
                                <textarea
                                    required
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="I'm inquiring about the specifications for..."
                                    rows="5"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition-all text-sm resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#25D366] hover:bg-[#1EBE5C] text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Send via WhatsApp
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}