import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Assets
import milkImg from '../assets/Milk.jpg';
import curdImg from '../assets/curd.jpeg';
import butterImg from '../assets/butter.jpg';
import gheeImg from '../assets/Ghee.jpg';
import eggImg from '../assets/Egg.jpg';
import paneerImg from '../assets/paneer.jpg';
import honeyImg from '../assets/Honey.jpg';
import chickenImg from '../assets/chicken.jpg';
import countryChickenImg from '../assets/country chicken.jpg';
import muttonImg from '../assets/Mutton.jpg';
import defaultImg from '../assets/Milk.jpg';

const CustomerProducts = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.firstName || 'Customer');
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const categories = [
        { name: 'Milk', img: milkImg },
        { name: 'Curd', img: curdImg },
        { name: 'Butter', img: butterImg },
        { name: 'Ghee', img: gheeImg },
        { name: 'Paneer', img: paneerImg },
        { name: 'Honey', img: honeyImg },
        { name: 'Eggs', img: eggImg },
        { name: 'Chicken', img: chickenImg },
        { name: 'Country Chicken', img: countryChickenImg },
        { name: 'Mutton', img: muttonImg },
        // { name: 'Meat', img: chickenImg }, // Hidden for now if redundant or use placeholder
    ];

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                {/* Header Section */}
                <div className="flex flex-col space-y-6 mb-8">
                    {/* Top Bar: Title and User Greeting */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">Livestock360</h1>
                        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                            <span className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                                Hello, <span className="text-green-600 dark:text-green-400 font-bold">{userName}</span>
                            </span>
                            <button
                                onClick={() => navigate('/customer/profile')}
                                className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Go to Profile"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Toolbar: Search and Actions */}
                    <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                        {/* Search Bar */}
                        <div className="w-full lg:w-1/3 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white transition-all text-sm md:text-base"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:ml-auto">
                            <button
                                onClick={() => navigate('/customer/cart')}
                                className="flex-1 sm:flex-none justify-center items-center flex gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 text-sm md:text-base shadow-sm hover:shadow active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Cart
                            </button>
                            <button
                                onClick={() => navigate('/customer/orders')}
                                className="flex-1 sm:flex-none justify-center items-center flex gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 text-sm md:text-base shadow-sm hover:shadow active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Orders
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 sm:flex-none justify-center items-center flex gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 text-sm md:text-base shadow-sm hover:shadow active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Grid */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">Browse Categories</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                                <div
                                    key={cat.name}
                                    onClick={() => navigate(`/customer/products/${cat.name}`)}
                                    className="cursor-pointer group bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 overflow-hidden transform hover:-translate-y-1"
                                >
                                    <div className="h-32 sm:h-40 w-full overflow-hidden bg-gray-200">
                                        <img
                                            src={cat.img}
                                            alt={cat.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        />
                                    </div>
                                    <div className="p-3 sm:p-4 text-center">
                                        <h3 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 truncate">{cat.name}</h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-4 text text-gray-500 dark:text-gray-400 text-lg">
                                    No categories found matching "{searchQuery}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CustomerProducts;
