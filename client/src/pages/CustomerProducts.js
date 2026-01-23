import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Assets
import milkImg from '../assets/Milk.jpg';
import curdImg from '../assets/curd.jpeg';
import butterImg from '../assets/butter.jpg';
import gheeImg from '../assets/Ghee.jpg';
import eggImg from '../assets/Egg.jpg';
import chickenImg from '../assets/chicken.jpg';
import countryChickenImg from '../assets/country chicken.jpg';
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
        { name: 'Eggs', img: eggImg },
        { name: 'Chicken', img: chickenImg },
        { name: 'Country Chicken', img: countryChickenImg },
        // { name: 'Meat', img: chickenImg }, // Hidden for now if redundant or use placeholder
    ];

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                {/* Header Section */}
                <div className="flex flex-col space-y-6 mb-6">
                    {/* Top Bar: Title and User Greeting */}
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <h1 className="text-3xl font-bold text-green-600">Livestock360</h1>
                        <span className="text-xl font-medium text-gray-700">
                            Hello, <span className="text-green-600 font-bold">{userName}</span>
                        </span>
                    </div>

                    {/* Toolbar: Search and Actions */}
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        {/* Search Bar */}
                        <div className="w-full lg:w-1/3">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                            <button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition duration-200 text-sm sm:text-base">
                                My Cart
                            </button>
                            <button className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition duration-200 text-sm sm:text-base">
                                Recipes
                            </button>
                            <button className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition duration-200 text-sm sm:text-base">
                                Order History
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition duration-200 text-sm sm:text-base"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Browse Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                                <div
                                    key={cat.name}
                                    onClick={() => navigate(`/customer/products/${cat.name}`)}
                                    className="cursor-pointer group bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-200 overflow-hidden"
                                >
                                    <div className="h-40 w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={cat.img}
                                            alt={cat.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 text-center">{cat.name}</h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center text-gray-500 text-lg">
                                No categories found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CustomerProducts;
