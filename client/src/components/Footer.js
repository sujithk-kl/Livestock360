import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-900 text-white font-sans border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-3xl font-bold mb-6 font-serif tracking-tight">
                        {t('welcome_title')}<span className="text-primary-500">360</span>
                    </h2>
                    <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
                        {t('footer_desc')}
                    </p>
                    <div className="flex gap-4">
                        {/* Facebook */}
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center group" aria-label="Facebook">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>
                        {/* Twitter/X */}
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center group" aria-label="Twitter">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 transition-colors cursor-pointer flex items-center justify-center group" aria-label="Instagram">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">{t('footer_quick_links')}</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><Link to="/about" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                            About
                        </Link></li>
                        <li><Link to="/services" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                            Services
                        </Link></li>
                        <li><Link to="/contact" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                            Contact
                        </Link></li>
                        <li><Link to="/privacy-policy" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                            Privacy Policy
                        </Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">{t('footer_contact')}</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li className="flex items-start gap-3">
                            <svg className="h-6 w-6 text-primary-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=cyhawkzy@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">cyhawkzy@gmail.com</a>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="h-6 w-6 text-primary-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <a href="tel:+919361574492" className="hover:text-primary-400 transition-colors">+91 93615 74492</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm pb-8">
                <p>&copy; {new Date().getFullYear()} Livestock360. All rights reserved.</p>
                <p>Designed for Farmers & Customers</p>
            </div>
        </footer>
    );
};

export default Footer;
