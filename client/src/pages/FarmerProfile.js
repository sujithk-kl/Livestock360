import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import farmerService from '../services/farmerService';
import { toast } from 'react-toastify';
import { UserCircleIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'; // Added icons

const FarmerProfile = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
    const [loading, setLoading] = useState(true);

    // Profile State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: { street: '', city: '', state: '', pincode: '' },
        farmName: '',
        farmAddress: '',
        farmSize: '',
        farmType: '',
        yearsOfFarming: ''
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
            const response = await farmerService.getMyProfile();
            if (response.success) {
                setFormData({
                    ...response.data.user,
                    address: response.data.user.address || { street: '', city: '', state: '', pincode: '' }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(t('loading_error') || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                farmName: formData.farmName,
                farmAddress: formData.farmAddress,
                farmSize: formData.farmSize,
                farmType: formData.farmType,
                yearsOfFarming: formData.yearsOfFarming
            };
            await farmerService.updateProfile(updateData);
            toast.success(t('profile_updated_msg'));
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || t('update_error') || 'Failed to update profile');
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
            await farmerService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success(t('password_changed_msg'));
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Failed to change password');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/farmer/dashboard')}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow hover:text-green-600 dark:hover:text-green-400 transition-all"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('account_settings_title')}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile and security preferences</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-8">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <span className="font-bold text-lg">{formData.name ? formData.name.charAt(0).toUpperCase() : 'F'}</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{formData.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{formData.email || 'Farmer Account'}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile'
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <UserCircleIcon className="w-5 h-5" />
                                    {t('tab_profile')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'security'
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    {t('tab_security')}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-8 animate-fade-in-up">
                                    {/* Personal Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                            {t('personal_details_title')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name_label')}</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_label')}</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                            {t('address_title')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('street_label')}</label>
                                                <input
                                                    type="text"
                                                    name="address.street"
                                                    value={formData.address?.street || ''}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city_label')}</label>
                                                <input
                                                    type="text"
                                                    name="address.city"
                                                    value={formData.address?.city || ''}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('state_label')}</label>
                                                <input
                                                    type="text"
                                                    name="address.state"
                                                    value={formData.address?.state || ''}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pincode_label')}</label>
                                                <input
                                                    type="text"
                                                    name="address.pincode"
                                                    value={formData.address?.pincode || ''}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Farm Details */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                            {t('farm_details_title')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_name_label')}</label>
                                                <input
                                                    type="text"
                                                    name="farmName"
                                                    value={formData.farmName}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_type_label')}</label>
                                                <select
                                                    name="farmType"
                                                    value={formData.farmType}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                >
                                                    <option value="Dairy">{t('farm_type_dairy') || 'Dairy'}</option>
                                                    <option value="Livestock">{t('farm_type_livestock') || 'Livestock'}</option>
                                                    <option value="Both">{t('farm_type_both') || 'Both'}</option>
                                                    <option value="Other">{t('role_other') || 'Other'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_size_label') || 'Farm Size (acres)'}</label>
                                                <input
                                                    type="number"
                                                    name="farmSize"
                                                    value={formData.farmSize}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Years of Farming') || 'Years of Farming'}</label>
                                                <input
                                                    type="number"
                                                    name="yearsOfFarming"
                                                    value={formData.yearsOfFarming}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_address_label')}</label>
                                                <textarea
                                                    name="farmAddress"
                                                    value={formData.farmAddress}
                                                    onChange={handleProfileChange}
                                                    rows="2"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all"
                                        >
                                            {t('save_changes_btn')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handlePasswordSubmit} className="max-w-lg space-y-6 animate-fade-in-up">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('change_password_title')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Ensure your account is secure by using a strong password.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('current_password_label')}</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
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
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_new_password_label')}</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength="6"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all"
                                        >
                                            {t('update_password_btn')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerProfile;
