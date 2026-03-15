import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CustomerCheckout is now a fallback page only.
 * The main checkout flow (including delivery method selection and UPI QR)
 * is handled inline inside the Cart modal (3-step flow).
 */
const CustomerCheckout = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Checkout via Cart</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Please complete your order through the cart page.
                </p>
                <button
                    onClick={() => navigate('/customer/cart')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
                >
                    Go to Cart →
                </button>
            </div>
        </div>
    );
};

export default CustomerCheckout;
