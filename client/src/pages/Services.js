import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Services = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            <Navbar />
            <div className="flex-grow">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 dark:text-white mb-6">Our Services</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Comprehensive solutions tailored for modern farmers and conscious consumers.
                        </p>
                    </div>

                    {/* For Farmers */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-bold font-serif text-primary-700 dark:text-primary-400 mb-10 text-center">For Farmers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Livestock Management',
                                    desc: 'Track health, vaccination schedules, and breeding cycles of your cattle with ease.',
                                    icon: (
                                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Milk Production Tracking',
                                    desc: 'Record daily milk yields, analyze production trends, and optimize output.',
                                    icon: (
                                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Sales & Analytics',
                                    desc: 'Manage product listings, track sales performance, and generate insightful financial reports.',
                                    icon: (
                                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )
                                }
                            ].map((service, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-center group">
                                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 font-serif text-gray-900 dark:text-white">{service.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                        {service.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* For Customers */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-bold font-serif text-secondary-700 dark:text-secondary-400 mb-10 text-center">For Customers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Direct from Farm',
                                    desc: 'Purchase fresh milk, cheese, and other dairy products directly from local farmers.',
                                    icon: (
                                        <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Quality Assurance',
                                    desc: 'Verified source tracking ensures you get only the healthiest and safest products.',
                                    icon: (
                                        <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Easy Ordering',
                                    desc: 'Seamless online ordering experience with secure payments and reliable delivery.',
                                    icon: (
                                        <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                }
                            ].map((service, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-center group">
                                    <div className="w-16 h-16 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-100 dark:group-hover:bg-secondary-900/40 transition-colors">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 font-serif text-gray-900 dark:text-white">{service.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                        {service.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Services;
