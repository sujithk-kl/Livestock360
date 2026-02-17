import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import api from '../services/api';

const CustomerCheckout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const paymentMethod = 'Online'; // Fixed to Online
    const { total } = location.state || { total: '0.00' };

    // Generate UPI string
    const upiString = `upi://pay?pa=livestock360@upi&pn=Livestock360&am=${total}&cu=INR`;

    const handlePaymentConfirmation = async () => {
        try {
            // Prepare order data
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');

            if (!user || !token) {
                toast.error(t('login_required_msg'));
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
                paymentStatus: 'Success', // Always Success for Online
                paymentMethod: paymentMethod
            };

            // Send to backend
            const response = await api.post('/orders', orderData);

            const data = response.data;

            if (data.success) {
                setStatus('success');
                localStorage.removeItem('cartItems');
                toast.success(t('payment_success_title'));
                setTimeout(() => {
                    navigate('/customer/orders');
                }, 2000);
            } else {
                toast.error(data.message || t('payment_failed_msg'));
            }
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error(t('payment_error_msg'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">

                {status === 'processing' ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('checkout_title')}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{t('paying_to_label')} <span className="font-semibold text-gray-900 dark:text-white">Livestock360</span></p>
                            <p className="text-sm text-gray-400 mt-1">{t('payment_instruction')}</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg inline-block mb-6 border border-gray-200">
                            <QRCodeSVG value={upiString} size={192} />
                        </div>

                        <p className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {t('scan_pay_label')} ₹{total}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handlePaymentConfirmation}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                            >
                                {t('confirm_payment_btn')}
                            </button>
                            <button
                                onClick={() => navigate('/customer/cart')}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                            >
                                {t('cancel_payment_btn')}
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-gray-500 animate-pulse">
                            {t('processing_payment_msg')}
                        </p>

                    </>
                ) : (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('payment_success_title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('order_placed_msg')}</p>
                        <p className="text-sm text-gray-400">{t('redirecting_msg')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerCheckout;
