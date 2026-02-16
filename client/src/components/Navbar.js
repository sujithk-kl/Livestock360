import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                                {t('welcome_title')}<span className="text-primary-600">360</span>
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {t(`nav_${link.name.toLowerCase()}`)}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-4 ml-4">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-400 hover:text-primary-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {t(`nav_${link.name.toLowerCase()}`)}
                        </Link>
                    ))}
                    <div className="flex items-center space-x-4 px-3 py-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
