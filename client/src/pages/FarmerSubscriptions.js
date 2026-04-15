import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
};

const FarmerSubscriptions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const params = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
        const res = await api.get(`/subscriptions/farmer${params}`);
        if (res.data.success) setSubscriptions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [statusFilter]);

  const filtered = subscriptions.filter(sub => {
    const q = searchQuery.toLowerCase();
    return (
      sub.customer?.name?.toLowerCase().includes(q) ||
      sub.productName?.toLowerCase().includes(q)
    );
  });

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
  const formatDateShort = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

  const toggleExpand = id => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-4 md:p-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 mb-2"
            >
              ← {t('sub_back_dashboard')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">
              {t('sub_title_customer')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {subscriptions.length} {subscriptions.length !== 1 ? t('sub_subscriptions_found') : t('sub_subscription_found')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder={t('sub_search_placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
          />
          <div className="flex gap-2">
            {['All', 'Active', 'Cancelled', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  statusFilter === s
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {s === 'All' ? t('sub_filter_all') : t('sub_status_' + s.toLowerCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium">{t('sub_no_found')}</p>
            <p className="text-sm mt-1">{t('sub_try_filter')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => {
              const isExpanded = expandedId === sub._id;
              const activeAddOns = (sub.addOns || []).filter(a => a.status === 'Active');

              return (
                <div
                  key={sub._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Main row */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleExpand(sub._id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Customer + Product */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white text-base">
                            {sub.customer?.name || '—'}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[sub.status] || ''}`}>
                            {t(`sub_status_${sub.status.toLowerCase()}`)}
                          </span>
                          {sub.tomorrowSkipped && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              ⏭ {t('sub_skipped_tomorrow')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{sub.productName} &middot; {sub.quantityPerDay} {sub.unit}/day</span>
                          {sub.timing && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {sub.timing}
                            </span>
                          )}
                        </p>
                        {sub.customer?.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">📞 {sub.customer.phone}</p>
                        )}
                      </div>

                      {/* Dates + Cost */}
                      <div className="flex gap-6 text-right shrink-0">
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{t('sub_period')}</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {formatDateShort(sub.startDate)} – {formatDateShort(sub.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{t('sub_daily')}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₹{sub.productCostPerDay?.toFixed(0)}
                          </p>
                        </div>
                        {activeAddOns.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{t('sub_addons')}</p>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {activeAddOns.length} 📦
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-gray-400 shrink-0 hidden sm:block">
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded section */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 px-5 pb-5 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Delivery Address */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('sub_delivery_address')}</h4>
                          {sub.deliveryAddress?.street ? (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {sub.deliveryAddress.street}, {sub.deliveryAddress.city}<br />
                              {sub.deliveryAddress.state} – {sub.deliveryAddress.pincode}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">{t('sub_no_address')}</p>
                          )}
                        </div>

                        {/* Paused Dates (upcoming only) */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('sub_upcoming_skips')}</h4>
                          {(() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const upcoming = (sub.pausedDates || [])
                              .filter(d => new Date(d) >= today)
                              .sort((a, b) => new Date(a) - new Date(b))
                              .slice(0, 5);
                            return upcoming.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {upcoming.map((d, i) => (
                                  <span key={i} className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-2 py-1 rounded-lg">
                                    {formatDate(d)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">{t('sub_no_skips')}</p>
                            );
                          })()}
                        </div>

                        {/* Add-Ons */}
                        {activeAddOns.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('sub_active_addons')}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeAddOns.map(addon => (
                                <div key={addon._id} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{addon.productName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {addon.quantity} {addon.unit} &middot; ₹{addon.costPerDelivery}
                                    </p>
                                  </div>
                                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                    addon.type === 'recurring'
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                      : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                  }`}>
                                    {addon.type === 'recurring' ? `🔄 ${t('sub_type_recurring')}` : `1️⃣ ${t('sub_type_onetime')}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerSubscriptions;
