"use client"

import React, { useState } from 'react';
import { X, Mail, Phone, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber } from 'firebase/auth';

export default function LoginModal({ isOpen, onClose }) {
    const [authMode, setAuthMode] = useState('select'); // 'select', 'phone', 'otp'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            setError('');
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();

            // Temporary log to prove it works. We will send this to Java later.
            console.log("Google Token:", token);

            onClose();
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const setupRecaptcha = () => {
        // Destroy existing instance to prevent DOM conflicts
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }

        // Initialize fresh instance
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
                // reCAPTCHA solved automatically
            }
        });
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError('');

            // Clean input: remove spaces and enforce E.164 format
            let cleanNumber = phoneNumber.trim().replace(/\s+/g, '');
            const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;

            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;

            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setAuthMode('otp');

        } catch (err) {
            console.error("OTP Error:", err);
            setError("Failed to send OTP. Check the number format.");

            // Reset reCAPTCHA on failure so the user can try again
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError('');
            const result = await confirmationResult.confirm(otp);
            const token = await result.user.getIdToken();

            console.log("Phone Token:", token);

            onClose();
        } catch (err) {
            console.error("OTP Verification Error:", err);
            setError("Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl">

                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black hover:bg-zinc-100 p-1.5 rounded-md transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold tracking-tight text-black mb-1.5">Welcome back</h2>
                <p className="text-zinc-500 text-sm mb-6">Sign in to access your orders and saved details.</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs font-medium mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {/* Invisible container required by Firebase for SMS Auth */}
                <div id="recaptcha-container"></div>

                {authMode === 'select' && (
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-black hover:bg-zinc-50 font-semibold py-2.5 rounded-md transition-colors shadow-sm text-sm"
                        >
                            <Mail className="w-4 h-4 text-red-500" />
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-zinc-200"></div>
                            <span className="shrink-0 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">or continue with</span>
                            <div className="flex-grow border-t border-zinc-200"></div>
                        </div>

                        <button
                            onClick={() => setAuthMode('phone')}
                            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-zinc-800 text-white font-semibold py-2.5 rounded-md transition-colors shadow-sm text-sm"
                        >
                            <Phone className="w-4 h-4" />
                            Phone Number
                        </button>
                    </div>
                )}

                {authMode === 'phone' && (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Mobile Number</label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="10-digit mobile number"
                                className="w-full bg-white border border-zinc-200 text-black rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-md transition-colors text-sm shadow-sm"
                        >
                            {isLoading ? 'Sending OTP...' : 'Get OTP'} <ArrowRight className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setAuthMode('select')} className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-black transition-colors mt-2">
                            &larr; Back
                        </button>
                    </form>
                )}

                {authMode === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Enter OTP</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit code"
                                className="w-full bg-white border border-zinc-200 text-black rounded-md py-3 px-3 focus:outline-none focus:ring-1 focus:ring-black transition-all text-center tracking-[0.5em] font-mono text-base"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-md transition-colors text-sm shadow-sm"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button type="button" onClick={() => setAuthMode('phone')} className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-black transition-colors mt-2">
                            &larr; Change Number
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}