import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import farmerService from '../services/farmerService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FarmerStaff = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    attendancePercentage: 0,
    presentCount: 0,
    estimatedMonthlyExpense: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    salary: '',
    wageType: 'monthly',
    dateOfJoining: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({}); // { staffId: status }

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth()); // 0-11

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        farmerService.getStaffList(),
        farmerService.getDashboardStats()
      ]);

      setStaffList(listRes.data || []);
      setStats(statsRes.data || {
        totalStaff: 0,
        attendancePercentage: 0,
        presentCount: 0,
        estimatedMonthlyExpense: 0
      });
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      phone: '',
      salary: '',
      wageType: 'monthly',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setEditingStaff(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await farmerService.updateStaff(editingStaff._id, formData);
        setSuccess('Staff updated successfully');
      } else {
        await farmerService.createStaff(formData);
        setSuccess(t('staff_added_msg') || 'Staff added successfully');
      }
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save staff');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (staff) => {
    setFormData({
      name: staff.name,
      role: staff.role || '',
      phone: staff.phone || '',
      salary: staff.salary || '',
      wageType: staff.wageType || 'monthly',
      dateOfJoining: staff.dateOfJoining ? new Date(staff.dateOfJoining).toISOString().split('T')[0] : '',
      status: staff.status || 'active'
    });
    setEditingStaff(staff);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await farmerService.deleteStaff(id);
      setSuccess(t('staff_deleted_msg') || 'Staff deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete staff');
    }
  };

  useEffect(() => {
    if (showAttendanceModal) {
      loadAttendanceForDate(attendanceDate);
    }
  }, [attendanceDate, showAttendanceModal, staffList]);

  const loadAttendanceForDate = (date) => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const newAttendanceData = {};

    staffList.forEach(staff => {
      // Find attendance for this date
      const record = staff.attendance.find(a => {
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === selectedDate.getTime();
      });

      if (record) {
        newAttendanceData[staff._id] = record.status;
      } else if (staff.status === 'active') {
        // Default to present for active staff if no record exists
        newAttendanceData[staff._id] = 'present';
      }
    });

    setAttendanceData(newAttendanceData);
  };

  const initAttendance = () => {
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setShowAttendanceModal(true);
  };

  const handleAttendanceChange = (staffId, status) => {
    setAttendanceData(prev => ({ ...prev, [staffId]: status }));
  };

  const submitAttendance = async () => {
    try {
      // Process all attendance concurrently
      const promises = Object.entries(attendanceData).map(([id, status]) => {
        return farmerService.addAttendance(id, {
          date: attendanceDate,
          status: status
        });
      });

      await Promise.all(promises);
      setSuccess(t('attendance_marked_msg') || 'Attendance marked successfully');
      setShowAttendanceModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
    }
  };

  // Report Generation Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getReportData = () => {
    const daysInMonth = getDaysInMonth(reportYear, reportMonth);

    return staffList.map(staff => {
      // Filter attendance for selected month
      const monthlyAttendance = staff.attendance.filter(a => {
        const d = new Date(a.date);
        return d.getFullYear() === parseInt(reportYear) && d.getMonth() === parseInt(reportMonth);
      });

      const presentCount = monthlyAttendance.filter(a => a.status === 'present').length;
      const halfDayCount = monthlyAttendance.filter(a => a.status === 'half-day').length;
      const effectiveDays = presentCount + (halfDayCount * 0.5);

      let payableAmount = 0;
      if (staff.wageType === 'daily') {
        payableAmount = effectiveDays * staff.salary;
      } else {
        // Monthly Pro-rata: (Salary / DaysInMonth) * EffectiveDays
        const dailyRate = staff.salary / daysInMonth;
        payableAmount = effectiveDays * dailyRate;
      }

      return {
        name: staff.name,
        role: staff.role,
        wageType: staff.wageType,
        rate: staff.salary,
        present: presentCount,
        halfDays: halfDayCount,
        payable: Math.round(payableAmount)
      };
    });
  };

  const downloadCSV = () => {
    const data = getReportData();
    const monthName = new Date(reportYear, reportMonth).toLocaleString('default', { month: 'long' });

    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Staff Name,Role,Wage Type,Rate,Days Present,Half Days,Total Payable\n";

    // Rows
    data.forEach(row => {
      csvContent += `"${row.name}","${row.role}",${row.wageType},${row.rate},${row.present},${row.halfDays},${row.payable}\n`;
    });

    // Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Report_${monthName}_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    try {
      const data = getReportData();
      const monthName = new Date(reportYear, reportMonth).toLocaleString('default', { month: 'long' });
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text(`Staff Attendance & Salary Report`, 14, 22);
      doc.setFontSize(12);
      doc.text(`${monthName} ${reportYear}`, 14, 32);

      // Table
      const tableColumn = ["Name", "Role", "Wage Type", "Rate", "Present", "Half Days", "Payable"];
      const tableRows = [];

      data.forEach(row => {
        const rowData = [
          row.name,
          row.role,
          row.wageType,
          row.rate,
          row.present,
          row.halfDays,
          row.payable
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });

      doc.save(`Staff_Report_${monthName}_${reportYear}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t('back_dashboard_btn')}
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t('staff_management_title')}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm md:text-base">{t('staff_management_subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 text-sm md:text-base whitespace-nowrap"
            >
              {t('download_report_btn')}
            </button>
            <button
              onClick={initAttendance}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 text-sm md:text-base whitespace-nowrap"
            >
              {t('mark_attendance_btn')}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 text-sm md:text-base whitespace-nowrap"
            >
              {t('add_staff_btn')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('stat_total_staff')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalStaff}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('stat_present_today')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.presentCount}</p>
            <p className="text-xs text-green-500 mt-1">{stats.attendancePercentage}% Attendance</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('stat_est_expense')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{stats.estimatedMonthlyExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('stat_active_workers')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {staffList.filter(s => s.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('download_report_title')}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('year_label')}</label>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {[...Array(5)].map((_, i) => (
                        <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('month_label')}</label>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={downloadCSV}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {t('download_csv_btn')}
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    {t('download_pdf_btn')}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    {t('close_btn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingStaff ? t('edit_staff_title') : t('add_staff_title')}
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name_label')} *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role_label')} *</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">{t('select_role')}</option>
                        <option value="Milker">{t('role_milker')}</option>
                        <option value="Livestock Caretaker">{t('role_caretaker')}</option>
                        <option value="Farm Supervisor">{t('role_supervisor')}</option>
                        <option value="Veterinary Assistant">{t('role_vet_assistant')}</option>
                        <option value="Feed Manager">{t('role_feed_manager')}</option>
                        <option value="Cleaning & Maintenance Worker">{t('role_cleaner')}</option>
                        <option value="Milk Collection Assistant">{t('role_milk_assistant')}</option>
                        <option value="Delivery Helper">{t('role_delivery')}</option>
                        <option value="Storekeeper">{t('role_storekeeper')}</option>
                        <option value="General Farm Worker">{t('role_general')}</option>
                        <option value="Other">{t('role_other')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_label')}</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('joining_date_label')}</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wage_type_label')}</label>
                      <select
                        name="wageType"
                        value={formData.wageType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="monthly">{t('wage_monthly')}</option>
                        <option value="daily">{t('wage_daily')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('salary_label')}</label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status_label')}</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="active">{t('status_active')}</option>
                        <option value="inactive">{t('status_inactive')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      {t('cancel_btn')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {editingStaff ? t('update_staff_btn') : t('add_staff_btn')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('mark_attendance_title')}</h2>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="mt-2 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="p-6 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                      <th className="pb-3">{t('staff_name_th')}</th>
                      <th className="pb-3">{t('role_label')}</th>
                      <th className="pb-3">{t('status_label')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {staffList.filter(s => {
                      // 1. Must be active
                      if (s.status !== 'active') return false;

                      // 2. Attendance date must be >= Joining Date
                      if (s.dateOfJoining) {
                        const selectedDateIndex = new Date(attendanceDate).setHours(0, 0, 0, 0);
                        const joinDateIndex = new Date(s.dateOfJoining).setHours(0, 0, 0, 0);
                        if (selectedDateIndex < joinDateIndex) return false;
                      }
                      return true;
                    }).map(staff => (
                      <tr key={staff._id} className="text-gray-900 dark:text-white">
                        <td className="py-4">{staff.name}</td>
                        <td className="py-4 text-sm text-gray-500">{staff.role}</td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAttendanceChange(staff._id, 'present')}
                              className={`px-3 py-1 rounded-full text-sm ${attendanceData[staff._id] === 'present' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {t('attendance_present')}
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(staff._id, 'absent')}
                              className={`px-3 py-1 rounded-full text-sm ${attendanceData[staff._id] === 'absent' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {t('attendance_absent')}
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(staff._id, 'half-day')}
                              className={`px-3 py-1 rounded-full text-sm ${attendanceData[staff._id] === 'half-day' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500' : 'bg-gray-100 text-gray-600'}`}
                            >
                              {t('attendance_half_day')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 bg-gray-50 dark:bg-gray-900">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  {t('cancel_btn')}
                </button>
                <button
                  onClick={submitAttendance}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('save_attendance_btn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3">{t('name_label')}</th>
                  <th className="px-6 py-3">{t('role_label')}</th>
                  <th className="px-6 py-3">{t('phone_label')}</th>
                  <th className="px-6 py-3">{t('th_wage')}</th>
                  <th className="px-6 py-3">{t('status_label')}</th>
                  <th className="px-6 py-3 text-right">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">{t('no_staff_msg')}</td>
                  </tr>
                ) : (
                  staffList.map(staff => (
                    <tr key={staff._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-gray-900 dark:text-white">{staff.name}</div>
                        <div className="text-xs text-gray-500">{t('joined_text')} {new Date(staff.dateOfJoining).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-300">
                        {staff.role}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-300">
                        {staff.phone || '-'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-300">
                        ₹{staff.salary} <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded ml-1">{staff.wageType}</span>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <span className={`px-2 py-1 text-xs rounded-full ${staff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                          {t('edit_btn')}
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        >
                          {t('delete_btn')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerStaff;
