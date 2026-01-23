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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
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

                {/* Category Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Browse Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {categories.map((cat) => (
                            <div
                                key={cat.name}
                                onClick={() => navigate(`/customer/products/${cat.name}`)}
                                className="cursor-pointer group flex flex-col items-center bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-200 p-4"
                            >
                                <div className="h-32 w-32 mb-4 overflow-hidden rounded-full bg-gray-100">
                                    <img
                                        src={cat.img}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 text-center">{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CustomerProducts;
