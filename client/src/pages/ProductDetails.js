import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productService from '../services/productService';
import api from '../services/api';
import subscriptionService from '../services/subscriptionService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StarIcon, ShoppingCartIcon, ArrowLeftIcon, FunnelIcon, XMarkIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

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

const ProductDetails = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('price-asc');

    // Cart Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Subscription Modal State
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [subQuantity, setSubQuantity] = useState(1);
    const [subDuration, setSubDuration] = useState(30);
    const [mySubscriptions, setMySubscriptions] = useState([]);

    // Address Modal State (shown BEFORE subscription modal)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        lat: null,
        lng: null,
    });

    // Reviews State
    const [reviews, setReviews] = useState({});
    const [expandedReviews, setExpandedReviews] = useState({});

    const toggleReviews = async (productId) => {
        setExpandedReviews(prev => ({ ...prev, [productId]: !prev[productId] }));

        if (!reviews[productId]) {
            try {
                const response = await api.get(`/reviews/${productId}`);
                const data = response.data;
                if (data.success) {
                    setReviews(prev => ({ ...prev, [productId]: data.data }));
                }
            } catch (error) {
                console.error("Error fetching reviews", error);
            }
        }
    };

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
        const fetchOfferings = async () => {
            try {
                setLoading(true);
                let city = null;
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user.address?.city) city = user.address.city;
                        else if (user.city) city = user.city;
                    }
                } catch (e) { }

                const filters = { category: category };
                if (city) filters.city = city;

                const data = await productService.getAll(filters);
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error(error);
                toast.error(t('failed_load_offerings_msg') || 'Failed to load offerings');
            } finally {
                setLoading(false);
            }
        };
        fetchOfferings();

        // Fetch customer's active subscriptions to detect already-subscribed products
        subscriptionService.getMySubscriptions()
            .then(data => { if (data.success) setMySubscriptions(data.data); })
            .catch(() => { }); // Silently ignore — not critical

        // Pre-fill address from user profile if available
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const addr = user.address || {};
                setDeliveryAddress(prev => ({
                    ...prev,
                    street: addr.street || addr.line1 || '',
                    city: addr.city || '',
                    state: addr.state || '',
                    pincode: addr.pincode || addr.zip || '',
                }));
            }
        } catch (e) { }
    }, [category]);

    // ─── Geolocation Handler ────────────────────────────────────────────────────
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse geocode using free OpenStreetMap Nominatim API
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const geo = await res.json();
                    const addr = geo.address || {};
                    setDeliveryAddress({
                        street: [addr.house_number, addr.road, addr.suburb].filter(Boolean).join(', '),
                        city: addr.city || addr.town || addr.village || addr.county || '',
                        state: addr.state || '',
                        pincode: addr.postcode || '',
                        lat: latitude,
                        lng: longitude,
                    });
                    toast.success('Location detected successfully!');
                } catch (err) {
                    toast.error('Could not reverse-geocode the location. Please fill manually.');
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                setLocationLoading(false);
                if (err.code === err.PERMISSION_DENIED) {
                    toast.error('Location access denied. Please enter your address manually.');
                } else {
                    toast.error('Unable to retrieve location. Please enter your address manually.');
                }
            },
            { timeout: 10000 }
        );
    };

    // ─── Open Subscribe Flow ─────────────────────────────────────────────────────
    const openSubscribeFlow = (product) => {
        setSelectedProduct(product);
        setSubQuantity(1);
        setIsAddressModalOpen(true); // Show address step first
    };

    // ─── Address validation & proceed to sub modal ───────────────────────────────
    const handleAddressContinue = () => {
        if (!deliveryAddress.street.trim()) {
            toast.error('Please enter your house/street address.');
            return;
        }
        if (!deliveryAddress.city.trim()) {
            toast.error('Please enter your city.');
            return;
        }
        if (!deliveryAddress.state.trim()) {
            toast.error('Please enter your state.');
            return;
        }
        if (!deliveryAddress.pincode.trim()) {
            toast.error('Please enter your pincode.');
            return;
        }
        setIsAddressModalOpen(false);
        setIsSubModalOpen(true);
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'rating-desc') return (b.averageRating || 0) - (a.averageRating || 0);
        if (sortOption === 'rating-asc') return (a.averageRating || 0) - (b.averageRating || 0);
        return 0;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {t(`cat_${category.toLowerCase().replace(/ /g, '_')}`, category)}
                            <span className="text-gray-400 font-normal text-sm hidden sm:inline-block">/ {t('th_product')} {t('details')}</span>
                        </h1>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Product Category Info */}
                    <div className="w-full lg:w-1/3 lg:sticky lg:top-24 h-fit space-y-6">
                        {/* Image Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
                            <div className="aspect-w-4 aspect-h-3 w-full">
                                <img src={getImage(category)} alt={category} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t(`cat_${category.toLowerCase().replace(/ /g, '_')}`, category)}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Fresh and high-quality {category.toLowerCase()} sourced directly from local farmers.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Vendor Offerings */}
                    <div className="w-full lg:w-2/3">
                        {/* Filters & Sorting */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 p-1.5 rounded-lg">
                                    <FunnelIcon className="w-4 h-4" />
                                </span>
                                {t('farmers_offerings_title')}
                            </h3>

                            <div className="flex gap-2 w-full sm:w-auto">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5"
                                >
                                    <option value="price-asc">{t('sort_low_high')}</option>
                                    <option value="price-desc">{t('sort_high_low')}</option>
                                    <option value="rating-desc">Rating: High to Low</option>
                                    <option value="rating-asc">Rating: Low to High</option>
                                </select>
                            </div>
                        </div>

                        {/* Product List */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <XMarkIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No offers found</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {t('no_farmers_selling_msg')} {t(`cat_${category.toLowerCase().replace(/ /g, '_')}`, category)}.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedProducts.map(product => (
                                    <div key={product._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-all hover:shadow-card hover:border-primary-200 dark:hover:border-primary-800">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{product.productName}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <span className="font-medium">{product.farmer?.name || 'Local Farmer'}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span>{product.farmer?.address?.city}, {product.farmer?.address?.state}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right sm:hidden">
                                                        <div className="text-xl font-bold text-primary-600 dark:text-primary-400">₹{product.price}</div>
                                                        <div className="text-xs text-gray-500">per {product.unit}</div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleReviews(product._id); }}
                                                        className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg hover:bg-yellow-100 transition-colors"
                                                    >
                                                        <StarIcon className="w-4 h-4 text-yellow-500" />
                                                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{product.averageRating ? product.averageRating.toFixed(1) : 'New'}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.numReviews || 0})</span>
                                                    </button>

                                                    <div className={`text-xs px-2 py-1 rounded-lg font-medium ${product.quantity > 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                        {product.quantity > 0 ? t('in_stock_label') : t('out_of_stock_label')}
                                                    </div>
                                                </div>

                                                {/* Expanded Reviews */}
                                                {expandedReviews[product._id] && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in-down">
                                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('customer_reviews_title')}</h5>
                                                        {reviews[product._id] && reviews[product._id].length > 0 ? (
                                                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                                                {reviews[product._id].map(review => (
                                                                    <div key={review._id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-sm">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="font-bold text-gray-900 dark:text-white">{review.userName}</span>
                                                                            <div className="flex text-yellow-400">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <StarIcon key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">{t('no_reviews_msg')}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="hidden sm:flex flex-col items-end justify-between min-w-[140px]">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹{product.price}</div>
                                                    <div className="text-sm text-gray-500">per {product.unit}</div>
                                                </div>
                                                <div className="flex gap-2 w-full mt-4">
                                                    {category.toLowerCase() === 'milk' && (
                                                        mySubscriptions.some(s =>
                                                            (s.product?._id === product._id || s.product === product._id) && s.status === 'Active'
                                                        ) ? (
                                                            <span className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-700 whitespace-nowrap">
                                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                                Subscribed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => openSubscribeFlow(product)}
                                                                disabled={product.quantity <= 0}
                                                                className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1"
                                                            >
                                                                <CalendarDaysIcon className="w-4 h-4" />
                                                                {t('Subscribe') || 'Subscribe'}
                                                            </button>
                                                        )
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setQuantity(1);
                                                            setIsModalOpen(true);
                                                        }}
                                                        disabled={product.quantity <= 0}
                                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1"
                                                    >
                                                        <ShoppingCartIcon className="w-5 h-5" />
                                                        {product.quantity > 0 ? t('add_to_cart_btn') : t('sold_out_label')}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Mobile Add to Cart & Subscribe */}
                                            <div className="sm:hidden mt-2 flex flex-col gap-2">
                                                {category.toLowerCase() === 'milk' && (
                                                    mySubscriptions.some(s =>
                                                        (s.product?._id === product._id || s.product === product._id) && s.status === 'Active'
                                                    ) ? (
                                                        <div className="w-full flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold py-3 px-4 rounded-xl border border-green-200 dark:border-green-700">
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                            Already Subscribed
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openSubscribeFlow(product)}
                                                            disabled={product.quantity <= 0}
                                                            className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                        >
                                                            <CalendarDaysIcon className="w-5 h-5" />
                                                            Subscribe
                                                        </button>
                                                    )
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setQuantity(1);
                                                        setIsModalOpen(true);
                                                    }}
                                                    disabled={product.quantity <= 0}
                                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCartIcon className="w-5 h-5" />
                                                    {product.quantity > 0 ? t('add_to_cart_btn') : t('sold_out_label')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Add to Cart Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-100 dark:border-gray-700">
                            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                                        {t('add_to_cart_btn')}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={getImage(category)} alt={selectedProduct.productName} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800 dark:text-white">{selectedProduct.productName}</h4>
                                            <p className="text-primary-600 dark:text-primary-400 font-bold">₹{selectedProduct.price} <span className="text-gray-400 font-normal text-sm">/ {selectedProduct.unit}</span></p>
                                        </div>
                                    </div>

                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('quantity_label')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            id="quantity"
                                            min="0.1"
                                            step="0.1"
                                            max={selectedProduct.quantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="block w-full text-center rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white py-2.5"
                                        />
                                        <div className="text-right min-w-[100px]">
                                            <div className="text-xs text-gray-500">{t('total_cost_label')}</div>
                                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                ₹{(selectedProduct.price * (parseFloat(quantity) || 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-3 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        {t('cancel_btn')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!quantity || parseFloat(quantity) <= 0}
                                        className="flex-1 inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        onClick={() => {
                                            const qty = parseFloat(quantity);
                                            if (!qty || qty <= 0) return;

                                            const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                                            const existingItem = existingCartItems.find(item => item.id === selectedProduct._id);
                                            const existingQty = existingItem ? existingItem.quantity : 0;

                                            if (qty + existingQty > selectedProduct.quantity) {
                                                const availableToAdd = selectedProduct.quantity - existingQty;
                                                toast.error(`${t('out_of_stock_msg') || 'Out of Stock!'} ${t('available_quantity') || 'Available:'} ${Math.max(0, availableToAdd)} ${selectedProduct.unit}`);
                                                return;
                                            }
                                            const cartItem = {
                                                id: selectedProduct._id,
                                                productName: selectedProduct.productName,
                                                name: selectedProduct.productName,
                                                category: category,
                                                price: selectedProduct.price,
                                                unit: selectedProduct.unit,
                                                farmerName: selectedProduct.farmer?.name || 'Local Farmer',
                                                farmerId: selectedProduct.farmer?._id,
                                                quantity: qty,
                                                maxQuantity: selectedProduct.quantity
                                            };

                                            const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
                                            const existingItemIndex = existingCart.findIndex(item => item.id === cartItem.id);

                                            if (existingItemIndex > -1) {
                                                existingCart[existingItemIndex].quantity += qty;
                                                toast.success(t('updated_cart_msg') || 'Added to cart (Updated quantity)');
                                            } else {
                                                existingCart.push(cartItem);
                                                toast.success(t('added_to_cart_msg') || 'Added to cart');
                                            }

                                            localStorage.setItem('cartItems', JSON.stringify(existingCart));
                                            setIsModalOpen(false);
                                        }}
                                    >
                                        {t('add_to_cart_btn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 1: Delivery Address Modal ─────────────────────────────────────── */}
            {isAddressModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity backdrop-blur-sm"
                            aria-hidden="true"
                            onClick={() => setIsAddressModalOpen(false)}
                        />
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100 dark:border-gray-700">
                            {/* Modal Header */}
                            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                                            <MapPinIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Address</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Where should we deliver your daily {selectedProduct.productName}?</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddressModalOpen(false)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-5 space-y-4">
                                {/* Detect Location Button */}
                                <button
                                    onClick={handleDetectLocation}
                                    disabled={locationLoading}
                                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 border-dashed border-secondary-400 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 font-bold hover:bg-secondary-100 dark:hover:bg-secondary-900/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {locationLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary-500 border-t-transparent" />
                                            Detecting your location...
                                        </>
                                    ) : (
                                        <>
                                            <MapPinIcon className="w-5 h-5" />
                                            Use My Current Location
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                    <span className="text-xs text-gray-400 font-medium">or enter manually</span>
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                </div>

                                {/* Street/House */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        House No. / Street / Area <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 12, Gandhi Nagar, Main Road"
                                        value={deliveryAddress.street}
                                        onChange={e => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition text-gray-900 dark:text-white text-sm"
                                    />
                                </div>

                                {/* City + State */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Chennai"
                                            value={deliveryAddress.city}
                                            onChange={e => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Tamil Nadu"
                                            value={deliveryAddress.state}
                                            onChange={e => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 600001"
                                        maxLength={6}
                                        value={deliveryAddress.pincode}
                                        onChange={e => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition text-gray-900 dark:text-white text-sm"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-50 transition-colors text-sm"
                                        onClick={() => setIsAddressModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-[2] rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white font-bold px-4 py-3 transition-colors shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                                        onClick={handleAddressContinue}
                                    >
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        Continue to Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Subscribe Modal ────────────────────────────────────────────── */}
            {isSubModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setIsSubModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-100 dark:border-gray-700">
                            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <CalendarDaysIcon className="w-6 h-6 text-secondary-500" />
                                        Subscribe to {selectedProduct.productName}
                                    </h3>
                                    <button onClick={() => setIsSubModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Delivery address summary */}
                                <div className="mb-5 flex items-start gap-2.5 bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800 rounded-xl px-4 py-3">
                                    <MapPinIcon className="w-4 h-4 text-secondary-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-0.5">Delivering to</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                            {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state} – {deliveryAddress.pincode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setIsSubModalOpen(false); setIsAddressModalOpen(true); }}
                                        className="text-xs text-secondary-600 dark:text-secondary-400 font-bold hover:underline flex-shrink-0"
                                    >
                                        Change
                                    </button>
                                </div>

                                <div className="mb-6">
                                    {/* Daily quantity selector */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Daily Quantity</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                value={subQuantity}
                                                onChange={(e) => setSubQuantity(e.target.value)}
                                                className="w-20 text-center rounded-lg border border-gray-300 dark:border-gray-600 py-1.5 dark:bg-gray-800 dark:text-white text-sm font-bold"
                                            />
                                            <span className="text-gray-500 text-sm">{selectedProduct.unit}/day</span>
                                        </div>
                                    </div>

                                    {/* Pricing Breakdown Card */}
                                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                                        {/* Header */}
                                        <div className="bg-secondary-600 px-4 py-2.5">
                                            <p className="text-xs font-bold text-white uppercase tracking-widest">30-Day Cost Breakdown</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 space-y-2.5">
                                            {/* Milk cost */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-200">🥛 Milk Cost</p>
                                                    <p className="text-xs text-gray-400">₹{selectedProduct.price} × {subQuantity} {selectedProduct.unit} × 30 days</p>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    ₹{(selectedProduct.price * parseFloat(subQuantity || 0) * 30).toFixed(0)}
                                                </span>
                                            </div>

                                            {/* Delivery cost */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-200">🚚 Monthly Delivery</p>
                                                    <p className="text-xs text-gray-400">₹10/day × 30 days (flat rate)</p>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">₹300</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2.5 space-y-1.5">
                                                {/* Daily total */}
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily Cost</p>
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                        ₹{(selectedProduct.price * parseFloat(subQuantity || 0) + 10).toFixed(0)}/day
                                                    </span>
                                                </div>
                                                {/* Monthly total */}
                                                <div className="flex justify-between items-center">
                                                    <p className="text-base font-extrabold text-gray-900 dark:text-white">Total Monthly</p>
                                                    <span className="text-xl font-extrabold text-secondary-600 dark:text-secondary-400">
                                                        ₹{(selectedProduct.price * parseFloat(subQuantity || 0) * 30 + 300).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info footer */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 px-4 py-2.5 flex items-start gap-2">
                                            <span className="text-blue-500 text-sm flex-shrink-0">ℹ️</span>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                Delivery is billed as <strong>₹300/month</strong> (₹10/day) regardless of quantity — the more you subscribe, the better the value per litre!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsSubModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-[2] rounded-xl bg-secondary-600 text-white font-bold hover:bg-secondary-700 transition-colors px-4 py-3"
                                        onClick={async () => {
                                            try {
                                                const startDate = new Date();
                                                startDate.setDate(startDate.getDate() + 1); // Starts tomorrow
                                                const endDate = new Date(startDate);
                                                endDate.setDate(endDate.getDate() + 30); // 30 days

                                                await subscriptionService.createSubscription({
                                                    productId: selectedProduct._id,
                                                    quantityPerDay: parseFloat(subQuantity),
                                                    startDate,
                                                    endDate,
                                                    deliveryCostPerDay: 10,
                                                    deliveryAddress: {
                                                        street: deliveryAddress.street,
                                                        city: deliveryAddress.city,
                                                        state: deliveryAddress.state,
                                                        pincode: deliveryAddress.pincode,
                                                    }
                                                });

                                                toast.success('Subscription started successfully!');
                                                setIsSubModalOpen(false);
                                                navigate('/customer/subscriptions');
                                            } catch (error) {
                                                toast.error(error.message || 'Failed to start subscription');
                                            }
                                        }}
                                    >
                                        Start Subscription
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
