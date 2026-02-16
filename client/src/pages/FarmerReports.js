import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
  CurrencyRupeeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartPieIcon,
  BanknotesIcon,
  UserGroupIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const FarmerReports = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/monthly', {
        params: { month: selectedMonth, year: selectedYear }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      // toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const monthName = months.find(m => m.value === parseInt(selectedMonth))?.label;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('Livestock360 - Monthly Profit Report', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${monthName} ${selectedYear}`, 14, 30);
    doc.line(14, 35, 196, 35);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Financial Summary', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Category', 'Amount (INR)']],
      body: [
        ['Total Revenue', `${reportData.revenue.total.toLocaleString()}`],
        ['  - Milk Sales', `${reportData.revenue.milk.toLocaleString()}`],
        ['  - Product Sales', `${reportData.revenue.products.toLocaleString()}`],
        ['Total Expenses (Staff)', `${reportData.expenses.total.toLocaleString()}`],
        ['Net Profit', `${reportData.netProfit.toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] }, // Green header
      styles: { fontSize: 12 }
    });

    // Staff Breakdown
    if (reportData.details.staffDetails.length > 0) {
      doc.text('Staff Expense Breakdown', 14, doc.lastAutoTable.finalY + 15);

      const staffRows = reportData.details.staffDetails.map(staff => [
        staff.name,
        staff.role,
        staff.wageType,
        `${staff.amount.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Name', 'Role', 'Wage Type', 'Amount (INR)']],
        body: staffRows,
        theme: 'striped'
      });
    }

    // Product Sales Breakdown
    if (reportData.details.productSales.length > 0) {
      doc.text('Product Sales Breakdown', 14, doc.lastAutoTable.finalY + 15);

      const productRows = reportData.details.productSales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        sale.productName,
        `${sale.quantity} ${sale.unit}`,
        `${sale.total.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Product', 'Quantity', 'Amount (INR)']],
        body: productRows,
        theme: 'striped'
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 285);
    }

    doc.save(`Livestock360_Report_${monthName}_${selectedYear}.pdf`);
  };

  const pieData = reportData ? {
    labels: ['Milk Revenue', 'Product Sales', 'Staff Expenses'],
    datasets: [
      {
        data: [
          reportData.revenue.milk,
          reportData.revenue.products,
          reportData.expenses.staff
        ],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)', // Emerald
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(239, 68, 68, 0.8)',  // Red
        ],
        borderColor: [
          'rgba(52, 211, 153, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pt-20 transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/farmer/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Monthly Profit Report</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your farm's financial performance</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={generatePDF}
              disabled={!reportData || loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹ {reportData.revenue.total.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <CurrencyRupeeIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 flex gap-4">
                  <span>Milk: ₹{reportData.revenue.milk.toLocaleString()}</span>
                  <span>Products: ₹{reportData.revenue.products.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      ₹ {reportData.expenses.total.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    <UserGroupIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <span>Staff Wages & Salaries</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
                    <h3 className={`text-2xl font-bold mt-1 ${reportData.netProfit >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600'}`}>
                      ₹ {reportData.netProfit.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <span>{reportData.netProfit >= 0 ? 'Profitable Month' : 'Operating at Loss'}</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChartPieIcon className="w-5 h-5 text-gray-500" />
                  Revenue vs Expenses Breakdown
                </h3>
                <div className="h-64 flex justify-center">
                  {pieData && <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Days with Milk Production</span>
                    <span className="font-bold text-gray-900 dark:text-white">{reportData.details.milkProductionCount}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Total Product Sales</span>
                    <span className="font-bold text-gray-900 dark:text-white">{reportData.details.productSalesCount}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Active Staff Paid</span>
                    <span className="font-bold text-gray-900 dark:text-white">{reportData.details.staffCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Staff Expenses Detail</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Wage Type</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {reportData.details.staffDetails.length > 0 ? (
                      reportData.details.staffDetails.map((staff, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{staff.name}</td>
                          <td className="px-6 py-4">{staff.role}</td>
                          <td className="px-6 py-4 capitalize">{staff.wageType}</td>
                          <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400">
                            ₹ {staff.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No staff expenses recorded for this month.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            Select a month and year to view the report.
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerReports;
