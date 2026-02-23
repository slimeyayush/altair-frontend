import React from 'react';
import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title }) {
    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center font-sans">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter lowercase">{title}.</h1>
            <p className="text-zinc-500 font-mono text-sm mb-8">[ content coming soon ]</p>
            <Link to="/" className="text-xs font-bold uppercase tracking-widest border border-zinc-200 py-3 px-6 rounded-full hover:bg-zinc-50 transition-colors">
                &larr; Return Home
            </Link>
        </div>
    );
}