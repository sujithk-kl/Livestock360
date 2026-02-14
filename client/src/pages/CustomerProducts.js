import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBagIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ShoppingCartIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

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

const CustomerProducts = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

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
        { name: 'Milk', key: 'cat_milk', img: milkImg },
        { name: 'Curd', key: 'cat_curd', img: curdImg },
        { name: 'Butter', key: 'cat_butter', img: butterImg },
        { name: 'Ghee', key: 'cat_ghee', img: gheeImg },
        { name: 'Paneer', key: 'cat_paneer', img: paneerImg },
        { name: 'Honey', key: 'cat_honey', img: honeyImg },
        { name: 'Eggs', key: 'cat_eggs', img: eggImg },
        { name: 'Chicken', key: 'cat_chicken', img: chickenImg },
        { name: 'Country Chicken', key: 'cat_country_chicken', img: countryChickenImg },
        { name: 'Mutton', key: 'cat_mutton', img: muttonImg },
    ];

    const filteredCategories = categories.filter(cat =>
        t(cat.key).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
            {/* Navbar */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                                Livestock<span className="text-secondary-500">360</span>
                            </span>
                        </div>

                        {/* Desktop Search & User */}
                        <div className="hidden md:flex items-center space-x-8">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm"
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>

                            <button onClick={() => navigate('/customer/cart')} className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-secondary-600 transition-colors">
                                <ShoppingCartIcon className="w-6 h-6" />
                            </button>

                            <div className="relative">
                                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-secondary-600 transition-colors font-medium">
                                    <UserCircleIcon className="w-6 h-6" />
                                    <span>{userName}</span>
                                </button>
                                {/* Dropdown Menu */}
                                {menuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 border border-gray-100 dark:border-gray-700 z-50 animate-fade-in-down">
                                            <button onClick={() => navigate('/customer/profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                                                <UserCircleIcon className="w-4 h-4 mr-2" /> {t('side_profile')}
                                            </button>
                                            <button onClick={() => navigate('/customer/orders')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                                                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" /> {t('orders_btn')}
                                            </button>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center">
                                                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" /> {t('side_logout')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search & Nav */}
            <div className="md:hidden bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20 shadow-sm">
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all text-sm"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <div className="flex justify-around border-t border-gray-100 dark:border-gray-700 pt-4">
                    <button onClick={() => navigate('/customer/cart')} className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300">
                        <ShoppingCartIcon className="w-6 h-6 mb-1" /> {t('cart_btn')}
                    </button>
                    <button onClick={() => navigate('/customer/orders')} className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300">
                        <ClipboardDocumentListIcon className="w-6 h-6 mb-1" /> {t('orders_btn')}
                    </button>
                    <button onClick={() => navigate('/customer/profile')} className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300">
                        <UserCircleIcon className="w-6 h-6 mb-1" /> {t('side_profile')}
                    </button>
                    <button onClick={handleLogout} className="flex flex-col items-center text-xs text-red-500">
                        <ArrowRightOnRectangleIcon className="w-6 h-6 mb-1" /> {t('side_logout')}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)]">
                {/* Promo/Welcome Banner */}
                <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-3xl p-8 mb-12 text-white shadow-lg relative overflow-hidden transition-all hover:shadow-xl">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">{t('hello_greeting')} {userName},</h1>
                        <p className="text-secondary-100 text-lg">Find the freshest farm products near you.</p>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-8 flex items-center gap-2">
                        <ShoppingBagIcon className="w-7 h-7 text-secondary-500" />
                        {t('browse_categories_title')}
                    </h2>

                    {filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {filteredCategories.map((cat) => (
                                <div
                                    key={cat.name}
                                    onClick={() => navigate(`/customer/products/${cat.name}`)}
                                    className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
                                        <img
                                            src={cat.img}
                                            alt={t(cat.key)}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }} // Fallback
                                        />
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors font-serif">{t(cat.key)}</h3>
                                        <div className="w-0 group-hover:w-12 h-1 bg-secondary-500 rounded-full mx-auto mt-2 transition-all duration-300"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No categories found</h3>
                            <p className="text-gray-500 mt-2">Try searching for something else.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CustomerProducts;
