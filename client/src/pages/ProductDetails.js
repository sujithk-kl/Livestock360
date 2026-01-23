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
        'Chicken': { calories: '239 kcal', carbs: '0 g', protein: '27 g', fats: '14 g', vitaminA: '0 mg' },
        'Country Chicken': { calories: '239 kcal', carbs: '0 g', protein: '27 g', fats: '14 g', vitaminA: '0 mg' },
        'Mutton': { calories: '294 kcal', carbs: '0 g', protein: '25 g', fats: '21 g', vitaminA: '0 mg' },
        'Milk': { calories: '42 kcal', carbs: '5 g', protein: '3.4 g', fats: '1 g', vitaminA: '46 mg' },
        'Eggs': { calories: '155 kcal', carbs: '1.1 g', protein: '13 g', fats: '11 g', vitaminA: '160 mg' },
        'Ghee': { calories: '900 kcal', carbs: '0 g', protein: '0 g', fats: '100 g', vitaminA: '3000 IU' },
        'Paneer': { calories: '265 kcal', carbs: '1.2 g', protein: '18 g', fats: '20 g', vitaminA: '180 mg' },
        'Honey': { calories: '304 kcal', carbs: '82 g', protein: '0.3 g', fats: '0 g', vitaminA: '0 mg' },
        // Fallback
        'default': { calories: 'N/A', carbs: 'N/A', protein: 'N/A', fats: 'N/A', vitaminA: 'N/A' }
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
                                <li className="flex justify-between border-b border-blue-100 pb-2">
                                    <span className="text-gray-600 font-medium">• Calories</span>
                                    <span className="text-blue-800 font-bold">{nutrition.calories}</span>
                                </li>
                                <li className="flex justify-between border-b border-blue-100 pb-2">
                                    <span className="text-gray-600 font-medium">• Carbohydrates</span>
                                    <span className="text-blue-800 font-bold">{nutrition.carbs}</span>
                                </li>
                                <li className="flex justify-between border-b border-blue-100 pb-2">
                                    <span className="text-gray-600 font-medium">• Protein</span>
                                    <span className="text-blue-800 font-bold">{nutrition.protein}</span>
                                </li>
                                <li className="flex justify-between border-b border-blue-100 pb-2">
                                    <span className="text-gray-600 font-medium">• Fibers</span>
                                    <span className="text-blue-800 font-bold">0 g</span>
                                </li>
                                <li className="flex justify-between pb-2">
                                    <span className="text-gray-600 font-medium">• Vitamin A</span>
                                    <span className="text-blue-800 font-bold">{nutrition.vitaminA}</span>
                                </li>
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
        </div>
    );
};

export default ProductDetails;
