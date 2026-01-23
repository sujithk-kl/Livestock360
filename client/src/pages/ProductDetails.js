import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [products, setProducts] = useState([]); // These are the vendor offerings
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('price-asc');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Mappings
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
            // Meat map to chicken for now if no generic meat image
            case 'Meat': return chickenImg;
            default: return defaultImg;
        }
    };

    // Static Nutritional Data (Mock)
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
        // Fallback
        'default': { 'Calories': 'N/A', 'Protein': 'N/A' }
    };

    const nutrition = nutritionalData[category] || nutritionalData['default'];

    useEffect(() => {
        const fetchOfferings = async () => {
            try {
                setLoading(true);
                // Fetch products specifically for this category
                const data = await productService.getAll({ category: category });
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load offerings');
            } finally {
                setLoading(false);
            }
        };
        fetchOfferings();
    }, [category]);

    // Sorting Logic
    const sortedProducts = [...products].sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        return 0; // Default
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <ToastContainer />

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Product Details</h1>
                    <div className="w-10"></div> {/* Spacer for alignment */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Product Info */}
                    <div className="w-full lg:w-1/3">
                        {/* Product Image Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col items-center">
                            <div className="w-64 h-64 overflow-hidden rounded-full border-4 border-gray-100 mb-4">
                                <img src={getImage(category)} alt={category} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-3xl font-bold text-blue-800 mb-2">{category}</h2>
                        </div>

                        {/* Nutritional Facts Card */}
                        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-4">Nutritional Facts</h3>
                            <ul className="space-y-3">
                                {Object.entries(nutrition).map(([key, value]) => (
                                    <li key={key} className="flex justify-between border-b border-blue-100 pb-2 last:border-0">
                                        <span className="text-gray-600 font-medium">• {key}</span>
                                        <span className="text-blue-800 font-bold">{value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Vendor Offerings */}
                    <div className="w-full lg:w-2/3">
                        {/* Controls */}
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800">Farmers Offerings</h3>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                    >
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div></div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                                No farmers currently selling {category}.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedProducts.map(product => (
                                    <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">{product.productName}</h4>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    Farmer: {product.farmer?.name || 'Local Farmer'}
                                                </p>
                                                {/* Reviews stars placeholder */}
                                                <div className="flex text-yellow-400 mb-1">
                                                    {'★'.repeat(4)}{'☆'.repeat(1)}
                                                    <span className="text-xs text-gray-400 ml-2">(12 reviews)</span>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {product.farmer?.address?.city}, {product.farmer?.address?.state}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">₹{product.price} <span className="text-sm text-gray-500 font-normal">per {product.unit}</span></div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setQuantity(1); // Reset to 1 or default unit
                                                        setIsModalOpen(true);
                                                    }}
                                                    disabled={product.quantity <= 0}
                                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition duration-200 disabled:bg-gray-300"
                                                >
                                                    {product.quantity > 0 ? 'Add to Cart' : 'Sold Out'}
                                                </button>
                                                <p className={`text-xs mt-2 ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Add to Cart Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

                        {/* Modal panel */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                    Add to Cart
                                </h3>

                                <div className="mb-4">
                                    <h4 className="text-xl font-bold text-gray-800">{selectedProduct.productName}</h4>
                                    <p className="text-gray-500 text-sm">Price per {selectedProduct.unit}: ₹{selectedProduct.price}</p>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity ({selectedProduct.unit})
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        min="1"
                                        max={selectedProduct.quantity}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                    <p className="text-right text-lg font-bold text-gray-900 mt-2">
                                        Total Cost: ₹{(selectedProduct.price * quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        const cartItem = {
                                            id: selectedProduct._id,
                                            productName: selectedProduct.productName,
                                            name: selectedProduct.productName,
                                            category: category,
                                            price: selectedProduct.price,
                                            unit: selectedProduct.unit,
                                            farmerName: selectedProduct.farmer?.name || 'Local Farmer',
                                            quantity: quantity,
                                            maxQuantity: selectedProduct.quantity
                                        };

                                        // Get existing cart
                                        const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');

                                        // Check if item exists
                                        const existingItemIndex = existingCart.findIndex(item => item.id === cartItem.id);

                                        if (existingItemIndex > -1) {
                                            // Update quantity
                                            existingCart[existingItemIndex].quantity += quantity;
                                            toast.success('Added to cart (Updated quantity)');
                                        } else {
                                            // Add new
                                            existingCart.push(cartItem);
                                            toast.success('Added to cart');
                                        }

                                        localStorage.setItem('cartItems', JSON.stringify(existingCart));
                                        setIsModalOpen(false);
                                    }}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
