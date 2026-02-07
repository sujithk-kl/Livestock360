import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const preselectedRole = location.state?.role;

    const [email, setEmail] = useState('');
    const [role, setRole] = useState(preselectedRole || 'farmer');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = role === 'farmer'
                ? '/api/farmers/forgotpassword'
                : '/api/customers/forgotpassword';

            await axios.post(endpoint, { email });
            setEmailSent(true);
            toast.success('Email sent successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error sending email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Forgot Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Enter your email to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md rounded-lg sm:px-10 transition-colors duration-200">
                    {emailSent ? (
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Sent!</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Check your inbox for a link to reset your password.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to={role === 'farmer' ? '/farmer/login' : '/customer/login'}
                                    className="text-green-600 hover:text-green-500 font-medium"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {preselectedRole ? (
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                    Resetting password for <span className="font-bold text-green-600 capitalize">{preselectedRole}</span> account
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        I am a:
                                    </label>
                                    <div className="mt-2 flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-green-600"
                                                name="role"
                                                value="farmer"
                                                checked={role === 'farmer'}
                                                onChange={() => setRole('farmer')}
                                            />
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Farmer</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-green-600"
                                                name="role"
                                                value="customer"
                                                checked={role === 'customer'}
                                                onChange={() => setRole('customer')}
                                            />
                                            <span className="ml-2 text-gray-700 dark:text-gray-300">Customer</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
