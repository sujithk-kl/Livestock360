import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentQr from '../assets/image.png';
import { toast } from 'react-toastify';

const CustomerCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const { total } = location.state || { total: '0.00' };

    const handlePaymentConfirmation = async () => {
        try {
            // Prepare order data
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            if (!user || !token) {
                toast.error('Please login to complete payment');
                navigate('/customer/login');
                return;
            }

            const orderData = {
                items: cartItems.map(item => ({
                    product: item.id, // Assuming id is product ID
                    productName: item.name,
                    category: item.category, // Pass category for image mapping
                    farmer: item.farmerId, // Need to ensure farmerId is in cart item
                    farmerName: item.farmerName,
                    quantity: item.quantity,
                    unit: item.unit,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                totalAmount: total,
                paymentStatus: 'Success'
            };

            // Send to backend
            const response = await fetch('http://localhost:4000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                localStorage.removeItem('cartItems');
                toast.success('Payment Successful!');
                setTimeout(() => {
                    navigate('/customer/orders');
                }, 2000);
            } else {
                toast.error(data.message || 'Payment failed to record');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error('Error processing payment record');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">

                {status === 'processing' ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
                            <p className="text-gray-500 dark:text-gray-400">Paying to <span className="font-semibold text-gray-900 dark:text-white">Livestock360</span></p>
                            <p className="text-sm text-gray-400 mt-1">Thank you for your purchase! Please complete the payment.</p>
                        </div>

                        <div className="bg-white p-2 rounded-lg inline-block mb-6 border border-gray-200">
                            <img src={paymentQr} alt="Payment QR Code" className="w-48 h-48 object-contain" />
                        </div>

                        <p className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Scan to Pay ₹{total}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handlePaymentConfirmation}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                            >
                                Yes, I Have Paid
                            </button>
                            <button
                                onClick={() => navigate('/customer/cart')}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                            >
                                No, Take Me Back
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-gray-500 animate-pulse">
                            Processing payment, please wait...
                        </p>

                    </>
                ) : (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Your order has been placed successfully.</p>
                        <p className="text-sm text-gray-400">Redirecting to products...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerCheckout;
