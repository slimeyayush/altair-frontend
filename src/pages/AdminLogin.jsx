import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Send credentials to the new Auth endpoint
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: username,
                password: password
            });

            // Extract the JWT and save it to localStorage
            const token = response.data.token;
            localStorage.setItem('adminToken', token);

            navigate('/admin');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid username or password.');
            } else {
                setError('Server error. Ensure backend is running.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-zinc-50 font-sans">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-center mb-8 tracking-tighter uppercase">admin login.</h1>

                {error && <div className="bg-red-500/10 text-red-500 text-sm font-bold p-3 rounded-lg mb-6 text-center">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black py-4 rounded-xl transition-colors uppercase text-sm tracking-widest mt-4"
                    >
                        {isLoading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}