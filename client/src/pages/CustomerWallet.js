import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import walletService from '../services/walletService';
import { WalletIcon, ArrowsRightLeftIcon, PlusCircleIcon, ArrowDownRightIcon, ArrowUpRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerWallet = () => {
    const { t } = useTranslation();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const data = await walletService.getWalletDashboard();
            if (data.success) {
                setBalance(data.data.balance);
                setTransactions(data.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
            toast.error(error.message || 'Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        const amount = parseFloat(addAmount);

        if (!amount || amount < 100) {
            toast.error("Please enter an amount of at least ₹100");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await walletService.addFunds(amount);
            if (data.success) {
                toast.success(data.message);
                setShowAddFundsModal(false);
                setAddAmount('');
                fetchWalletData(); // Refresh UI
            }
        } catch (error) {
            toast.error(error.message || "Failed to add funds");
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadStatement = () => {
        // ── Customer info from localStorage ──────────────────────────────────────
        let customerName = 'Customer';
        let customerPhone = '';
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            customerName = user.name || user.fullName || 'Customer';
            customerPhone = user.phone || user.mobile || '';
        } catch (e) { }

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // ── Brand header bar ──────────────────────────────────────────────────────
        doc.setFillColor(22, 163, 74);   // primary green
        doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Livestock360', 14, 12);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Fresh from Farm to Door', 14, 19);
        doc.setFontSize(10);
        doc.text('Wallet Statement', 196, 12, { align: 'right' });
        doc.text(dateStr, 196, 19, { align: 'right' });

        // ── Customer block ────────────────────────────────────────────────────────
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Prepared for:', 14, 38);
        doc.setFont('helvetica', 'normal');
        doc.text(customerName, 14, 44);
        if (customerPhone) doc.text(`Phone: ${customerPhone}`, 14, 50);

        // ── Balance summary box ───────────────────────────────────────────────────
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(167, 243, 208);
        doc.roundedRect(120, 33, 76, 22, 3, 3, 'FD');
        doc.setTextColor(21, 128, 61);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Current Wallet Balance', 158, 40, { align: 'center' });
        doc.setFontSize(18);
        doc.text(`Rs.${balance.toFixed(2)}`, 158, 50, { align: 'center' });

        // ── Transaction table ─────────────────────────────────────────────────────
        const totalCredit = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
        const totalDebit = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);

        const rows = transactions.map(tx => [
            new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            tx.description,
            tx.type === 'CREDIT' ? 'Credit' : 'Debit',
            `Rs.${tx.amount.toFixed(2)}`,
            `Rs.${tx.balanceAfter.toFixed(2)}`
        ]);

        doc.setTextColor(31, 41, 55);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Transaction History', 14, 64);

        autoTable(doc, {
            startY: 68,
            head: [['Date', 'Time', 'Description', 'Type', 'Amount', 'Balance']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
            columnStyles: {
                0: { cellWidth: 24 },
                1: { cellWidth: 16 },
                2: { cellWidth: 75 },
                3: { cellWidth: 18 },
                4: { cellWidth: 24, halign: 'right' },
                5: { cellWidth: 26, halign: 'right' },
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    data.cell.styles.textColor = data.cell.raw === 'Credit' ? [21, 128, 61] : [185, 28, 28];
                    data.cell.styles.fontStyle = 'bold';
                }
                if (data.section === 'body' && data.column.index === 4) {
                    const isCredit = rows[data.row.index]?.[3] === 'Credit';
                    data.cell.styles.textColor = isCredit ? [21, 128, 61] : [185, 28, 28];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
            margin: { left: 14, right: 14 },
        });

        // ── Totals footer ─────────────────────────────────────────────────────────
        const finalY = doc.lastAutoTable.finalY + 8;
        doc.setFillColor(249, 250, 251);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(14, finalY, 182, 22, 2, 2, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(21, 128, 61);
        doc.text(`Total Credits: Rs.${totalCredit.toFixed(2)}`, 22, finalY + 8);
        doc.setTextColor(185, 28, 28);
        doc.text(`Total Debits: Rs.${totalDebit.toFixed(2)}`, 22, finalY + 15);
        doc.setTextColor(31, 41, 55);
        doc.text(`Net Balance: Rs.${balance.toFixed(2)}`, 186, finalY + 11, { align: 'right' });

        // ── Footer note ───────────────────────────────────────────────────────────
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(156, 163, 175);
        doc.text('This is a computer-generated statement and does not require a signature.', 105, 287, { align: 'center' });
        doc.text('Livestock360 | Fresh from Farm to Door', 105, 291, { align: 'center' });

        doc.save(`Livestock360_Statement_${now.toISOString().split('T')[0]}.pdf`);
        toast.success('Statement downloaded!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Balance Card */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <WalletIcon className="w-64 h-64 -mt-10 -mr-10" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-primary-100 font-medium uppercase tracking-wider text-sm mb-2">Livestock360 Wallet Balance</p>
                            <h1 className="text-5xl sm:text-6xl font-black drop-shadow-sm">₹{balance.toFixed(2)}</h1>
                            <p className="mt-4 text-primary-100/80 text-sm max-w-sm">Funds are automatically deducted daily for your active subscriptions.</p>
                        </div>
                        <button
                            onClick={() => setShowAddFundsModal(true)}
                            className="bg-white text-primary-700 hover:bg-gray-50 font-bold py-3.5 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
                        >
                            <PlusCircleIcon className="w-6 h-6" />
                            Add Funds
                        </button>
                    </div>
                </div>

                {/* Ledger / Transactions List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <ArrowsRightLeftIcon className="w-6 h-6 text-gray-400" />
                            Transaction History
                        </h2>
                        <button
                            onClick={downloadStatement}
                            disabled={transactions.length === 0}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download Statement
                        </button>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No transactions yet. Add funds to get started!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full flex-shrink-0 ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {tx.type === 'CREDIT' ? <ArrowDownRightIcon className="w-5 h-5" /> : <ArrowUpRightIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{tx.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {new Date(tx.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto pl-12 sm:pl-0">
                                        <p className={`font-black text-lg ${tx.type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Balance: ₹{tx.balanceAfter.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Funds Modal */}
            {showAddFundsModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="p-6 sm:p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recharge Wallet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter the amount you wish to add to your Livestock360 wallet.</p>

                            <form onSubmit={handleAddFunds}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            min="100"
                                            autoFocus
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-0 focus:border-primary-500 transition-colors text-lg font-bold text-gray-900 dark:text-white outline-none"
                                            placeholder="500"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {[500, 1000, 2000].map(preset => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setAddAmount(preset.toString())}
                                                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-1.5 px-4 rounded-lg text-sm font-bold transition"
                                            >
                                                ₹{preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                                        * Developer Note: This is an unlinked mock payment gateway. Clicking proceed will instantly grant funds for testing.
                                    </p>
                                </div>

                                <div className="flex gap-3 align-middle">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddFundsModal(false)}
                                        className="w-1/3 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Processing...' : `Proceed to Pay`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerWallet;
