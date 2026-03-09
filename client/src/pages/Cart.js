
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import subscriptionService from '../services/subscriptionService';
import api from '../services/api';

// Import Assets
import milkImg from '../assets/Milk.jpg';
import curdImg from '../assets/curd.jpeg';
import butterImg from '../assets/butter.jpg';
import gheeImg from '../assets/Ghee.jpg';
import eggImg from '../assets/Egg.jpg';
import paneerImg from '../assets/paneer.jpg';
import honeyImg from '../assets/Honey.jpg';
import chickenImg from '../assets/chicken.jpg';
import countryChickenImg from '../assets/country chicken.jpg';
import muttonImg from '../assets/Mutton.jpg';
import defaultImg from '../assets/Milk.jpg';

// ── Delivery slots available ───────────────────────────────────────────────────
const SLOTS = ['Morning (6-9 AM)', 'Evening (5-7 PM)'];

// Helper: date options tomorrow → +3 days
const getDeliveryDateOptions = () => {
    const opts = [];
    for (let i = 1; i <= 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
        opts.push({ value: d.toISOString().split('T')[0], label });
    }
    return opts;
};

const Cart = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [userName, setUserName] = useState('');
    const [hasActiveMilkSub, setHasActiveMilkSub] = useState(false);

    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1 = address, 2 = slot
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // Delivery form
    const [delivery, setDelivery] = useState({
        street: '', city: '', state: '', pincode: '',
        slot: 'Morning (6-9 AM)',
        date: getDeliveryDateOptions()[0].value,
        withMilk: false,
    });

    const getImage = (cat) => {
        switch (cat) {
            case 'Milk': return milkImg;
            case 'Curd': return curdImg;
            case 'Butter': return butterImg;
            case 'Ghee': return gheeImg;
            case 'Paneer': return paneerImg;
            case 'Honey': return honeyImg;
            case 'Eggs': return eggImg;
            case 'Chicken': return chickenImg;
            case 'Country Chicken': return countryChickenImg;
            case 'Mutton': return muttonImg;
            case 'Meat': return chickenImg;
            default: return defaultImg;
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.firstName || 'Customer');
                // Pre-fill address from profile
                if (user.address?.city) setDelivery(d => ({ ...d, city: user.address.city }));
            } catch (e) { console.error(e); }
        }
        loadCart();
        checkSubscriptions();
    }, []);

    const checkSubscriptions = async () => {
        try {
            const data = await subscriptionService.getMySubscriptions();
            if (data.success) {
                const activeMilk = data.data.some(sub =>
                    sub.status === 'Active' &&
                    sub.product &&
                    (sub.product.category === 'Milk' || String(sub.product.category).toLowerCase() === 'milk')
                );
                setHasActiveMilkSub(activeMilk);
            }
        } catch (error) { console.error('Failed to check subscriptions', error); }
    };

    const loadCart = () => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            try { setCartItems(JSON.parse(storedCart)); } catch (e) { console.error(e); }
        }
    };

    const updateQuantity = (id, change) => {
        const updatedCart = cartItems.map(item => {
            if (item.id === id) {
                const newQty = parseFloat((item.quantity + change).toFixed(2));
                if (newQty <= 0) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        toast.info(t('item_removed_msg'));
    };

    const clearCart = () => {
        if (window.confirm(t('clear_cart_confirm'))) {
            setCartItems([]);
            localStorage.removeItem('cartItems');
            toast.info(t('cart_cleared_msg'));
        }
    };

    const calculateTotal = () =>
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

    // ── GPS auto-fill ──────────────────────────────────────────────────────────
    const handleUseLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await res.json();
                const addr = data.address || {};
                setDelivery(d => ({
                    ...d,
                    street: addr.road || addr.suburb || '',
                    city: addr.city || addr.town || addr.village || '',
                    state: addr.state || '',
                    pincode: addr.postcode || '',
                }));
                toast.success('Location detected!');
            } catch { toast.error('Could not fetch address'); }
            finally { setLocLoading(false); }
        }, () => { toast.error('Location access denied'); setLocLoading(false); });
    };

    // ── Place order ────────────────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (!delivery.withMilk) {
            if (!delivery.street || !delivery.city || !delivery.pincode) {
                toast.error('Please fill in delivery address (street, city, pincode)');
                return;
            }
        }

        if (paymentMethod === 'Online') {
            navigate('/customer/checkout', {
                state: {
                    total: calculateTotal(),
                    deliverWithMilk: delivery.withMilk,
                    deliveryAddress: delivery.withMilk ? null : {
                        street: delivery.street,
                        city: delivery.city,
                        state: delivery.state,
                        pincode: delivery.pincode,
                    },
                    deliveryDate: delivery.withMilk ? null : delivery.date,
                    deliverySlot: delivery.withMilk ? 'With Milk Subscription' : delivery.slot,
                }
            });
            setShowCheckout(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const items = cartItems.map(item => ({
                product: item.id,
                productName: item.name,
                category: item.category,
                farmer: item.farmerId,
                farmerName: item.farmerName,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                total: item.price * item.quantity,
            }));

            const payload = {
                items,
                totalAmount: parseFloat(calculateTotal()),
                deliveryAddress: delivery.withMilk ? null : {
                    street: delivery.street,
                    city: delivery.city,
                    state: delivery.state,
                    pincode: delivery.pincode,
                },
                deliveryDate: delivery.withMilk ? null : delivery.date,
                deliverySlot: delivery.withMilk ? 'With Milk Subscription' : delivery.slot,
            };

            const res = await api.post('/orders', payload);
            if (res.data.success) {
                toast.success('Order placed! Delivery fee will be shared with nearby orders.');
                setCartItems([]);
                localStorage.removeItem('cartItems');
                setShowCheckout(false);
                navigate('/customer/orders');
            } else {
                toast.error(res.data.message || 'Failed to place order');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const dateOptions = getDeliveryDateOptions();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 cursor-pointer" onClick={() => navigate('/customer/products')}>Livestock360</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{t('hello_greeting')} <span className="text-green-600 dark:text-green-400 font-bold">{userName}</span></span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">{t('cart_title')}</h1>

                {cartItems.length > 0 && (
                    <div className="flex justify-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('total_label')} ₹{calculateTotal()}</h2>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                        <div className="mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t('cart_empty_title')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('cart_empty_msg')}</p>
                        <button onClick={() => navigate('/customer/products')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                            {t('start_shopping_btn')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                                    <img src={getImage(item.category)} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{t('farmer_label')} <span className="font-medium text-gray-800 dark:text-gray-200">{item.farmerName}</span></p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('price_per_label')} {item.unit}: ₹{item.price}</p>
                                    <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">{t('total_value_label')}: ₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                                        <button onClick={() => updateQuantity(item.id, -0.5)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-l-md transition">-</button>
                                        <input
                                            type="number" step="0.1" min="0.1" value={item.quantity}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const updatedCart = cartItems.map(ci => ci.id === item.id ? { ...ci, quantity: val === '' ? '' : parseFloat(val) } : ci);
                                                setCartItems(updatedCart);
                                                if (val !== '' && !isNaN(val)) localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                                            }}
                                            className="w-16 text-center border-x border-gray-300 dark:border-gray-600 py-1 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        <button onClick={() => updateQuantity(item.id, 0.5)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-r-md transition">+</button>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition">{t('remove_btn')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Actions */}
                {cartItems.length > 0 && (
                    <div className="mt-8 flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <button onClick={() => navigate('/customer/products')} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
                                {t('continue_shopping_btn')}
                            </button>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button onClick={clearCart} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition">
                                    {t('clear_cart_btn')}
                                </button>
                                <button
                                    onClick={() => { setCheckoutStep(1); setShowCheckout(true); }}
                                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition"
                                >
                                    {t('checkout_btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Delivery Checkout Modal ─────────────────────────────────────── */}
            {showCheckout && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-lg">
                                    {checkoutStep === 1 ? 'Step 1: Delivery Address' : 'Step 2: Delivery Options'}
                                </h2>
                                <div className="flex gap-1 mt-1.5">
                                    <span className="h-1.5 w-8 rounded-full bg-white opacity-100" />
                                    <span className={`h-1.5 w-8 rounded-full ${checkoutStep === 2 ? 'bg-white' : 'bg-white/40'}`} />
                                </div>
                            </div>
                            <button onClick={() => setShowCheckout(false)} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* STEP 1: Address */}
                            {checkoutStep === 1 && (
                                <>
                                    <button
                                        onClick={handleUseLocation}
                                        disabled={locLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold py-3 rounded-xl hover:bg-blue-100 transition disabled:opacity-60"
                                    >
                                        {locLoading ? '📍 Detecting...' : '📍 Use My Current Location'}
                                    </button>
                                    <div className="relative flex items-center gap-3">
                                        <div className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                                        <span className="text-xs text-gray-400 font-medium">OR ENTER MANUALLY</span>
                                        <div className="flex-1 border-t border-gray-200 dark:border-gray-600" />
                                    </div>
                                    <input
                                        type="text" placeholder="Street / Area*"
                                        value={delivery.street}
                                        onChange={e => setDelivery(d => ({ ...d, street: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="City*" value={delivery.city}
                                            onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none" />
                                        <input type="text" placeholder="State" value={delivery.state}
                                            onChange={e => setDelivery(d => ({ ...d, state: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none" />
                                    </div>
                                    <input type="text" placeholder="Pincode*" value={delivery.pincode}
                                        onChange={e => setDelivery(d => ({ ...d, pincode: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-500 outline-none" />
                                    <button
                                        onClick={() => {
                                            if (!delivery.street || !delivery.city || !delivery.pincode) { toast.error('Please fill street, city, and pincode'); return; }
                                            setCheckoutStep(2);
                                        }}
                                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition"
                                    >
                                        Continue to Delivery Options →
                                    </button>
                                </>
                            )}

                            {/* STEP 2: Slot + Date */}
                            {checkoutStep === 2 && (
                                <>
                                    {/* Address summary */}
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                        <span>📍 {delivery.street}, {delivery.city} — {delivery.pincode}</span>
                                        <button onClick={() => setCheckoutStep(1)} className="text-green-600 font-bold text-xs ml-2 flex-shrink-0">Change</button>
                                    </div>

                                    {/* With milk option */}
                                    {hasActiveMilkSub && (
                                        <label className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 p-3 rounded-xl cursor-pointer">
                                            <input type="checkbox" checked={delivery.withMilk} onChange={e => setDelivery(d => ({ ...d, withMilk: e.target.checked }))}
                                                className="w-5 h-5 text-green-600 rounded border-gray-300" />
                                            <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                                Deliver with tomorrow's milk subscription — Free delivery!
                                            </span>
                                        </label>
                                    )}

                                    {!delivery.withMilk && (
                                        <>
                                            {/* Slot picker */}
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Choose Delivery Slot</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {SLOTS.map(slot => (
                                                        <button key={slot} onClick={() => setDelivery(d => ({ ...d, slot }))}
                                                            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition ${delivery.slot === slot ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                                                            {slot === 'Morning (6-9 AM)' ? '🌅 ' : '🌆 '}{slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Date picker */}
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Choose Delivery Date</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {dateOptions.map(opt => (
                                                        <button key={opt.value} onClick={() => setDelivery(d => ({ ...d, date: opt.value }))}
                                                            className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition ${delivery.date === opt.value ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Method */}
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Payment Method</p>
                                                <div className="flex gap-4">
                                                    <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                                                        <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                                        Cash on Delivery
                                                    </label>
                                                    <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'Online' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                                                        <input type="radio" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                                        Pay Online (UPI)
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Cost transparency */}
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                                                <strong>{paymentMethod === 'COD' ? 'Cash on Delivery:' : 'Shared Delivery Delivery:'}</strong> Your order is grouped with nearby customers to save money. A small delivery fee (₹15–₹80) is calculated tonight and added to your final bill to be paid on delivery.
                                            </div>
                                        </>
                                    )}

                                    {/* Order summary */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
                                            <span>Items ({cartItems.length})</span>
                                            <span className="font-bold">₹{calculateTotal()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>Pay on Delivery</span>
                                            <span>{delivery.withMilk ? '₹' + calculateTotal() : '₹' + calculateTotal() + ' + ₹15–₹80'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setCheckoutStep(1)} className="w-1/3 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition hover:bg-gray-200">
                                            ← Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isSubmitting}
                                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Processing...' : paymentMethod === 'Online' ? 'Proceed to Payment →' : 'Place COD Order'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;



