import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingBag, Check, PlusCircle, LogOut, UserPlus, Eye, EyeOff, Edit2, X, Trash2, Search, Filter, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const CATEGORY_OPTIONS = [
        "Diagnostic Tools", "Mobility Aids", "Surgical Instruments",
        "PPE", "Sleep Apnea", "CPAP Masks", "Accessories", "Hospital Equip"
    ];

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [admins, setAdmins] = useState([]);
    const navigate = useNavigate();

    // Search and Filter states for Orders
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

    // State for the Order Details Modal
    const [viewingOrder, setViewingOrder] = useState(null);

    const token = localStorage.getItem('adminToken');
    const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', oldPrice: '', stockQuantity: '', category: '', tag: '', imageUrl: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };
    const handleError = (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            alert("Session expired. Please log in again.");
            handleLogout();
        } else {
            console.error("API Error:", error);
        }
    };
    const fetchData = async () => {
        try {
            if (activeTab === 'orders') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`, axiosConfig);
                setOrders(res.data);
            } else if (activeTab === 'inventory') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/inventory`, axiosConfig);
                setProducts(res.data);
            } else if (activeTab === 'add-admin') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, axiosConfig);
                setAdmins(res.data);
            }
        } catch (error) {
            handleError(error);
        }
    };
    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [activeTab, navigate, token]);







    // --- ORDER ACTIONS ---
    const handleMarkPaid = async (orderId) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/${orderId}/mark-paid`, {}, axiosConfig);
            fetchData();
        } catch (error) {
            alert("Error marking as paid or stock depleted.");
            handleError(error);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/${orderId}/status`, { status: newStatus }, axiosConfig);
            fetchData();
        } catch (error) {
            handleError(error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(`Are you sure you want to cancel Order #${orderId}? This will restock the items.`)) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders/${orderId}/cancel`, {}, axiosConfig);
            fetchData();
        } catch (error) {
            alert("Failed to cancel order.");
            handleError(error);
        }
    };

    // --- INVENTORY ACTIONS ---
    const handleToggleVisibility = async (productId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/inventory/${productId}/toggle-visibility`, {}, axiosConfig);
            fetchData();
        } catch (error) { handleError(error); }
    };

    const handleStockUpdate = async (productId, newStock) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/inventory/${productId}`, { stockQuantity: parseInt(newStock) }, axiosConfig);
            fetchData();
        } catch (error) { handleError(error); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
                stockQuantity: parseInt(newProduct.stockQuantity)
            };
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products`, payload, axiosConfig);
            alert("Product added successfully!");
            setNewProduct({ name: '', description: '', price: '', oldPrice: '', stockQuantity: '', category: '', tag: '', imageUrl: '' });
            setActiveTab('inventory');
        } catch (error) { handleError(error); }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...editingProduct,
                price: parseFloat(editingProduct.price),
                oldPrice: editingProduct.oldPrice ? parseFloat(editingProduct.oldPrice) : null,
                stockQuantity: parseInt(editingProduct.stockQuantity)
            };
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${editingProduct.id}`, payload, axiosConfig);
            alert("Product updated successfully!");
            setEditingProduct(null);
            fetchData();
        } catch (error) { handleError(error); }
    };

    // --- ADMIN ACTIONS ---
    const handleDeleteAdmin = async (id, username) => {
        if (!window.confirm(`Are you sure you want to delete admin '${username}'?`)) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins/${id}`, axiosConfig);
            fetchData();
        } catch (error) { handleError(error); }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/register-admin`, newAdmin, axiosConfig);
            alert(`Admin user '${newAdmin.username}' created successfully!`);
            setNewAdmin({ username: '', password: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data || "Failed to create admin.");
            handleError(error);
        }
    };

    const handleProductInputChange = (e) => setNewProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleAdminInputChange = (e) => setNewAdmin(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // --- FILTER LOGIC FOR ORDERS ---
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customerEmail?.toLowerCase().includes(orderSearchTerm.toLowerCase());
        const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-black text-zinc-50 font-sans flex relative">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col hidden md:flex shrink-0">
                <div className="text-2xl font-black text-white tracking-tighter mb-12">admin.</div>
                <nav className="space-y-4 flex-1">
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'orders' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                        <ShoppingBag className="w-5 h-5" /> Orders
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'inventory' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                        <Package className="w-5 h-5" /> Inventory
                    </button>
                    <button onClick={() => setActiveTab('add-product')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'add-product' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                        <PlusCircle className="w-5 h-5" /> Add Product
                    </button>
                    <button onClick={() => setActiveTab('add-admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'add-admin' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                        <UserPlus className="w-5 h-5" /> Admins
                    </button>
                </nav>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-red-500 hover:bg-zinc-900 transition-colors mt-auto">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </aside>

            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <h1 className="text-3xl font-black mb-8 tracking-tighter uppercase">
                    {activeTab === 'orders' && 'Order Management'}
                    {activeTab === 'inventory' && 'Inventory Management'}
                    {activeTab === 'add-product' && 'Add New Product'}
                    {activeTab === 'add-admin' && 'Admin Management'}
                </h1>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {/* Control Bar: Search & Filter */}
                        <div className="flex flex-col md:flex-row gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search by email or phone number..."
                                    value={orderSearchTerm}
                                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-zinc-500" />
                                <select
                                    value={orderStatusFilter}
                                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-xs">
                                <tr>
                                    <th className="p-4 border-b border-zinc-900">ID</th>
                                    <th className="p-4 border-b border-zinc-900">Contact</th>
                                    <th className="p-4 border-b border-zinc-900">Total (₹)</th>
                                    <th className="p-4 border-b border-zinc-900">Status</th>
                                    <th className="p-4 border-b border-zinc-900 text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900">
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-zinc-500 font-mono">No orders found matching criteria.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className={`hover:bg-zinc-900/50 transition-colors ${order.status === 'CANCELLED' ? 'opacity-50' : ''}`}>
                                            <td className="p-4 font-mono text-zinc-400">#{order.id}</td>
                                            <td className="p-4 font-medium text-white">{order.customerEmail}</td>
                                            <td className="p-4 font-bold text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest 
                                                    ${order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-green-500/10 text-green-500'}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 rounded transition-colors"
                                                        title="View Order Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {order.status === 'CANCELLED' ? (
                                                        <span className="text-xs text-zinc-600 font-bold uppercase ml-2">Cancelled</span>
                                                    ) : (
                                                        <>
                                                            {order.status === 'PENDING' ? (
                                                                <button onClick={() => handleMarkPaid(order.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-500 transition-colors">Mark Paid</button>
                                                            ) : (
                                                                <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="bg-zinc-950 border border-zinc-800 text-white text-xs rounded py-1.5 px-2 focus:outline-none focus:border-zinc-500">
                                                                    <option value="PAID">PAID</option>
                                                                    <option value="SHIPPED">SHIPPED</option>
                                                                    <option value="DELIVERED">DELIVERED</option>
                                                                </select>
                                                            )}
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                                title="Cancel Order & Restock"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                    <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-xs">
                            <tr>
                                <th className="p-4 border-b border-zinc-900">ID</th>
                                <th className="p-4 border-b border-zinc-900">Name</th>
                                <th className="p-4 border-b border-zinc-900">Status</th>
                                <th className="p-4 border-b border-zinc-900">Stock Update</th>
                                <th className="p-4 border-b border-zinc-900 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                            {products.map(product => (
                                <tr key={product.id} className={`hover:bg-zinc-900/50 transition-colors ${!product.active ? 'opacity-50' : ''}`}>
                                    <td className="p-4 font-mono text-zinc-500">#{product.id}</td>
                                    <td className="p-4 font-bold text-white truncate max-w-[200px]">{product.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${product.active ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {product.active ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <input type="number" defaultValue={product.stockQuantity} id={`stock-${product.id}`} className="w-16 bg-zinc-950 border border-zinc-800 text-white text-sm rounded p-1 text-center focus:outline-none focus:border-white" />
                                        <button onClick={() => handleStockUpdate(product.id, document.getElementById(`stock-${product.id}`).value)} className="bg-zinc-800 text-white p-1.5 rounded hover:bg-white hover:text-black transition-colors" title="Save Stock">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingProduct(product)} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors" title="Edit Product">
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleToggleVisibility(product.id)} className={`p-2 rounded-lg transition-colors ${product.active ? 'text-zinc-400 hover:bg-red-900/30 hover:text-red-500' : 'text-zinc-400 hover:bg-green-900/30 hover:text-green-500'}`} title={product.active ? "Hide" : "Show"}>
                                                {product.active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Product Form */}
                {activeTab === 'add-product' && (
                    <form onSubmit={handleAddProduct} className="max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Product Name *</label>
                                <input required type="text" name="name" value={newProduct.name} onChange={handleProductInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Description *</label>
                                <textarea required name="description" value={newProduct.description} onChange={handleProductInputChange} rows="3" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white"></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Price (₹) *</label>
                                <input required type="number" step="0.01" name="price" value={newProduct.price} onChange={handleProductInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Old Price (₹)</label>
                                <input type="number" step="0.01" name="oldPrice" value={newProduct.oldPrice} onChange={handleProductInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Initial Stock *</label>
                                <input required type="number" name="stockQuantity" value={newProduct.stockQuantity} onChange={handleProductInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Category *</label>
                                <select required name="category" value={newProduct.category} onChange={handleProductInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white appearance-none">
                                    <option value="" disabled>Select category...</option>
                                    {CATEGORY_OPTIONS.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Tag</label>
                                <input type="text" name="tag" value={newProduct.tag} onChange={handleProductInputChange} placeholder="e.g. Best Seller" className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Image URL</label>
                                <input type="url" name="imageUrl" value={newProduct.imageUrl} onChange={handleProductInputChange} placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                        </div>
                        <button type="submit" className="mt-8 w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl transition-colors uppercase text-sm tracking-widest">
                            Save Product
                        </button>
                    </form>
                )}

                {/* Admin Management Tab */}
                {activeTab === 'add-admin' && (
                    <div className="max-w-2xl space-y-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Current Administrators</h2>
                            {admins.length === 0 ? (
                                <p className="text-sm text-zinc-500 font-mono">[ no admins loaded ]</p>
                            ) : (
                                <ul className="space-y-3">
                                    {admins.map((admin) => (
                                        <li key={admin.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-lg group">
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-white">{admin.username}</span>
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">Active</span>
                                            </div>
                                            <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} className="p-2 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete Admin">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <form onSubmit={handleAddAdmin} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Register New Admin</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Username *</label>
                                    <input required type="text" name="username" value={newAdmin.username} onChange={handleAdminInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Password *</label>
                                    <input required type="password" name="password" value={newAdmin.password} onChange={handleAdminInputChange} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                                </div>
                            </div>
                            <button type="submit" className="mt-8 w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl transition-colors uppercase text-sm tracking-widest">
                                Register Admin
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* View Order Modal Overlay (NEW & FIXED LAYOUT) */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-2xl shrink-0">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                                    ORDER #{viewingOrder.id}
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest 
                                        ${viewingOrder.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                        viewingOrder.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                            viewingOrder.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-green-500/10 text-green-500'}`}
                                    >
                                        {viewingOrder.status}
                                    </span>
                                </h2>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="text-zinc-500 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto space-y-6">

                            {/* Customer Info (Stacked for better fit) */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Customer Details</h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="block text-zinc-500 mb-1">Email / Phone</span>
                                        <span className="text-white font-medium break-all">{viewingOrder.customerEmail}</span>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 mb-2">Shipping Address</span>
                                        {/* Added break-words to ensure long text never causes horizontal scroll */}
                                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-white font-medium leading-relaxed whitespace-pre-wrap break-words">
                                            {viewingOrder.shippingAddress || 'No address provided'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Products Ordered</h3>
                                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                                    <ul className="divide-y divide-zinc-800">
                                        {viewingOrder.items.map((item, idx) => (
                                            <li key={idx} className="py-4 flex justify-between items-center group">
                                                <div className="flex flex-col pr-4">
                                                    <span className="text-white font-bold mb-1 line-clamp-2">{item.product?.name || 'Unknown Product'}</span>
                                                    <span className="text-xs font-mono text-zinc-400">
                                                        Qty: {item.quantity}  ×  ₹{item.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <span className="text-white font-black shrink-0">
                                                    ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-zinc-500 text-sm py-4 italic">No items found for this order.</p>
                                )}
                            </div>
                        </div>

                        {/* Sticky Footer Total */}
                        <div className="p-6 bg-zinc-900/80 border-t border-zinc-800 rounded-b-2xl flex justify-between items-center shrink-0">
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Total Amount</span>
                            <span className="text-2xl font-black text-white">₹{viewingOrder.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>

                    </div>
                </div>
            )}

            {/* Edit Product Modal Overlay */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Edit Product</h2>
                            <button onClick={() => setEditingProduct(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Product Name</label>
                                <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea required rows="2" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white"></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Price (₹)</label>
                                <input required type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Old Price (₹)</label>
                                <input type="number" step="0.01" value={editingProduct.oldPrice || ''} onChange={e => setEditingProduct({...editingProduct, oldPrice: parseFloat(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Stock Quantity</label>
                                <input required type="number" value={editingProduct.stockQuantity} onChange={e => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
                                <select required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white appearance-none">
                                    <option value="" disabled>Select category...</option>
                                    {CATEGORY_OPTIONS.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Tag</label>
                                <input type="text" value={editingProduct.tag || ''} onChange={e => setEditingProduct({...editingProduct, tag: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Image URL</label>
                                <input type="url" value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-white" />
                            </div>
                            <div className="md:col-span-2 mt-6 flex gap-4">
                                <button type="submit" className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl transition-colors uppercase text-sm tracking-widest">
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-black py-4 rounded-xl transition-colors uppercase text-sm tracking-widest">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}