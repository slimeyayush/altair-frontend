import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber } from 'firebase/auth'; // Adjust path if needed

export default function LoginModal({ isOpen, onClose }) {
    const [authMode, setAuthMode] = useState('select'); // 'select', 'phone', 'otp'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize reCAPTCHA for phone auth
    // Initialize reCAPTCHA only when the modal is open and the DOM is ready
    useEffect(() => {
        if (isOpen && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved
                }
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            setError('');
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();

            // Temporary log to prove it works. We will send this to Java later.

            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError('');
            // Phone number must include country code, e.g., +919876543210
            const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);

            setConfirmationResult(confirmation);
            setAuthMode('otp');
        } catch (err) {
            setError("Failed to send OTP. Check the number format.");
            console.error(err);
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

            // Temporary log to prove it works.
            console.log("Phone Token:", token);
            onClose();
        } catch (err) {
            setError("Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-black text-[#0B2C5A] mb-2 tracking-tight">Welcome Back.</h2>
                <p className="text-slate-500 text-sm mb-8">Sign in to access your orders and saved details.</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-6 border border-red-100">
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
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition-all shadow-sm"
                        >
                            <Mail className="w-5 h-5 text-red-500" />
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="shrink-0 px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">or</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <button
                            onClick={() => setAuthMode('phone')}
                            className="w-full flex items-center justify-center gap-3 bg-[#0B2C5A] hover:bg-[#082042] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-[#0B2C5A]/20"
                        >
                            <Phone className="w-5 h-5" />
                            Continue with Phone
                        </button>
                    </div>
                )}

                {authMode === 'phone' && (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mobile Number</label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="10-digit mobile number"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B2C5A] focus:ring-4 focus:ring-[#0B2C5A]/5"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#0B2C5A] hover:bg-[#082042] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all"
                        >
                            {isLoading ? 'Sending OTP...' : 'Get OTP'} <ArrowRight className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setAuthMode('select')} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest mt-4">
                            &larr; Back
                        </button>
                    </form>
                )}

                {authMode === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Enter OTP</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit code"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B2C5A] focus:ring-4 focus:ring-[#0B2C5A]/5 text-center tracking-[0.5em] font-mono text-lg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#00A152] hover:bg-[#008f48] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button type="button" onClick={() => setAuthMode('phone')} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest mt-4">
                            &larr; Change Number
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}