
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Load User
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.firstName || 'Customer');
            } catch (e) {
                console.error(e);
            }
        }

        // Load Cart
        loadCart();
    }, []);

    const loadCart = () => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (error) {
                console.error('Error loading cart', error);
            }
        }
    };

    const updateQuantity = (id, change) => {
        const updatedCart = cartItems.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + change;
                if (newQty < 1) return item; // Min quantity 1
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
        toast.info('Item removed from cart');
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            setCartItems([]);
            localStorage.removeItem('cartItems');
            toast.info('Cart cleared');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <ToastContainer />

            {/* Header - Reuse from CustomerProducts but simpler */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-green-600 cursor-pointer" onClick={() => navigate('/customer/products')}>Livestock360</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 font-medium">Hello, <span className="text-green-600 font-bold">{userName}</span></span>
                        {/* Optional Logout if needed usually cart has minimalist header */}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Your Cart</h1>

                {cartItems.length > 0 && (
                    <div className="flex justify-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Total: ₹{calculateTotal()}</h2>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                        <button
                            onClick={() => navigate('/customer/products')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                                    <p className="text-gray-600 mt-1">Farmer: <span className="font-medium text-gray-800">{item.farmerName}</span></p>
                                    <p className="text-gray-500 mt-1">Price per {item.unit}: ₹{item.price}</p>
                                    <p className="text-blue-600 font-bold mt-2">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-l-md transition"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="text"
                                            readOnly
                                            value={item.quantity}
                                            className="w-12 text-center border-x border-gray-300 py-1 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-r-md transition"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Actions */}
                {cartItems.length > 0 && (
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button
                            onClick={() => navigate('/customer/products')}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                        >
                            Continue Shopping
                        </button>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={clearCart}
                                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Clear Cart
                            </button>
                            <button
                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
