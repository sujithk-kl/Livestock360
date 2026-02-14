import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import authBg from '../assets/modern_farm_hero.png';

const CustomerForgotPassword = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/customers/forgot-password', { email });
            setSuccess(response.data.message || 'Password reset email sent successfully. Please check your inbox.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex font-sans">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${authBg})` }}
                ></div>
                <div className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
                    <div onClick={() => navigate('/customer/login')} className="cursor-pointer flex items-center gap-2 w-fit">
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Back to Login</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-4">Reset Your Password</h1>
                        <p className="text-lg text-secondary-100 max-w-md leading-relaxed">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>
                    <div className="text-sm text-secondary-200">
                        &copy; {new Date().getFullYear()} Livestock360
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="lg:hidden mb-8" onClick={() => navigate('/customer/login')}>
                        <span className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" /> Back to Login
                        </span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
                            Forgot Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember your password?{' '}
                            <Link to="/customer/login" className="font-medium text-secondary-600 hover:text-secondary-500 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        {error && (
                            <div className="rounded-xl p-4 mb-6 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm font-medium">{error}</div>
                            </div>
                        )}

                        {success && (
                            <div className="rounded-xl p-4 mb-6 flex items-start gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm font-medium">{success}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerForgotPassword;
