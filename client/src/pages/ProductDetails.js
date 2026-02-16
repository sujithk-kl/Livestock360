import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productService from '../services/productService';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StarIcon, ShoppingCartIcon, ArrowLeftIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/solid';
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

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

    const nutritionalData = {
        'Milk': { 'Serving Size': '100 ml', 'Calories': '42 kcal', 'Carbohydrates': '5 g', 'Protein': '3.4 g', 'Fat': '1 g', 'Calcium': '120 mg', 'Vitamin B12': '0.5 µg' },
        'Curd': { 'Serving Size': '100 g', 'Calories': '98 kcal', 'Carbohydrates': '3.6 g', 'Protein': '4.3 g', 'Fat': '4 g', 'Calcium': '121 mg', 'Vitamin B12': '0.8 µg', 'Probiotics': 'Present' },
        'Butter': { 'Serving Size': '100 g', 'Calories': '717 kcal', 'Carbohydrates': '0.1 g', 'Protein': '0.9 g', 'Fat': '81 g', 'Vitamin A': '684 µg', 'Cholesterol': '215 mg' },
        'Ghee': { 'Serving Size': '100 g', 'Calories': '900 kcal', 'Carbohydrates': '0 g', 'Protein': '0 g', 'Fat': '100 g', 'Vitamin A': '850 µg', 'Omega-3 Fatty Acids': '0.5 g' },
        'Paneer': { 'Serving Size': '100 g', 'Calories': '265 kcal', 'Carbohydrates': '1.2 g', 'Protein': '18 g', 'Fat': '20 g', 'Calcium': '208 mg', 'Vitamin B12': '1.1 µg' },
        'Honey': { 'Serving Size': '100 g', 'Calories': '304 kcal', 'Carbohydrates': '82 g', 'Protein': '0.3 g', 'Fat': '0 g', 'Sugars': '82 g', 'Antioxidants': 'Present' },
        'Eggs': { 'Serving Size': '1 large ~50 g', 'Calories': '72 kcal', 'Protein': '6.3 g', 'Fat': '5 g', 'Carbohydrates': '0.4 g', 'Vitamin D': '1.1 µg', 'Vitamin B12': '0.6 µg' },
        'Chicken': { 'Serving Size': '100 g', 'Calories': '239 kcal', 'Protein': '27 g', 'Fat': '14 g', 'Carbohydrates': '0 g', 'Iron': '1.3 mg' },
        'Country Chicken': { 'Serving Size': '100 g', 'Calories': '215 kcal', 'Protein': '25 g', 'Fat': '12 g', 'Carbohydrates': '0 g', 'Iron': '1.6 mg', 'Omega-3': 'Higher than broiler' },
        'Mutton': { 'Serving Size': '100 g', 'Calories': '294 kcal', 'Protein': '25 g', 'Fat': '21 g', 'Carbohydrates': '0 g', 'Iron': '2.7 mg', 'Vitamin B12': '2.6 µg' },
        'default': { 'Calories': 'N/A', 'Protein': 'N/A' }
    };

    const nutrition = nutritionalData[category] || nutritionalData['default'];

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
    }, [category]);

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

                        {/* Nutritional Facts */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-secondary-500 rounded-full"></span>
                                {t('nutritional_facts_title')}
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(nutrition).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{key}</span>
                                        <span className="text-primary-700 dark:text-primary-400 font-bold text-sm bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">{value}</span>
                                    </div>
                                ))}
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
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setQuantity(1);
                                                        setIsModalOpen(true);
                                                    }}
                                                    disabled={product.quantity <= 0}
                                                    className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCartIcon className="w-5 h-5" />
                                                    {product.quantity > 0 ? t('add_to_cart_btn') : t('sold_out_label')}
                                                </button>
                                            </div>

                                            {/* Mobile Add to Cart */}
                                            <div className="sm:hidden mt-2">
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
        </div>
    );
};

export default ProductDetails;
