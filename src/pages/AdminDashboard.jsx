import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Check, PlusCircle, LogOut, UserPlus, Eye, EyeOff, Edit2, X, Trash2, Search, Filter, XCircle, Users, ListOrdered, LayoutGrid } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [customers, setCustomers] = useState([]);

    // NEW: Dynamic Categories State
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', imageUrl: '' });

    const navigate = useNavigate();

    // Search and Filter states for Orders
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

    // States for Modals
    const [viewingOrder, setViewingOrder] = useState(null);
    const [viewingCustomerOrders, setViewingCustomerOrders] = useState(null);

    const token = localStorage.getItem('adminToken');
    const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

    const initialProductState = {
        name: '', brand: '', description: '', price: '', oldPrice: '', stockQuantity: '', category: '', tag: '', imageUrl: '',
        additionalImages: [], variants: []
    };

    const [newProduct, setNewProduct] = useState(initialProductState);
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
            } else if (activeTab === 'inventory' || activeTab === 'add-product') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/inventory`, axiosConfig);
                setProducts(res.data);
                // Also fetch categories so the dropdown populates
                const catRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`, axiosConfig);
                setCategories(catRes.data);
            } else if (activeTab === 'categories') {
                const catRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`, axiosConfig);
                setCategories(catRes.data);
            } else if (activeTab === 'add-admin') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/admins`, axiosConfig);
                setAdmins(res.data);
            } else if (activeTab === 'customers') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/customers`, axiosConfig);
                setCustomers(res.data);
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
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, navigate, token]);

    // --- DYNAMIC ARRAY HANDLERS (Images & Variants) ---
    const handleAddArrayItem = (isEditing, field, defaultObj) => {
        const setter = isEditing ? setEditingProduct : setNewProduct;
        setter(prev => ({ ...prev, [field]: [...(prev[field] || []), defaultObj] }));
    };

    const handleRemoveArrayItem = (isEditing, field, index) => {
        const setter = isEditing ? setEditingProduct : setNewProduct;
        setter(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const handleArrayItemChange = (isEditing, field, index, key, value) => {
        const setter = isEditing ? setEditingProduct : setNewProduct;
        setter(prev => {
            const newArray = [...(prev[field] || [])];
            newArray[index] = { ...newArray[index], [key]: value };
            return { ...prev, [field]: newArray };
        });
    };

    // --- CATEGORY ACTIONS ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`, newCategory, axiosConfig);
            alert("Category added successfully!");
            setNewCategory({ name: '', description: '', imageUrl: '' });
            fetchData();
        } catch (error) { handleError(error); }
    };

    const handleDeleteCategory = async (id, name) => {
        if (!window.confirm(`Delete category '${name}'? Products using this category name will remain, but the category will disappear from filters.`)) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories/${id}`, axiosConfig);
            fetchData();
        } catch (error) { handleError(error); }
    };

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

    // --- FORMAT PRODUCT PAYLOAD (Matches Relational Structure) ---
    const formatProductPayload = (productObj) => {
        return {
            ...productObj,
            price: parseFloat(productObj.price),
            oldPrice: productObj.oldPrice ? parseFloat(productObj.oldPrice) : null,
            stockQuantity: parseInt(productObj.stockQuantity),
            additionalImages: productObj.additionalImages || [],
            variants: (productObj.variants || []).map(v => ({
                id: v.id || null, // Keep ID if updating existing variant
                variantLabel: v.variantLabel,
                priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
                linkedProduct: { id: parseInt(v.linkedProductId) } // Critical: maps to DB entity
            }))
        };
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = formatProductPayload(newProduct);
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products`, payload, axiosConfig);
            alert("Product added successfully!");
            setNewProduct(initialProductState);
            setActiveTab('inventory');
        } catch (error) { handleError(error); }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = formatProductPayload(editingProduct);
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
        <div className="min-h-screen bg-zinc-50/50 text-black font-sans flex relative selection:bg-black selection:text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col hidden md:flex shrink-0">
                <div className="flex items-center gap-2 mb-10">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
                        <span className="text-sm font-bold text-white">A</span>
                    </div>
                    <span className="text-base font-bold tracking-tight">ALTAIR Admin</span>
                </div>

                <nav className="space-y-1.5 flex-1">
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'orders' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                        <ShoppingBag className="w-4 h-4" /> Orders
                    </button>
                    <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'customers' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                        <Users className="w-4 h-4" /> Customers
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'inventory' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                        <Package className="w-4 h-4" /> Inventory
                    </button>
                    <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'categories' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                        <LayoutGrid className="w-4 h-4" /> Categories
                    </button>
                    <button onClick={() => setActiveTab('add-product')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'add-product' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                        <PlusCircle className="w-4 h-4" /> Add Product
                    </button>
                    <button onClick={() => setActiveTab('add-admin')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'add-admin' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                        <UserPlus className="w-4 h-4" /> Team
                    </button>
                </nav>
                <div className="pt-6 border-t border-zinc-200">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 md:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold tracking-tight mb-8">
                        {activeTab === 'orders' && 'Order Management'}
                        {activeTab === 'customers' && 'Customer Directory'}
                        {activeTab === 'inventory' && 'Inventory Management'}
                        {activeTab === 'categories' && 'Category Management'}
                        {activeTab === 'add-product' && 'Add New Product'}
                        {activeTab === 'add-admin' && 'Team Management'}
                    </h1>

                    {/* --- Orders Tab --- */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={orderSearchTerm}
                                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                                        className="w-full bg-white border border-zinc-200 text-sm font-medium rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Filter className="w-4 h-4 text-zinc-400" />
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        className="bg-white border border-zinc-200 text-sm font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black cursor-pointer"
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

                            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-widest text-[10px]">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                        {filteredOrders.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-500 font-medium">No orders found.</td></tr>
                                        ) : (
                                            filteredOrders.map(order => (
                                                <tr key={order.id} className={`hover:bg-zinc-50 transition-colors ${order.status === 'CANCELLED' ? 'opacity-50' : ''}`}>
                                                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order.id}</td>
                                                    <td className="px-6 py-4 font-semibold text-black">{order.customerEmail}</td>
                                                    <td className="px-6 py-4 font-bold text-black">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest
                                                            ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                                    'bg-green-50 text-green-700 border border-green-200'}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => setViewingOrder(order)} className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-colors" title="View Details">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {order.status === 'CANCELLED' ? (
                                                                <span className="text-[10px] text-zinc-400 font-bold uppercase ml-2 border border-zinc-200 px-2 py-1 rounded-md">Cancelled</span>
                                                            ) : (
                                                                <>
                                                                    {order.status === 'PENDING' ? (
                                                                        <button onClick={() => handleMarkPaid(order.id)} className="bg-black text-white px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors shadow-sm">Mark Paid</button>
                                                                    ) : (
                                                                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="bg-white border border-zinc-200 text-black text-xs font-bold uppercase tracking-widest rounded-md py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer">
                                                                            <option value="PAID">PAID</option>
                                                                            <option value="SHIPPED">SHIPPED</option>
                                                                            <option value="DELIVERED">DELIVERED</option>
                                                                        </select>
                                                                    )}
                                                                    <button onClick={() => handleCancelOrder(order.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Cancel Order">
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
                        </div>
                    )}

                    {/* --- Customers Tab --- */}
                    {activeTab === 'customers' && (
                        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4">Customer ID</th>
                                        <th className="px-6 py-4">Email Address</th>
                                        <th className="px-6 py-4">Phone Number</th>
                                        <th className="px-6 py-4 text-center">Total Orders</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                    {customers.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-500 font-medium">No customers found.</td></tr>
                                    ) : (
                                        customers.map(customer => (
                                            <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{customer.id}</td>
                                                <td className="px-6 py-4 font-semibold text-black">{customer.email || '-'}</td>
                                                <td className="px-6 py-4 font-medium text-zinc-600">{customer.phoneNumber || '-'}</td>
                                                <td className="px-6 py-4 text-center font-bold text-black">
                                                    {customer.orders ? customer.orders.length : 0}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {customer.orders && customer.orders.length > 0 ? (
                                                        <button onClick={() => setViewingCustomerOrders(customer)} className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-black px-3 py-1.5 rounded-md transition-colors text-[10px] uppercase tracking-widest font-bold shadow-sm">
                                                            <ListOrdered className="w-3.5 h-3.5" /> View
                                                        </button>
                                                    ) : (
                                                        <span className="text-zinc-400 text-xs font-medium italic pr-2">None</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- Inventory Tab --- */}
                    {activeTab === 'inventory' && (
                        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Product Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Stock</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                    {products.map(product => (
                                        <tr key={product.id} className={`hover:bg-zinc-50 transition-colors ${!product.active ? 'opacity-50 bg-zinc-50/50' : ''}`}>
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{product.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-black truncate max-w-[250px]">{product.name}</div>
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{product.category}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-widest ${product.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                                    {product.active ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input type="number" defaultValue={product.stockQuantity} id={`stock-${product.id}`} className="w-16 bg-white border border-zinc-200 font-semibold text-sm rounded-md p-1.5 text-center focus:outline-none focus:ring-1 focus:ring-black" />
                                                    <button onClick={() => handleStockUpdate(product.id, document.getElementById(`stock-${product.id}`).value)} className="bg-zinc-100 border border-zinc-200 text-black p-1.5 rounded-md hover:bg-black hover:text-white transition-colors" title="Save Stock">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingProduct({
                                                            ...product,
                                                            variants: product.variants?.map(v => ({
                                                                ...v,
                                                                linkedProductId: v.linkedProduct?.id || ''
                                                            })) || [],
                                                            additionalImages: product.additionalImages || []
                                                        })}
                                                        className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors" title="Edit Product"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleToggleVisibility(product.id)} className={`p-1.5 rounded-md transition-colors ${product.active ? 'text-zinc-400 hover:bg-red-50 hover:text-red-600' : 'text-zinc-400 hover:bg-green-50 hover:text-green-600'}`} title={product.active ? "Hide Product" : "Show Product"}>
                                                        {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- Categories Management Tab --- */}
                    {activeTab === 'categories' && (
                        <div className="max-w-4xl space-y-8">
                            <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6 border-b border-zinc-100 pb-4">Current Categories</h2>
                                {categories.length === 0 ? (
                                    <p className="text-sm font-medium text-zinc-500">No categories found.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {categories.map((cat) => (
                                            <li key={cat.id} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-lg group hover:bg-white transition-colors">
                                                <div className="flex items-center gap-4">
                                                    {cat.imageUrl ? (
                                                        <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-md object-cover border border-zinc-200" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500">IMG</div>
                                                    )}
                                                    <div>
                                                        <span className="font-bold text-sm text-black block">{cat.name}</span>
                                                        <span className="text-xs text-zinc-500 line-clamp-1">{cat.description || 'No description'}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Category">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <form onSubmit={handleAddCategory} className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6 border-b border-zinc-100 pb-4">Create New Category</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Category Name *</label>
                                        <input required type="text" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Image URL</label>
                                        <input type="text" value={newCategory.imageUrl} onChange={e => setNewCategory({...newCategory, imageUrl: e.target.value})} placeholder="https://..." className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Description</label>
                                        <textarea rows="2" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black resize-none"></textarea>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-zinc-100">
                                    <button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-md transition-colors text-xs uppercase tracking-widest shadow-sm">
                                        Save Category
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- Add Product Form --- */}
                    {activeTab === 'add-product' && (
                        <div className="max-w-3xl">
                            <form onSubmit={handleAddProduct} className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6 border-b border-zinc-100 pb-4">Product Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Product Name *</label>
                                        <input required type="text" name="name" value={newProduct.name} onChange={handleProductInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Brand</label>
                                        <input type="text" name="brand" value={newProduct.brand} onChange={handleProductInputChange} placeholder="e.g. ResMed, Philips" className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Description *</label>
                                        <textarea required name="description" value={newProduct.description} onChange={handleProductInputChange} rows="3" className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Base Price (₹) *</label>
                                        <input required type="number" step="0.01" name="price" value={newProduct.price} onChange={handleProductInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Old Price (₹)</label>
                                        <input type="number" step="0.01" name="oldPrice" value={newProduct.oldPrice} onChange={handleProductInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Base Stock *</label>
                                        <input required type="number" name="stockQuantity" value={newProduct.stockQuantity} onChange={handleProductInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Category *</label>
                                        <select required name="category" value={newProduct.category} onChange={handleProductInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none">
                                            <option value="" disabled>Select category...</option>
                                            {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Main Image URL</label>
                                        <input type="text" name="imageUrl" value={newProduct.imageUrl} onChange={handleProductInputChange} placeholder="https://..." className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>

                                    {/* DYNAMIC ADDITIONAL IMAGES */}
                                    <div className="md:col-span-2 border-t border-zinc-100 pt-6 mt-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-black">Additional Images</h3>
                                            <button type="button" onClick={() => handleAddArrayItem(false, 'additionalImages', { imageUrl: '' })} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                                <PlusCircle className="w-3.5 h-3.5" /> Add Image
                                            </button>
                                        </div>
                                        {newProduct.additionalImages?.map((img, idx) => (
                                            <div key={idx} className="flex items-center gap-3 mb-3">
                                                <input type="text" required value={img.imageUrl || ''} onChange={(e) => handleArrayItemChange(false, 'additionalImages', idx, 'imageUrl', e.target.value)} placeholder="Image URL..." className="flex-1 bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                                <button type="button" onClick={() => handleRemoveArrayItem(false, 'additionalImages', idx)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* DYNAMIC RELATIONAL VARIANTS */}
                                    <div className="md:col-span-2 border-t border-zinc-100 pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-black">Linked Variants</h3>
                                            <button type="button" onClick={() => handleAddArrayItem(false, 'variants', { linkedProductId: '', variantLabel: '', priceOverride: '' })} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                                <PlusCircle className="w-3.5 h-3.5" /> Add Variant
                                            </button>
                                        </div>
                                        {newProduct.variants?.map((v, idx) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200 items-end">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Link to Existing Product *</label>
                                                    <select
                                                        required
                                                        value={v.linkedProductId}
                                                        onChange={(e) => handleArrayItemChange(false, 'variants', idx, 'linkedProductId', e.target.value)}
                                                        className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none"
                                                    >
                                                        <option value="" disabled>Select standalone product...</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>ID: {p.id} - {p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Display Label *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={v.variantLabel}
                                                        onChange={(e) => handleArrayItemChange(false, 'variants', idx, 'variantLabel', e.target.value)}
                                                        placeholder="e.g. Add Medium Mask"
                                                        className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Bundle Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={v.priceOverride || ''}
                                                            onChange={(e) => handleArrayItemChange(false, 'variants', idx, 'priceOverride', e.target.value ? parseFloat(e.target.value) : null)}
                                                            placeholder="Optional"
                                                            className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveArrayItem(false, 'variants', idx)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-colors mb-0.5">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-zinc-100">
                                    <button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-md transition-colors text-xs uppercase tracking-widest shadow-sm">
                                        Save Product to Database
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- Team Management Tab --- */}
                    {activeTab === 'add-admin' && (
                        <div className="max-w-2xl space-y-8">
                            <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6 border-b border-zinc-100 pb-4">Current Administrators</h2>
                                {admins.length === 0 ? (
                                    <p className="text-sm font-medium text-zinc-500">No administrators found.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {admins.map((admin) => (
                                            <li key={admin.id} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-3.5 rounded-lg group hover:bg-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
                                                        {admin.username.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm text-black">{admin.username}</span>
                                                    <span className="text-[9px] font-bold text-green-700 bg-green-100 border border-green-200 uppercase tracking-widest px-2 py-0.5 rounded-sm">Active</span>
                                                </div>
                                                <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Revoke Access">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <form onSubmit={handleAddAdmin} className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6 border-b border-zinc-100 pb-4">Register New Admin</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Username *</label>
                                        <input required type="text" name="username" value={newAdmin.username} onChange={handleAdminInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Password *</label>
                                        <input required type="password" name="password" value={newAdmin.password} onChange={handleAdminInputChange} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-zinc-100">
                                    <button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-md transition-colors text-xs uppercase tracking-widest shadow-sm">
                                        Grant Admin Access
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            {/* CUSTOMER'S ORDERS LIST MODAL */}
            {viewingCustomerOrders && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-black">Customer Orders</h2>
                                <p className="text-xs font-medium text-zinc-500 mt-0.5">
                                    {viewingCustomerOrders.email || viewingCustomerOrders.phoneNumber}
                                </p>
                            </div>
                            <button onClick={() => setViewingCustomerOrders(null)} className="text-zinc-400 hover:text-black hover:bg-zinc-100 p-1.5 rounded-md transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {viewingCustomerOrders.orders && viewingCustomerOrders.orders.length > 0 ? (
                                <div className="space-y-3">
                                    {viewingCustomerOrders.orders.map(order => (
                                        <div key={order.id} className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black transition-colors shadow-sm">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs font-bold text-zinc-500">#{order.id}</span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-widest border
                                                        ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-green-50 text-green-700 border-green-200'}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium text-zinc-500">Total Items: <span className="font-bold text-black">{order.items ? order.items.length : 0}</span></span>
                                            </div>

                                            <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                                                <span className="font-black text-black text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                                <button
                                                    onClick={() => setViewingOrder(order)}
                                                    className="bg-white border border-zinc-200 text-black hover:bg-zinc-50 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-zinc-500 font-medium text-sm">No orders found for this customer.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Order Modal Overlay */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                    <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-black text-black">Order #{viewingOrder.id}</h2>
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-widest border
                                    ${viewingOrder.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    viewingOrder.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                        viewingOrder.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-green-50 text-green-700 border-green-200'}`}
                                >
                                    {viewingOrder.status}
                                </span>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="text-zinc-400 hover:text-black hover:bg-zinc-100 p-1.5 rounded-md transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-100 pb-2">Delivery Details</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                        <span className="text-zinc-500 font-medium">Contact:</span>
                                        <span className="sm:col-span-2 text-black font-bold break-all">{viewingOrder.customerEmail}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                        <span className="text-zinc-500 font-medium">Shipping Address:</span>
                                        <div className="sm:col-span-2 text-black font-medium leading-relaxed whitespace-pre-wrap break-words bg-zinc-50 p-3 rounded-md border border-zinc-100">
                                            {viewingOrder.shippingAddress || 'No address provided'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-100 pb-2">Order Items</h3>
                                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                                    <ul className="divide-y divide-zinc-100">
                                        {viewingOrder.items.map((item, idx) => (
                                            <li key={idx} className="py-3 flex justify-between items-start">
                                                <div className="flex flex-col pr-4">
                                                    <span className="text-black font-bold text-sm mb-1">{item.product?.name || 'Unknown Product'}</span>
                                                    {item.productVariant && (
                                                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 bg-zinc-100 inline-block px-1.5 py-0.5 rounded-sm w-fit border border-zinc-200">
                                                            {item.productVariant.variantLabel}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-medium text-zinc-500 mt-1">
                                                        {item.quantity} × ₹{item.priceAtPurchase?.toLocaleString('en-IN') || item.price?.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <span className="text-black font-black text-sm shrink-0 mt-1">
                                                    ₹{(item.quantity * (item.priceAtPurchase || item.price || 0)).toLocaleString('en-IN')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-zinc-500 text-sm py-2 font-medium">No items found for this order.</p>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center shrink-0">
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Total Paid</span>
                            <span className="text-xl font-black text-black">₹{viewingOrder.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal Overlay */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-zinc-200 rounded-xl p-0 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                            <h2 className="text-lg font-black text-black">Edit Product</h2>
                            <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-black hover:bg-zinc-200 p-1.5 rounded-md transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="edit-product-form" onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Product Name</label>
                                    <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Brand</label>
                                    <input type="text" value={editingProduct.brand || ''} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Description</label>
                                    <textarea required rows="3" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Base Price (₹)</label>
                                    <input required type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Old Price (₹)</label>
                                    <input type="number" step="0.01" value={editingProduct.oldPrice || ''} onChange={e => setEditingProduct({...editingProduct, oldPrice: parseFloat(e.target.value)})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Base Stock</label>
                                    <input required type="number" value={editingProduct.stockQuantity} onChange={e => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value)})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Category</label>
                                    <select required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer">
                                        <option value="" disabled>Select category...</option>
                                        {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Main Image URL</label>
                                    <input type="text" value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} placeholder="https://..." className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                </div>

                                {/* DYNAMIC ADDITIONAL IMAGES (EDIT) */}
                                <div className="md:col-span-2 border-t border-zinc-100 pt-6 mt-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-black">Additional Images</h3>
                                        <button type="button" onClick={() => handleAddArrayItem(true, 'additionalImages', { imageUrl: '' })} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                            <PlusCircle className="w-3.5 h-3.5" /> Add Image
                                        </button>
                                    </div>
                                    {editingProduct.additionalImages?.map((img, idx) => (
                                        <div key={idx} className="flex items-center gap-3 mb-3">
                                            <input type="text" required value={img.imageUrl || ''} onChange={(e) => handleArrayItemChange(true, 'additionalImages', idx, 'imageUrl', e.target.value)} placeholder="Image URL..." className="flex-1 bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black" />
                                            <button type="button" onClick={() => handleRemoveArrayItem(true, 'additionalImages', idx)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>

                                {/* DYNAMIC RELATIONAL VARIANTS (EDIT) */}
                                <div className="md:col-span-2 border-t border-zinc-100 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-black">Linked Variants</h3>
                                        <button type="button" onClick={() => handleAddArrayItem(true, 'variants', { linkedProductId: '', variantLabel: '', priceOverride: '' })} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                            <PlusCircle className="w-3.5 h-3.5" /> Add Variant
                                        </button>
                                    </div>
                                    {editingProduct.variants?.map((v, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200 items-end">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Link to Existing Product *</label>
                                                <select
                                                    required
                                                    value={v.linkedProductId}
                                                    onChange={(e) => handleArrayItemChange(true, 'variants', idx, 'linkedProductId', e.target.value)}
                                                    className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none"
                                                >
                                                    <option value="" disabled>Select standalone product...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>ID: {p.id} - {p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Display Label *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={v.variantLabel}
                                                    onChange={(e) => handleArrayItemChange(true, 'variants', idx, 'variantLabel', e.target.value)}
                                                    placeholder="e.g. Add Medium Mask"
                                                    className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Bundle Price (₹)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={v.priceOverride || ''}
                                                        onChange={(e) => handleArrayItemChange(true, 'variants', idx, 'priceOverride', e.target.value ? parseFloat(e.target.value) : null)}
                                                        placeholder="Optional"
                                                        className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
                                                    />
                                                </div>
                                                <button type="button" onClick={() => handleRemoveArrayItem(true, 'variants', idx)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-colors mb-0.5">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex gap-3 shrink-0">
                            <button type="submit" form="edit-product-form" className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-md transition-colors text-[10px] uppercase tracking-widest shadow-sm">
                                Save Changes
                            </button>
                            <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-100 text-black font-bold py-3.5 rounded-md transition-colors text-[10px] uppercase tracking-widest shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}