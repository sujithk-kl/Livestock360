import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('farmer'); // Or default to farmer, maybe verify token type later if needed
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }

        setLoading(true);

        try {
            // Try farmer first
            let endpoint = `/api/farmers/resetpassword/${resetToken}`;
            let success = false;

            try {
                await axios.put(endpoint, { password });
                success = true;
            } catch (error) {
                // Should handle specific error or try customer
                // This is tricky without knowing the role. Ideally, the role should be passed or we accept distinct routes.
                // For now, let's allow user to select role, OR we assume the link was specific.
                // Our backend: PUT /api/farmers/resetpassword/:resetToken
            }

            // Re-evaluating strategy: Since the user clicks a link, they don't select a role.
            // But the backend route IS specific (/api/farmers/... or /api/customers/...).
            // However, the token is unique.
            // Option 1: Try both endpoints.
            // Option 2: Add role to the email link query param (?role=farmer).
            // Let's implement Option 2 for better UX/Reliability.
            // Updating my plan to check query params.

            // WAIT: I can just put a role selector here too, OR just try both.
            // Let's try explicit implementation first with a role selector or just try both.
            // Trying both is robust.

            if (!success) {
                endpoint = `/api/customers/resetpassword/${resetToken}`;
                await axios.put(endpoint, { password });
            }

            toast.success('Password reset successful! Please login.');
            navigate('/farmer/login'); // Or customer login, generic redirect
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error resetting password');
        } finally {
            setLoading(false);
        }
    };

    // Better approach: Let's assume the link contains the role as a query parameter for simplicity if possible.
    // If NOT, we have to try both endpoints.

    // Let's implement the "Try Both" strategy in the handleSubmit for now, 
    // but a cleaner UI would be to ask the user "Are you a Farmer or Customer?" if we don't know.
    // However, the token is cryptographically secure. 

    // Let's stick to the "Ask Role" approach for resetting? No, that's bad UX.
    // "Try Both" is the best backend-agnostic way without changing the email template too much.

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }

        setLoading(true);
        try {
            // Try Farmer
            await axios.put(`/api/farmers/resetpassword/${resetToken}`, { password })
                .then(() => {
                    toast.success('Password Reset Successfully');
                    navigate('/farmer/login');
                })
                .catch(async () => {
                    // If farmer fails, try Customer
                    await axios.put(`/api/customers/resetpassword/${resetToken}`, { password })
                        .then(() => {
                            toast.success('Password Reset Successfully');
                            navigate('/customer/login');
                        })
                        .catch((err) => {
                            toast.error(err.response?.data?.message || 'Invalid or Expired Token');
                        });
                });
        } catch (error) {
            // General error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Reset Password
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md rounded-lg sm:px-10 transition-colors duration-200">
                    <form className="space-y-6" onSubmit={handleReset}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
