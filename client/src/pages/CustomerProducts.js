import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        priceMax: '',
        // location: '' // Future scope as per metadata
    });

    const categories = [
        'Milk', 'Curd', 'Butter', 'Ghee', 'Eggs', 'Chicken', 'Meat', 'Other Farm Products'
    ];

    useEffect(() => {
        fetchProducts();
    }, [filters.category]); // Re-fetch when category changes

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Construct filters
            const activeFilters = {};
            if (filters.category) activeFilters.category = filters.category;

            const data = await productService.getAll(activeFilters);
            if (data.success) {
                let displayedProducts = data.data;
                // Client-side filtering for price if API doesn't support range
                // (Though controller supports it if passed correctly, let's keep it simple for now or assume controller handles basic match)
                // If priceMax provided, filter locally for quick interaction
                if (filters.priceMax) {
                    displayedProducts = displayedProducts.filter(p => p.price <= Number(filters.priceMax));
                }
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

    const clearFilters = () => {
        setFilters({ category: '', priceMax: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Fresh Farm Products
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Buy fresh, organic, and locally sourced products directly from farmers near you.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                            <input
                                type="number"
                                name="priceMax"
                                value={filters.priceMax}
                                onChange={handleFilterChange}
                                placeholder="Any Price"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                            />
                        </div>
                        <div className="md:col-span-1">
                            {/* Placeholder for Location Filter */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input type="text" disabled placeholder="Coming Soon" className="w-full bg-gray-100 text-gray-500 border-gray-300 rounded-md shadow-sm p-2 border cursor-not-allowed" />
                        </div>
                        <div className="md:col-span-1">
                            <button
                                onClick={clearFilters}
                                className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold py-2 px-4 rounded transition duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="spinner-border text-green-500" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2 text-gray-500">Finding fresh products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                                <div className="h-40 bg-green-50 flex items-center justify-center relative">
                                    <span className="text-6xl">
                                        {/* Simple icon mapping based on category */}
                                        {product.category === 'Milk' && '🥛'}
                                        {product.category === 'Curd' && '🥣'}
                                        {product.category === 'Butter' && '🧈'}
                                        {product.category === 'Ghee' && '🍯'}
                                        {product.category === 'Eggs' && '🥚'}
                                        {product.category === 'Chicken' && '🐔'}
                                        {product.category === 'Meat' && '🥩'}
                                        {product.category === 'Other Farm Products' && '🧺'}
                                        {!['Milk', 'Curd', 'Butter', 'Ghee', 'Eggs', 'Chicken', 'Meat', 'Other Farm Products'].includes(product.category) && '📦'}
                                    </span>
                                    {product.qualityTag && (
                                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                                            {product.qualityTag}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-green-600 font-semibold tracking-wide uppercase">{product.category}</p>
                                            <h3 className="mt-1 text-lg font-bold text-gray-900 truncate" title={product.productName}>
                                                {product.productName}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="text-xl font-bold text-gray-900">₹{product.price} <span className="text-xs font-normal text-gray-500">/ {product.unit}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Available</p>
                                            <p className={`text-md font-semibold ${product.quantity > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                                {product.quantity} {product.unit}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t pt-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {product.farmer ? `${product.farmer.firstName} ${product.farmer.lastName}` : 'Unknown Farmer'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate w-32">
                                                    {product.farmer ? `${product.farmer.city}, ${product.farmer.district}` : 'Location hidden'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-200 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Buy Now
                                    </button>
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
