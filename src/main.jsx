import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import CartPage from './pages/CartPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; // MUST BE IMPORTED
import { CartProvider } from './context/CartContext.jsx';
import AdminLogin from "./pages/AdminLogin.jsx";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <CartProvider>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/login" element={<AdminLogin />} />{/* MUST BE HERE */}
                </Routes>
            </CartProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
