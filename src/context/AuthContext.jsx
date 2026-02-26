import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Adjust path based on your folder structure
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This listener fires automatically whenever the user logs in or logs out
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);