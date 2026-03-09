import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import farmerService from '../services/farmerService';
import authService from '../services/authService';
import api from '../services/api';
import { MapPinIcon, TruckIcon, UserIcon, PhoneIcon, CubeIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const FarmerDeliveries = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [deliveriesByCity, setDeliveriesByCity] = useState({});
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCluster, setExpandedCluster] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }

                // Fetch regular deliveries (subscriptions)
                const resDeliveries = await farmerService.getTodayDeliveries();
                if (resDeliveries.success) {
                    setDeliveriesByCity(resDeliveries.data);
                }

                // Fetch cluster runs
                const resClusters = await api.get('/clusters/today');
                if (resClusters.data.success) {
                    setClusters(resClusters.data.data);
                }

            } catch (error) {
                console.error('Failed to fetch deliveries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const updateClusterStatus = async (clusterId, newStatus) => {
        try {
            const res = await api.put(`/clusters/${clusterId}/status`, { status: newStatus });
            if (res.data.success) {
                toast.success(`Cluster marked as ${newStatus}`);
                setClusters(prev => prev.map(c => c._id === clusterId ? { ...c, status: newStatus } : c));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const cityKeys = Object.keys(deliveriesByCity);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
            {/* Header */}
            <div className="hidden md:flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm items-center px-8">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mr-4">
                    ← Back
                </button>
                <span className="font-bold text-lg font-serif text-gray-900 dark:text-white">Livestock<span className="text-primary-500">360</span></span>
            </div>

            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">

                {/* ── Cluster Deliveries Section ── */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Grouped Cluster Runs</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Multi-product deliveries grouped by area to share costs</p>
                        </div>
                    </div>

                    {clusters.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500">No cluster runs scheduled for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {clusters.map(cluster => (
                                <div key={cluster._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-blue-100 dark:border-blue-900 overflow-hidden">
                                    <div
                                        className="bg-blue-50 dark:bg-blue-900/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                                        onClick={() => setExpandedCluster(expandedCluster === cluster._id ? null : cluster._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-xl">
                                                <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {cluster.city} ({cluster.pincode}) — {cluster.slot}
                                                </h3>
                                                <div className="flex gap-3 text-sm mt-1 text-gray-600 dark:text-gray-400 font-medium">
                                                    <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm">{cluster.orders.length} Stops</span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm">
                                                        Total Fee: ₹{cluster.totalDeliveryFee}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-0 flex items-center gap-4 w-full sm:w-auto">
                                            {cluster.status === 'Confirmed' ? (
                                                <button onClick={(e) => { e.stopPropagation(); updateClusterStatus(cluster._id, 'Out for Delivery'); }} className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition">
                                                    Start Delivery Run
                                                </button>
                                            ) : cluster.status === 'Out for Delivery' ? (
                                                <button onClick={(e) => { e.stopPropagation(); updateClusterStatus(cluster._id, 'Delivered'); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition">
                                                    <CheckCircleIcon className="w-5 h-5" /> Mark Run Complete
                                                </button>
                                            ) : (
                                                <span className="text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/40 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <CheckCircleIcon className="w-5 h-5" /> Delivered
                                                </span>
                                            )}
                                            {expandedCluster === cluster._id ? <ChevronUpIcon className="w-6 h-6 text-gray-400" /> : <ChevronDownIcon className="w-6 h-6 text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Expanded Stops */}
                                    {expandedCluster === cluster._id && (
                                        <div className="p-5 divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                            {cluster.orders.map((order, idx) => (
                                                <div key={order._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded">Stop {idx + 1}</span>
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{order.customer?.name}</h4>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                                                            <PhoneIcon className="w-3 h-3" /> {order.customer?.phone}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl md:w-1/3">
                                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Drop-off Items</p>
                                                        <ul className="space-y-1">
                                                            {order.items.map((item, i) => (
                                                                <li key={i} className="text-sm font-medium text-gray-800 dark:text-gray-200 flex justify-between">
                                                                    <span>{item.quantity} {item.unit} {item.productName}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                            {order.paymentStatus === 'COD' ? (
                                                                <p className="text-xs font-bold text-green-700 dark:text-green-400">
                                                                    Collect Cash: ₹{(order.totalAmount || 0) + (order.deliveryFee || 0)} (Total)
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                                                    Collect Cash: ₹{order.deliveryFee || 0} (Delivery Fee Only)
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* ── Standard Subscription Deliveries ── */}
                <section>
                    <div className="mb-6 flex items-center gap-3">
                        <CubeIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Daily Subscription Runs</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Regular daily deliveries (Milk, Add-ons)</p>
                        </div>
                    </div>

                    {cityKeys.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500">No standard subscription deliveries today.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {cityKeys.map(city => (
                                <div key={city} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon className="w-6 h-6 text-primary-500" />
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">{city} Route</h2>
                                        </div>
                                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-bold">
                                            {deliveriesByCity[city].length} Stops
                                        </span>
                                    </div>

                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {deliveriesByCity[city].map((delivery, index) => (
                                            <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wide ${delivery.type === 'Subscription'
                                                            ? 'bg-secondary-100 text-secondary-800 border border-secondary-200'
                                                            : delivery.isAddon
                                                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            }`}>
                                                            {delivery.isAddon ? 'Add-on Order' : delivery.type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{delivery.customer?.name}</h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <PhoneIcon className="w-3 h-3" /> {delivery.customer?.phone || 'No phone'}
                                                            </p>
                                                            {(delivery.deliveryAddress?.street || delivery.customer?.address?.city) && (
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-start gap-1 mt-1">
                                                                    <MapPinIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                    <span>
                                                                        {delivery.deliveryAddress?.street
                                                                            ? `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city} – ${delivery.deliveryAddress.pincode}`
                                                                            : `${delivery.customer?.address?.city || ''}`
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="sm:text-right flex flex-col justify-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg sm:bg-transparent sm:p-0 sm:border-0 border border-gray-100 dark:border-gray-700">
                                                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                                                        {delivery.quantity} <span className="text-sm text-gray-500 font-normal">{delivery.unit}</span>
                                                    </div>
                                                    <p className="font-medium text-gray-900 dark:text-white uppercase tracking-wider text-sm">{delivery.productName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
};

export default FarmerDeliveries;
