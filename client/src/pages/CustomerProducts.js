import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Assets
import milkImg from '../assets/Milk.jpg';
import curdImg from '../assets/curd.jpeg';
import butterImg from '../assets/butter.jpg';
import gheeImg from '../assets/Ghee.jpg';
import eggImg from '../assets/Egg.jpg';
import chickenImg from '../assets/chicken.jpg';
import countryChickenImg from '../assets/country chicken.jpg';
// Fallback or generic image could be one of the above or a placeholder
import defaultImg from '../assets/Milk.jpg';

const CustomerProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
    });

    const categories = [
        'Milk', 'Curd', 'Butter', 'Ghee', 'Eggs', 'Chicken', 'Country Chicken', 'Meat', 'Other Farm Products'
    ];

    // Map categories to images
    const getProductImage = (category) => {
        switch (category) {
            case 'Milk': return milkImg;
            case 'Curd': return curdImg;
            case 'Butter': return butterImg;
            case 'Ghee': return gheeImg;
            case 'Eggs': return eggImg;
            case 'Chicken': return chickenImg;
            case 'Country Chicken': return countryChickenImg;
            case 'Meat': return chickenImg; // Fallback to chicken if specific meat img is missing, or use default
            default: return defaultImg; // Use a default image for others
        }
    };

    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Get user from local storage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // Handle different potential structures of user object
                setUserName(user.name || user.firstName || 'Customer');
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
        fetchProducts();
    }, [filters.category]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const activeFilters = {};
            if (filters.category) activeFilters.category = filters.category;

            const data = await productService.getAll(activeFilters);
            if (data.success) {
                let displayedProducts = data.data;
                setProducts(displayedProducts);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };



    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <ToastContainer position="bottom-right" />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold text-green-600">Livestock360</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-xl font-medium text-gray-700">Hello, <span className="text-green-600 font-bold">{userName}</span></span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200 text-sm flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>


                {/* Filters Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-green-500 transition duration-200"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            {/* Disabled Location Filter */}
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Location</label>
                            <input type="text" disabled placeholder="Coming Soon" className="appearance-none block w-full bg-gray-100 text-gray-400 border border-gray-200 rounded py-3 px-4 leading-tight cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-2 text-gray-500">Adjust your filters to see more results.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map(product => (
                            <div key={product._id} className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
                                {/* Image Container */}
                                <div className="relative h-56 overflow-hidden bg-gray-200">
                                    <img
                                        src={getProductImage(product.category)}
                                        alt={product.productName}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Category Badge */}
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                        {product.category}
                                    </span>
                                    {/* Quality Tag */}
                                    {product.qualityTag && (
                                        <span className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm shadow-black/10 
                                            ${product.qualityTag === 'Organic' ? 'bg-green-500' :
                                                product.qualityTag === 'Fresh' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                                            {product.qualityTag}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors duration-200">
                                            {product.productName}
                                        </h3>
                                    </div>

                                    {/* Farmer Info */}
                                    <div className="flex items-center mt-2 mb-4">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <p className="ml-2 text-sm text-gray-500 font-medium">
                                            {product.farmer && product.farmer.name ? product.farmer.name : 'Local Farmer'}
                                        </p>
                                    </div>

                                    {product.farmer && product.farmer.address && (
                                        <div className="flex items-center mb-4 pl-8 -mt-3">
                                            <svg className="h-3 w-3 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-xs text-gray-400 truncate">
                                                {product.farmer.address.city}, {product.farmer.address.state}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-auto">
                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Price</p>
                                                <div className="flex items-baseline">
                                                    <span className="text-2xl font-extrabold text-gray-900">₹{product.price}</span>
                                                    <span className="ml-1 text-sm text-gray-500 font-medium">/ {product.unit}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 mb-1">Stock</p>
                                                <p className={`text-sm font-bold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {product.quantity > 0 ? `${product.quantity} ${product.unit}` : 'Out of Stock'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            disabled={product.quantity <= 0}
                                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 hover:shadow-lg focus:ring-4 focus:ring-green-200 focus:outline-none transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            {product.quantity > 0 ? 'Add to Cart' : 'Sold Out'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerProducts;
