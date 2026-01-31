import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
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
        }
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
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Simplified profile update for customers for now - detailed preference editing can be added if requested
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await customerService.updateProfile({
                name: formData.name,
                // Phone usually shouldn't be changed without verification, but allowing for now if backend permits
            });
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update profile');
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            await customerService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Failed to change password');
        }
    };

    if (loading) return <div className="p-8 text-center dark:text-white">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/customer/products')}
                    className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Products
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-2 px-4 font-medium transition-colors ${activeTab === 'profile'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`py-2 px-4 font-medium transition-colors ${activeTab === 'security'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Security
                    </button>
                </div>

                {/* Profile Content */}
                {activeTab === 'profile' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <form onSubmit={handleProfileSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Details</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleProfileChange}
                                        readOnly
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        title="Phone number cannot be changed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Contact support to update phone number.</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Content */}
                {activeTab === 'security' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="max-w-md">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
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
                                    Update Password
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
