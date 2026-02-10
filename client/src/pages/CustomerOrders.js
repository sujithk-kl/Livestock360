import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Assets (Same as ProductDetails)
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

const CustomerOrders = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    // Image Helper
    const getImage = (item) => {
        // Try explicit category first
        let cat = item.category;

        // Fallback: Infer from product name if category is missing or generic
        if (!cat) {
            const name = (item.productName || '').toLowerCase();
            if (name.includes('milk')) cat = 'Milk';
            else if (name.includes('curd')) cat = 'Curd';
            else if (name.includes('butter')) cat = 'Butter';
            else if (name.includes('ghee')) cat = 'Ghee';
            else if (name.includes('paneer')) cat = 'Paneer';
            else if (name.includes('honey')) cat = 'Honey';
            else if (name.includes('egg')) cat = 'Eggs';
            else if (name.includes('chicken') && name.includes('country')) cat = 'Country Chicken';
            else if (name.includes('chicken')) cat = 'Chicken';
            else if (name.includes('mutton')) cat = 'Mutton';
            else if (name.includes('meat')) cat = 'Meat';
        }

        // Match category (handle potential case variants)
        const normalize = (s) => (s || '').toLowerCase();

        if (normalize(cat) === 'milk') return milkImg;
        if (normalize(cat) === 'curd') return curdImg;
        if (normalize(cat) === 'butter') return butterImg;
        if (normalize(cat) === 'ghee') return gheeImg;
        if (normalize(cat) === 'paneer') return paneerImg;
        if (normalize(cat) === 'honey') return honeyImg;
        if (normalize(cat).includes('egg')) return eggImg;
        if (normalize(cat) === 'country chicken') return countryChickenImg;
        if (normalize(cat) === 'chicken') return chickenImg;
        if (normalize(cat) === 'mutton') return muttonImg;
        if (normalize(cat) === 'meat') return chickenImg;

        return defaultImg;
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/customer/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            } else {
                toast.error(t('fetch_orders_error'));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(t('fetch_orders_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReviewModal = (item) => {
        setSelectedItem(item);
        setReviewRating(5);
        setReviewComment('');
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: selectedItem.product, // Assuming product ID is stored in 'product' field of item
                    rating: reviewRating,
                    comment: reviewComment
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(t('review_submitted_msg'));
                setIsReviewModalOpen(false);
            } else {
                toast.error(data.message || t('review_failed_msg'));
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(t('review_failed_msg'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('order_history_title')}</h1>
                    <button
                        onClick={() => navigate('/customer/products')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-md"
                    >
                        {t('back_products_btn')}
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">{t('no_orders_msg')}</p>
                        <button
                            onClick={() => navigate('/customer/products')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            {t('start_shopping_btn')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('order_id_label')}</p>
                                        <p className="font-mono font-medium text-gray-800 dark:text-white text-sm">{order._id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('date_label')}</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_amount_label')}</p>
                                        <p className="font-bold text-green-600 text-lg">₹{order.totalAmount}</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-800">
                                        {order.paymentStatus}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{t('items_label')}</h4>
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                                                        <img
                                                            src={getImage(item)}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = defaultImg; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white">{item.productName}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.quantity} {item.unit} x ₹{item.price}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{t('farmer_label')} {item.farmerName || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenReviewModal(item)}
                                                    className="mt-2 sm:mt-0 text-white bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded text-sm font-medium transition"
                                                >
                                                    {t('write_review_btn')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {t('review_product_title')} {selectedItem?.productName}
                        </h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('rating_label')}</label>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className={`text-2xl focus:outline-none transition-colors duration-150 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('comment_label')}</label>
                                <textarea
                                    className="w-full px-3 py-2 text-gray-700 dark:text-white border rounded-lg focus:outline-none focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
                                    rows="4"
                                    placeholder={t('review_placeholder')}
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    {t('cancel_btn')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
                                >
                                    {t('submit_review_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;
