import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import api from '../services/api';

const DELIVERY_OPTIONS = [
  {
    id: 'Express',
    label: 'Express',
    icon: '⚡',
    subtitle: 'Fastest delivery, directly to you!',
    eta: '35–40 mins',
    fee: 29,
    feeLabel: '+₹29'
  },
  {
    id: 'Standard',
    label: 'Standard',
    icon: '🟠',
    subtitle: 'Minimal order grouping',
    eta: '40–45 mins',
    fee: 0,
    feeLabel: 'Free'
  },
  {
    id: 'Eco Saver',
    label: 'Eco Saver',
    icon: '🍃',
    subtitle: 'Lesser CO₂ by order grouping',
    eta: '45–55 mins',
    fee: -10,
    feeLabel: '−₹10'
  }
];

const CustomerCheckout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('selecting'); // 'selecting' | 'processing' | 'success'
    const [deliveryMethod, setDeliveryMethod] = useState('Standard');
    const paymentMethod = 'Online';
    const { total: baseTotal, deliverWithMilk, deliveryAddress, deliveryDate, deliverySlot } = location.state || { total: '0.00', deliverWithMilk: false };

    const selectedOption = DELIVERY_OPTIONS.find(o => o.id === deliveryMethod);
    const adjustedTotal = useMemo(() => {
        const base = parseFloat(baseTotal) || 0;
        return Math.max(0, base + (selectedOption?.fee || 0)).toFixed(2);
    }, [baseTotal, selectedOption]);

    const upiString = `upi://pay?pa=livestock360@upi&pn=Livestock360&am=${adjustedTotal}&cu=INR`;

    const handlePaymentConfirmation = async () => {
        try {
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
                    product: item.id,
                    productName: item.name,
                    category: item.category,
                    farmer: item.farmerId,
                    farmerName: item.farmerName,
                    quantity: item.quantity,
                    unit: item.unit,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                totalAmount: adjustedTotal,
                paymentStatus: 'Success',
                paymentMethod: paymentMethod,
                isAddon: deliverWithMilk,
                deliveryAddress: deliveryAddress || null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                deliverySlot: deliverySlot || null,
                deliveryMethod
            };

            const response = await api.post('/orders', orderData);
            const data = response.data;

            if (data.success) {
                setStatus('success');
                localStorage.removeItem('cartItems');
                toast.success(t('payment_success_title'));
                setTimeout(() => { navigate('/customer/orders'); }, 2000);
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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">

                {/* Step 1: Delivery Method Selection */}
                {status === 'selecting' && (
                    <>
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Choose Delivery</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select how you'd like your order delivered</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {DELIVERY_OPTIONS.map(option => {
                                const isSelected = deliveryMethod === option.id;
                                return (
                                    <label
                                        key={option.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                            isSelected
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                        }`}
                                        onClick={() => setDeliveryMethod(option.id)}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            isSelected ? 'border-orange-500' : 'border-gray-300 dark:border-gray-500'
                                        }`}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold text-base ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {option.icon} {option.label}
                                                </span>
                                                {option.fee !== 0 && (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                        option.fee > 0
                                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    }`}>
                                                        {option.feeLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.subtitle}</p>
                                        </div>
                                        <span className={`text-sm font-semibold shrink-0 ${isSelected ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {option.eta}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700 mb-6">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">₹{adjustedTotal}</span>
                        </div>

                        <button
                            onClick={() => setStatus('processing')}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors duration-200 text-base"
                        >
                            Continue to Payment →
                        </button>
                    </>
                )}

                {/* Step 2: QR Payment */}
                {status === 'processing' && (
                    <>
                        <div className="mb-6 text-center">
                            <button
                                onClick={() => setStatus('selecting')}
                                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-3 flex items-center gap-1 mx-auto"
                            >
                                ← Change delivery
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('checkout_title')}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {t('paying_to_label')} <span className="font-semibold text-gray-900 dark:text-white">Livestock360</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {selectedOption?.icon} {deliveryMethod} · {selectedOption?.eta}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200 flex justify-center">
                            <QRCodeSVG value={upiString} size={192} />
                        </div>

                        <p className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            {t('scan_pay_label')} ₹{adjustedTotal}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handlePaymentConfirmation}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl transition duration-200"
                            >
                                {t('confirm_payment_btn')}
                            </button>
                            <button
                                onClick={() => navigate('/customer/cart')}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl transition duration-200"
                            >
                                {t('cancel_payment_btn')}
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-gray-500 animate-pulse text-center">
                            {t('processing_payment_msg')}
                        </p>
                    </>
                )}

                {/* Step 3: Success */}
                {status === 'success' && (
                    <div className="py-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
