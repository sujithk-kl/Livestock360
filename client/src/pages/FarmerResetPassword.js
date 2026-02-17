import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import authBg from '../assets/modern_farm_hero.png';

const FarmerResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = useParams();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError(t('passwords_do_not_match'));
            return;
        }

        if (formData.newPassword.length < 6) {
            setError(t('password_min_length_msg'));
            return;
        }

        setLoading(true);

        try {
            const response = await api.put(`/farmers/reset-password/${token}`, {
                newPassword: formData.newPassword
            });
            setSuccess(response.data.message || t('password_reset_success_redirect'));

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/farmer/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || t('password_reset_failed'));
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
                <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
                    <div onClick={() => navigate('/farmer/login')} className="cursor-pointer flex items-center gap-2 w-fit">
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('back_to_login')}</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-4">{t('create_new_password_title')}</h1>
                        <p className="text-lg text-primary-100 max-w-md leading-relaxed">
                            {t('create_new_password_desc')}
                        </p>
                    </div>
                    <div className="text-sm text-primary-200">
                        &copy; {new Date().getFullYear()} Livestock360
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="lg:hidden mb-8" onClick={() => navigate('/farmer/login')}>
                        <span className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" /> {t('back_to_login')}
                        </span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
                            {t('reset_password_title')}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {t('enter_new_password_desc')}
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
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('new_password_label')}
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition pr-10"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('confirm_new_password_label')}
                                </label>
                                <div className="mt-2 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition pr-10"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        t('reset_password_btn')
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

export default FarmerResetPassword;
