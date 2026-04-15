import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import subscriptionService from '../services/subscriptionService';
import { CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, PlusCircleIcon, XMarkIcon, ShoppingBagIcon, ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerSubscriptions = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vacationForms, setVacationForms] = useState({});
    const [cancellingSub, setCancellingSub] = useState(null);
    // Add-on modal state
    const [addonModal, setAddonModal] = useState(null); // { sub, farmerProducts }
    const [addonForm, setAddonForm] = useState({ productId: '', quantity: 1, type: 'one-time', deliveryDate: '', recurringDays: [] });
    const [addonSubmitting, setAddonSubmitting] = useState(false);

    const downloadSubscriptionBill = (sub) => {
        let customerName = 'Customer';
        let customerPhone = '';
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            customerName = user.name || user.fullName || 'Customer';
            customerPhone = user.phone || user.mobile || '';
        } catch (e) { }

        const now = new Date();

        // ── Price: use product.price if populated, otherwise derive from stored daily cost ──
        const unitPrice = sub.product?.price > 0
            ? sub.product.price
            : (sub.productCostPerDay || 0) / (sub.quantityPerDay || 1);

        const pricePerDay = unitPrice * (sub.quantityPerDay || 0);
        const deliveryPerDay = sub.deliveryCostPerDay || 10;
        const milkCost = pricePerDay * 30;
        const deliveryCost = deliveryPerDay * 30;
        const totalMonthly = milkCost + deliveryCost;

        // Indian date formatter DD/MM/YYYY
        const fmtDate = (d) => {
            const dt = new Date(d);
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yyyy = dt.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        };

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // ── Header bar ────────────────────────────────────────────────────────────
        doc.setFillColor(22, 163, 74);
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18); doc.setFont('helvetica', 'bold');
        doc.text('Livestock360', 14, 12);
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text('Fresh from Farm to Door', 14, 19);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text('Subscription Bill', 196, 12, { align: 'right' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${fmtDate(now)}`, 196, 19, { align: 'right' });

        // ── Customer block ────────────────────────────────────────────────────────
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 14, 38);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        doc.text(customerName, 14, 45);
        if (customerPhone) doc.text(`Phone: ${customerPhone}`, 14, 51);

        // ── Status box (right) ────────────────────────────────────────────────────
        const statusColor = sub.status === 'Active' ? [21, 128, 61] : [185, 28, 28];
        doc.setFillColor(249, 250, 251);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(130, 33, 66, 28, 3, 3, 'FD');
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.setTextColor(...statusColor);
        doc.text(`Status: ${sub.status}`, 163, 40, { align: 'center' });
        doc.setTextColor(31, 41, 55);
        doc.text(`Start: ${fmtDate(sub.startDate)}`, 163, 47, { align: 'center' });
        doc.text(`End:   ${fmtDate(sub.endDate)}`, 163, 54, { align: 'center' });

        // Divider
        doc.setDrawColor(229, 231, 235);
        doc.line(14, 62, 196, 62);

        // ── Subscription details table ─────────────────────────────────────────────
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
        doc.text('Subscription Details', 14, 70);

        autoTable(doc, {
            startY: 74,
            head: [['Product', 'Farmer', 'Daily Quantity', 'Unit', 'Rate/Unit']],
            body: [[
                sub.product?.productName || sub.productName || 'Milk',
                sub.farmer?.name || '-',
                `${sub.quantityPerDay}`,
                sub.product?.unit || sub.unit || 'L',
                `Rs.${unitPrice.toFixed(2)}`
            ]],
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9.5 },
            margin: { left: 14, right: 14 },
        });

        // ── Delivery address ──────────────────────────────────────────────────────
        const da = sub.deliveryAddress;
        if (da?.street || da?.city) {
            const addrY = doc.lastAutoTable.finalY + 7;
            doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
            doc.text('Delivery Address:', 14, addrY);
            doc.setFont('helvetica', 'normal');
            const addrLine = [da.street, da.city, da.state, da.pincode].filter(Boolean).join(', ');
            doc.text(addrLine, 14, addrY + 5);
        }

        // ── 30-Day cost breakdown table ───────────────────────────────────────────
        const breakY = doc.lastAutoTable.finalY + ((da?.street || da?.city) ? 19 : 10);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
        doc.text('30-Day Cost Breakdown', 14, breakY);

        autoTable(doc, {
            startY: breakY + 4,
            head: [['Item', 'Calculation', 'Amount']],
            body: [
                ['Milk Cost', `Rs.${unitPrice.toFixed(2)} x ${sub.quantityPerDay} ${sub.unit || 'L'} x 30 days`, `Rs.${milkCost.toFixed(2)}`],
                ['Monthly Delivery', `Rs.${deliveryPerDay.toFixed(2)}/day x 30 days (flat rate)`, `Rs.${deliveryCost.toFixed(2)}`],
                ['Daily Cost', `(Rs.${unitPrice.toFixed(2)} x ${sub.quantityPerDay}) + Rs.${deliveryPerDay.toFixed(2)}`, `Rs.${(pricePerDay + deliveryPerDay).toFixed(2)}/day`],
            ],
            foot: [['', 'Total Monthly', `Rs.${totalMonthly.toFixed(2)}`]],
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold', fontSize: 11 },
            bodyStyles: { fontSize: 9 },
            columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
            margin: { left: 14, right: 14 },
        });

        // ── Daily Delivery Log ────────────────────────────────────────────────────
        const logY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
        doc.text('Daily Delivery Log', 14, logY);

        const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const pausedSet = new Set(
            (sub.pausedDates || []).map(d => {
                const dt = new Date(d);
                return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            })
        );

        const dailyRows = [];
        const start = new Date(sub.startDate);
        const end = new Date(sub.endDate);
        let dayNum = 1;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const skipped = pausedSet.has(key);
            dailyRows.push([
                String(dayNum),
                fmtDate(new Date(d)),
                DAY_NAMES[d.getDay()],
                skipped ? 'SKIPPED' : 'Delivered',
                skipped ? '-' : `${sub.quantityPerDay} ${sub.unit || 'L'}`,
                skipped ? 'Rs.0.00' : `Rs.${(pricePerDay + deliveryPerDay).toFixed(2)}`,
            ]);
            dayNum++;
        }

        const deliveredCount = dailyRows.filter(r => r[3] === 'Delivered').length;
        const skippedCount = dailyRows.filter(r => r[3] === 'SKIPPED').length;
        const totalCharged = deliveredCount * (pricePerDay + deliveryPerDay);
        const totalSaved = skippedCount * (pricePerDay + deliveryPerDay);

        autoTable(doc, {
            startY: logY + 4,
            head: [['#', 'Date', 'Day', 'Status', 'Qty', 'Charged']],
            body: dailyRows,
            foot: [[
                '', '', '',
                `Delivered: ${deliveredCount} | Skipped: ${skippedCount}`,
                '',
                `Rs.${totalCharged.toFixed(2)}`
            ]],
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 26 },
                2: { cellWidth: 14, halign: 'center' },
                3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
                4: { cellWidth: 26, halign: 'center' },
                5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    if (data.cell.raw === 'SKIPPED') {
                        data.cell.styles.textColor = [185, 28, 28];
                        data.cell.styles.fillColor = [254, 242, 242];
                    } else {
                        data.cell.styles.textColor = [21, 128, 61];
                    }
                }
            },
            margin: { left: 14, right: 14 },
        });

        if (skippedCount > 0) {
            const noteY = doc.lastAutoTable.finalY + 5;
            doc.setFontSize(8.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(21, 128, 61);
            doc.text(`You saved Rs.${totalSaved.toFixed(2)} by skipping ${skippedCount} deliveries.`, 14, noteY);
        }

        // ── Add-On Items ──────────────────────────────────────────────────────────
        const activeAddons = (sub.addOns || []).filter(a => a.status !== 'Removed');
        if (activeAddons.length > 0) {
            const addonTitleY = doc.lastAutoTable.finalY + 12;
            doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(31, 41, 55);
            doc.text('Add-On Items', 14, addonTitleY);

            const addonRows = activeAddons.map(a => {
                const schedule = a.type === 'one-time'
                    ? `${t('sub_once_on')} ${fmtDate(a.deliveryDate)}`
                    : `${t('sub_every')} ${(a.recurringDays || []).join(', ')}`;
                return [
                    a.productName || '-',
                    a.type === 'one-time' ? 'One-time' : 'Recurring',
                    schedule,
                    `${a.quantity} ${a.unit || ''}`,
                    `Rs.${(a.costPerDelivery || 0).toFixed(2)}`,
                    a.status,
                ];
            });

            const totalAddonCost = activeAddons.reduce((s, a) => s + (a.costPerDelivery || 0), 0);

            autoTable(doc, {
                startY: addonTitleY + 4,
                head: [['Product', 'Type', 'Schedule', 'Qty', 'Cost/Delivery', 'Status']],
                body: addonRows,
                foot: [['', '', '', '', 'Total Add-Ons', `Rs.${totalAddonCost.toFixed(2)}`]],
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
                footStyles: { fillColor: [239, 246, 255], textColor: [29, 78, 216], fontStyle: 'bold', fontSize: 9 },
                bodyStyles: { fontSize: 8.5 },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 22, halign: 'center' },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
                    5: { cellWidth: 22, halign: 'center' },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 5) {
                        data.cell.styles.textColor = data.cell.raw === 'Active'
                            ? [21, 128, 61] : data.cell.raw === 'Completed'
                                ? [37, 99, 235] : [107, 114, 128];
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
                margin: { left: 14, right: 14 },
            });
        }

        // ── Footer (always on last page) ──────────────────────────────────────────
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(156, 163, 175);
            doc.text(`Page ${i} of ${pageCount}`, 196, 291, { align: 'right' });
            if (i === pageCount) {
                doc.text('This is a computer-generated bill and does not require a signature.', 14, 291);
            }
        }

        const fileName = `Livestock360_Bill_${(sub.product?.productName || sub.productName || 'Subscription').replace(/\s/g, '_')}_${fmtDate(now).replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        toast.success('Bill downloaded!');
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const data = await subscriptionService.getMySubscriptions();
            if (data.success) {
                setSubscriptions(data.data);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            toast.error(error.message || 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const getLocalYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handlePauseTomorrow = async (subId) => {
        // Calculate tomorrow's local date properly
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = getLocalYYYYMMDD(tomorrow);

        try {
            await subscriptionService.pauseSubscriptionDate(subId, { date: tomorrowStr });
            toast.success("Delivery for tomorrow paused successfully!");
            fetchSubscriptions(); // Refresh data
        } catch (error) {
            toast.error(error.message || "Failed to pause delivery");
        }
    };

    const handleResumeTomorrow = async (subId) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = getLocalYYYYMMDD(tomorrow);

        try {
            await subscriptionService.resumeSubscriptionDate(subId, { date: tomorrowStr });
            toast.success("Delivery for tomorrow resumed successfully!");
            fetchSubscriptions(); // Refresh data
        } catch (error) {
            toast.error(error.message || "Failed to resume delivery");
        }
    };

    const handleResumeSpecificDate = async (subId, dateStr) => {
        try {
            await subscriptionService.resumeSubscriptionDate(subId, { date: dateStr });
            toast.success("Delivery resumed for selected date!");
            fetchSubscriptions();
        } catch (error) {
            toast.error(error.message || "Failed to resume delivery");
        }
    };

    const handlePauseRange = async (subId) => {
        const dates = vacationForms[subId];
        if (!dates?.start || !dates?.end) {
            toast.warn("Please select both start and end dates.");
            return;
        }
        try {
            await subscriptionService.pauseSubscriptionRange(subId, { startDate: dates.start, endDate: dates.end });
            toast.success("Vacation dates saved successfully!");
            setVacationForms(prev => ({ ...prev, [subId]: { ...prev[subId], show: false } }));
            fetchSubscriptions();
        } catch (error) {
            toast.error(error.message || "Failed to pause date range");
        }
    };

    const handleCancelVacation = async (subId) => {
        try {
            const response = await subscriptionService.cancelVacationMode(subId);
            toast.success(response.message || "Vacation cancelled successfully!");
            fetchSubscriptions();
        } catch (error) {
            toast.error(error.message || "Failed to cancel vacation");
        }
    };

    const confirmCancelSubscription = async () => {
        if (!cancellingSub) return;
        try {
            const response = await subscriptionService.cancelSubscription(cancellingSub._id);
            toast.success(response.message || "Subscription cancelled successfully!");
            setCancellingSub(null);
            fetchSubscriptions();
        } catch (error) {
            toast.error(error.message || "Failed to cancel subscription");
        }
    };

    const openAddonModal = async (sub) => {
        // Load available products from the same farmer via existing products endpoint
        try {
            const { default: api } = await import('../services/api');
            const res = await api.get(`/products?farmer=${sub.farmer?._id || sub.farmer}`);
            const products = res.data?.data || res.data?.products || [];
            setAddonModal({ sub, farmerProducts: products });
            setAddonForm({ productId: '', quantity: 1, type: 'one-time', deliveryDate: '', recurringDays: [] });
        } catch {
            toast.error('Could not load products for this farmer.');
        }
    };

    const toggleRecurringDay = (day) => {
        setAddonForm(prev => ({
            ...prev,
            recurringDays: prev.recurringDays.includes(day)
                ? prev.recurringDays.filter(d => d !== day)
                : [...prev.recurringDays, day]
        }));
    };

    const handleAddAddon = async () => {
        if (!addonForm.productId) { toast.warn('Please select a product.'); return; }
        setAddonSubmitting(true);
        try {
            const res = await subscriptionService.addAddon(addonModal.sub._id, addonForm);
            toast.success(res.message || 'Extra item added!');
            setAddonModal(null);
            fetchSubscriptions();
        } catch (err) {
            toast.error(err.message || 'Failed to add extra item.');
        } finally {
            setAddonSubmitting(false);
        }
    };

    const handleRemoveAddon = async (subId, addonId) => {
        try {
            await subscriptionService.removeAddon(subId, addonId);
            toast.success('Extra item removed.');
            fetchSubscriptions();
        } catch (err) {
            toast.error(err.message || 'Failed to remove item.');
        }
    };

    const isPastCutoff = () => {
        const now = new Date();
        return now.getHours() >= 22; // 10 PM or later
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 font-sans overflow-x-hidden">
            <div className="max-w-5xl xl:max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6 sm:mb-8 gap-3">
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3">
                        <CalendarDaysIcon className="w-6 h-6 sm:w-8 sm:h-8 text-secondary-500 flex-shrink-0" />
                        <span className="truncate">{t('sub_title_my')}</span>
                    </h1>
                    <button
                        onClick={() => navigate('/customer/products')}
                        className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-2 px-3 sm:px-6 rounded-lg transition duration-200 shadow-md text-sm sm:text-base whitespace-nowrap"
                    >
                        {t('back_products_btn') || 'Back'}
                    </button>
                </div>

                {isPastCutoff() && (
                    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <ClockIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{t('sub_past_cutoff_msg')}</p>
                        </div>
                    </div>
                )}

                {subscriptions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">{t('sub_no_active_msg')}</p>
                        <button
                            onClick={() => navigate('/customer/products')}
                            className="bg-secondary-600 text-white px-6 py-2 rounded-lg hover:bg-secondary-700 transition shadow-md"
                        >
                            {t('sub_subscribe_btn')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {subscriptions.map(sub => {
                            const today = new Date();
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const tomorrowStr = getLocalYYYYMMDD(tomorrow);

                            // Safely compare the local date strings
                            const isPausedTomorrow = sub.pausedDates?.some(d => {
                                const pDate = new Date(d);
                                return getLocalYYYYMMDD(pDate) === tomorrowStr;
                            });
                            const isActive = sub.status === 'Active';

                            return (
                                <div key={sub._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4 sm:p-6 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-5 sm:gap-6">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {sub.product?.productName || 'Milk Subscription'}
                                                    {sub.status === 'Cancelled' && (
                                                        <span className="ml-3 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full uppercase tracking-wider">{t('sub_status_cancelled')}</span>
                                                    )}
                                                </h3>
                                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                                    Farmer: {sub.farmer?.name}
                                                    {sub.timing && (
                                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                            {sub.timing}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {sub.status === 'Active' && (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-800">
                                                    {t('sub_status_active')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
                                            <div className="bg-gray-50 dark:bg-gray-700/40 p-2.5 sm:p-3 rounded-xl border border-transparent dark:border-gray-700/50">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase tracking-wider truncate">{t('sub_daily_delivery')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">{sub.quantityPerDay} {sub.product?.unit}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/40 p-2.5 sm:p-3 rounded-xl border border-transparent dark:border-gray-700/50">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase tracking-wider truncate">{t('sub_start_date')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">{new Date(sub.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/40 p-2.5 sm:p-3 rounded-xl border border-transparent dark:border-gray-700/50">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase tracking-wider truncate">{t('sub_end_date')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">{new Date(sub.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-secondary-50 dark:bg-secondary-900/20 p-2.5 sm:p-3 rounded-xl border border-secondary-100 dark:border-secondary-800/50">
                                                {(() => {
                                                    const dailyCost = (sub.productCostPerDay || 0) + (sub.deliveryCostPerDay || 0);
                                                    const totalDays = Math.ceil(
                                                        (new Date(sub.endDate) - new Date(sub.startDate)) / (1000 * 60 * 60 * 24)
                                                    ) + 1;
                                                    const pausedDays = sub.pausedDates?.length || 0;
                                                    const billableDays = Math.max(0, totalDays - pausedDays);
                                                    const savedAmount = pausedDays * dailyCost;
                                                    const billAmount = billableDays * dailyCost;
                                                    return (
                                                        <>
                                                            <p className="text-[10px] text-secondary-600 dark:text-secondary-400 mb-1 font-bold uppercase tracking-wider truncate">{t('sub_monthly_bill')}</p>
                                                            <p className="font-extrabold text-secondary-700 dark:text-secondary-300 text-sm sm:text-base">
                                                                ₹{billAmount.toFixed(0)}
                                                            </p>
                                                            {pausedDays > 0 && (
                                                                <div className="inline-block mt-1 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-700 dark:text-green-400">
                                                                    {t('sub_saved')} ₹{savedAmount.toFixed(0)}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {sub.pausedDates?.length > 0 && sub.status === 'Active' && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('sub_paused_dates')} ({sub.pausedDates.length})</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sub.pausedDates.map((date, idx) => {
                                                        return (
                                                            <div key={idx} className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800 flex items-center group">
                                                                <span>{new Date(date).toLocaleDateString()}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {sub.status === 'Cancelled' && sub.refundAmount !== undefined && (
                                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                                                <p className="text-sm text-red-800 dark:text-red-200">
                                                    <strong>{t('sub_cancelled_on')}</strong> {new Date(sub.cancelledAt || sub.updatedAt).toLocaleDateString()}<br />
                                                    <strong>{t('sub_refund_wallet')}</strong> ₹{sub.refundAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Add-Ons Display */}
                                        {sub.addOns?.filter(a => a.status === 'Active').length > 0 && (
                                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">{t('sub_extra_deliveries')}</p>
                                                <div className="space-y-2">
                                                    {sub.addOns.filter(a => a.status === 'Active').map(addon => (
                                                        <div key={addon._id} className="flex items-center justify-between bg-secondary-50 dark:bg-secondary-900/20 px-3 py-2 rounded-lg border border-secondary-100 dark:border-secondary-800/50">
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{addon.productName}</p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                    {addon.quantity}{addon.unit} · ₹{addon.costPerDelivery.toFixed(2)} ·{' '}
                                                                    {addon.type === 'one-time'
                                                                        ? `${t('sub_once_on')} ${new Date(addon.deliveryDate).toLocaleDateString()}`
                                                                        : `${t('sub_every')} ${addon.recurringDays.join(', ')}`
                                                                    }
                                                                </p>
                                                            </div>
                                                            {isActive && (
                                                                <button onClick={() => handleRemoveAddon(sub._id, addon._id)} className="ml-3 text-gray-400 hover:text-red-500 transition flex-shrink-0">
                                                                    <XMarkIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {isActive && (
                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50 flex-wrap gap-2">
                                                <button
                                                    onClick={() => openAddonModal(sub)}
                                                    className="flex items-center gap-2 text-sm font-bold text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 transition"
                                                >
                                                    <PlusCircleIcon className="w-5 h-5" />{t('sub_add_extra_items')}</button>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => downloadSubscriptionBill(sub)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition"
                                                    >
                                                        <ArrowDownTrayIcon className="w-4 h-4" />{t('sub_download_bill')}</button>
                                                    <button
                                                        onClick={() => setCancellingSub(sub)}
                                                        className="text-xs font-bold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition underline underline-offset-2"
                                                    >{t('sub_cancel_subscription')}</button>
                                                </div>
                                            </div>
                                        )}
                                        {!isActive && sub.status === 'Cancelled' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                                <button
                                                    onClick={() => downloadSubscriptionBill(sub)}
                                                    className="flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition"
                                                >
                                                    <ArrowDownTrayIcon className="w-4 h-4" />{t('sub_download_final_bill')}</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Container */}
                                    {isActive && (
                                        <div className="border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-5 md:pt-0 md:pl-6 lg:pl-8 flex flex-col justify-start w-full md:w-[240px] lg:w-[280px] flex-shrink-0">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-left">{t('sub_smart_controls')}</h4>

                                            {isPausedTomorrow ? (
                                                <div className="space-y-3 mb-4">
                                                    <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl text-sm flex items-center gap-2 border border-green-200 dark:border-green-800/50 shadow-sm">
                                                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                                                        <span className="font-medium">{t('sub_tomorrow_paused_msg')}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleResumeTomorrow(sub._id)}
                                                        disabled={!isActive || isPastCutoff()}
                                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 sm:py-3.5 px-3 sm:px-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                                                    >{t('sub_resume_tomorrow')}</button>
                                                </div>
                                            ) : (
                                                <div className="mb-4">
                                                    <button
                                                        onClick={() => handlePauseTomorrow(sub._id)}
                                                        disabled={!isActive || isPastCutoff()}
                                                        className="w-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-800/40 text-red-600 dark:text-red-400 font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm sm:text-base"
                                                    >
                                                        <ExclamationTriangleIcon className="w-5 h-5 group-hover:animate-pulse" />{t('sub_skip_tomorrow')}</button>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left leading-relaxed">
                                                {isPastCutoff() && !isPausedTomorrow ? (
                                                    <span className="text-orange-500">{t('sub_cutoff_passed_desc')}</span>
                                                ) : t('sub_pause_desc')}
                                            </p>

                                            {/* Vacation Mode UI */}
                                            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60">
                                                {sub.pausedDates?.length > 1 && (
                                                    <button
                                                        onClick={() => handleCancelVacation(sub._id)}
                                                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3 text-[13px] sm:text-base"
                                                    >{t('sub_end_vacation')}</button>
                                                )}

                                                {!vacationForms[sub._id]?.show ? (
                                                    <button
                                                        onClick={() => setVacationForms(prev => ({
                                                            ...prev,
                                                            [sub._id]: { ...prev[sub._id], show: true }
                                                        }))}
                                                        className="w-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-800/40 border border-primary-200 dark:border-primary-800/50 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm shadow-sm"
                                                    >
                                                        <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />{t('sub_pause_multiple')}</button>
                                                ) : (
                                                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden relative">
                                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                                                            <h5 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                                <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                                                                {t('sub_vacation_mode')}
                                                            </h5>
                                                            <button
                                                                onClick={() => setVacationForms(prev => ({
                                                                    ...prev, [sub._id]: { ...prev[sub._id], show: false }
                                                                }))}
                                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        <div className="p-4">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex justify-between">
                                                                        <span>{t('sub_from_date')}</span>
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        className="w-full text-sm font-medium p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-gray-800 dark:text-white"
                                                                        min={getLocalYYYYMMDD(new Date(new Date().setDate(new Date().getDate() + 1)))}
                                                                        value={vacationForms[sub._id]?.start || ''}
                                                                        onChange={(e) => setVacationForms(prev => ({
                                                                            ...prev, [sub._id]: { ...prev[sub._id], start: e.target.value }
                                                                        }))}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex justify-between">
                                                                        <span>{t('sub_to_date')}</span>
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        className="w-full text-sm font-medium p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-gray-800 dark:text-white"
                                                                        min={vacationForms[sub._id]?.start || getLocalYYYYMMDD(new Date(new Date().setDate(new Date().getDate() + 1)))}
                                                                        value={vacationForms[sub._id]?.end || ''}
                                                                        onChange={(e) => setVacationForms(prev => ({
                                                                            ...prev, [sub._id]: { ...prev[sub._id], end: e.target.value }
                                                                        }))}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handlePauseRange(sub._id)}
                                                                disabled={!isActive}
                                                                className="w-full bg-primary-600 text-white font-bold py-3 mt-5 rounded-xl text-sm hover:bg-primary-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >{t('sub_confirm_dates')}</button>
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

            {/* Cancellation Confirmation Modal */}
            {cancellingSub && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                            {t('sub_cancel_modal_title')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-5 text-sm leading-relaxed">
                            {t('sub_cancel_modal_desc1')} <strong>{cancellingSub.product?.productName || 'Milk'}</strong> subscription?
                            This action cannot be undone. Any unused prepaid balance will be instantly
                            refunded to your <strong>{t('sub_cancel_modal_wallet')}</strong>.
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-6">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                                {t('sub_cancel_modal_note')}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end items-center">
                            <button
                                onClick={() => setCancellingSub(null)}
                                className="px-5 py-2.5 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-sm"
                            >{t('sub_close')}</button>
                            <button
                                onClick={confirmCancelSubscription}
                                className="px-5 py-2.5 font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-md transition text-sm"
                            >{t('sub_confirm_cancel')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Extra Items Modal */}
            {addonModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center p-0 sm:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('sub_add_extra_items')}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">From {addonModal.sub.farmer?.name}'s farm</p>
                            </div>
                            <button onClick={() => setAddonModal(null)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Product Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Product</label>
                                {addonModal.farmerProducts.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No other products available from this farmer.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {addonModal.farmerProducts.map(p => (
                                            <button
                                                key={p._id}
                                                onClick={() => setAddonForm(prev => ({ ...prev, productId: p._id }))}
                                                className={`text-left px-3 py-2.5 rounded-xl border-2 transition text-sm ${addonForm.productId === p._id
                                                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                                    }`}
                                            >
                                                <p className="font-bold truncate">{p.productName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">₹{p.price}/{p.unit}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={addonForm.quantity}
                                    onChange={e => setAddonForm(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition text-gray-900 dark:text-white font-bold"
                                />
                            </div>

                            {/* Type Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Delivery Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['one-time', 'recurring'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setAddonForm(prev => ({ ...prev, type: t, deliveryDate: '', recurringDays: [] }))}
                                            className={`py-2.5 rounded-xl text-sm font-bold border-2 transition ${addonForm.type === t
                                                ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            {t === 'one-time' ? 'One-Time Only' : 'Recurring Weekly'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* One-time: date picker */}
                            {addonForm.type === 'one-time' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Delivery Date</label>
                                    <input
                                        type="date"
                                        value={addonForm.deliveryDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setAddonForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 outline-none transition text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}

                            {/* Recurring: day-of-week picker */}
                            {addonForm.type === 'recurring' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Deliver These Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <button
                                                key={day}
                                                onClick={() => toggleRecurringDay(day)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition border-2 ${addonForm.recurringDays.includes(day)
                                                    ? 'border-secondary-500 bg-secondary-500 text-white'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-secondary-300'}`}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cost preview */}
                            {addonForm.productId && (
                                <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-xl px-4 py-3 border border-secondary-100 dark:border-secondary-800">
                                    <p className="text-xs text-secondary-700 dark:text-secondary-300 font-medium">
                                        Cost per delivery: <strong>₹{
                                            ((addonModal.farmerProducts.find(p => p._id === addonForm.productId)?.price || 0) * (parseFloat(addonForm.quantity) || 0)).toFixed(2)
                                        }</strong>
                                        {addonForm.type === 'recurring' && addonForm.recurringDays.length > 0 && (
                                            <span> · <strong>{addonForm.recurringDays.length}x/week</strong></span>
                                        )}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleAddAddon}
                                disabled={addonSubmitting || !addonForm.productId}
                                className="w-full py-4 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addonSubmitting ? 'Adding...' : '+ Confirm Extra Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSubscriptions;
