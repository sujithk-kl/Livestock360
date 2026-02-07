import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import customerService from '../services/customerService';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
    const [loading, setLoading] = useState(true);

    // Profile State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        preferences: {
            preferredProducts: [],
            budgetRange: { min: 0, max: 0 },
            notifications: { email: true, sms: false }
        },
        address: { city: '' }
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await customerService.getMyProfile();
            if (response.success) {
                setFormData(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(t('profile_update_failed_msg'));
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Simplified profile update for customers for now - detailed preference editing can be added if requested
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await customerService.updateProfile({
                name: formData.name,
                address: formData.address
            });

            if (response.success && response.data && response.data.user) {
                // Update local storage with new user data
                // Merge with existing to keep token if it's there, though token is usually separate
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...existingUser, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                localStorage.setItem('user', JSON.stringify(updatedUser));

                toast.success(t('profile_updated_msg'));
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || t('profile_update_failed_msg'));
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('password_mismatch_msg'));
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error(t('password_min_length_msg'));
            return;
        }

        try {
            await customerService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success(t('password_changed_msg'));
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || t('password_change_failed_msg'));
        }
    };

    if (loading) return <div className="p-8 text-center dark:text-white">{t('loading_profile')}</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/customer/products')}
                    className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    {t('back_products_btn')}
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('account_settings_title')}</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-2 px-4 font-medium transition-colors ${activeTab === 'profile'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        {t('edit_profile_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`py-2 px-4 font-medium transition-colors ${activeTab === 'security'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        {t('security_tab')}
                    </button>
                </div>

                {/* Profile Content */}
                {activeTab === 'profile' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <form onSubmit={handleProfileSubmit}>
                            <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-6">

                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('personal_details_title')}</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name_label')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_label')}</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleProfileChange}
                                        readOnly
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        title="Phone number cannot be changed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city_label')}</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address?.city || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder={t('city_placeholder')}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_label')}</label>
                                    <input
                                        type="text"
                                        value={formData.email}
                                        readOnly
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>

                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                                >
                                    {t('save_changes_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Content */}
                {activeTab === 'security' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('change_password_title')}</h3>
                        <form onSubmit={handlePasswordSubmit} className="max-w-md">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('current_password_label')}</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('new_password_label')}</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password_label')}</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                                >
                                    {t('update_password_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerProfile;
