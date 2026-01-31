import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import farmerService from '../services/farmerService';
import { toast } from 'react-toastify';

const FarmerProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
    const [loading, setLoading] = useState(true);

    // Profile State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        farmName: '',
        farmAddress: '',
        farmSize: '',
        farmType: '',
        yearsOfFarming: '',
        // Bank details (if available to edit, keeping it read-only for now or editable based on requirement)
        // Excluding sensitive fields from basic edit for now to keep it simple unless requested
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
            toast.error('Failed to load profile');
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
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            // Filter out read-only fields and only send potential updates
            const updateData = {
                name: formData.name,
                phone: formData.phone, // Include phone if it's meant to be editable
                address: formData.address,
                farmName: formData.farmName,
                farmAddress: formData.farmAddress,
                farmSize: formData.farmSize,
                farmType: formData.farmType,
                yearsOfFarming: formData.yearsOfFarming
                // Bank details are excluded for now as they are sensitive and not in the form
            };

            await farmerService.updateProfile(updateData);
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
            await farmerService.changePassword({
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
                    onClick={() => navigate('/farmer/dashboard')}
                    className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
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
                                {/* Personal Details */}
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
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-span-2">
                                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mt-2 mb-2">Address</h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address?.street || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address?.city || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address?.state || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        name="address.pincode"
                                        value={formData.address?.pincode || ''}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Farm Details */}
                                <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Farm Details</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Name</label>
                                    <input
                                        type="text"
                                        name="farmName"
                                        value={formData.farmName}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Type</label>
                                    <select
                                        name="farmType"
                                        value={formData.farmType}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="Dairy">Dairy</option>
                                        <option value="Livestock">Livestock</option>
                                        <option value="Both">Both</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Address</label>
                                    <textarea
                                        name="farmAddress"
                                        value={formData.farmAddress}
                                        onChange={handleProfileChange}
                                        rows="2"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

export default FarmerProfile;
