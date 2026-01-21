import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import milkProductionService from '../services/milkProductionService';

const FarmerMilkProduction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Stats State
  const [stats, setStats] = useState({
    todayProduction: 0,
    monthProduction: 0,
    totalEarnings: 0
  });

  // Form State
  const [formData, setFormData] = useState({
    animalType: 'Cow',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    pricePerLitre: '',
    totalAmount: 0,
    notes: ''
  });

  // Load Data
  useEffect(() => {
    fetchRecords();
  }, []);

  // Update Stats whenever records change
  useEffect(() => {
    calculateStats();
  }, [records]);

  // Auto-calculate Total Amount
  useEffect(() => {
    const qty = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerLitre) || 0;
    setFormData(prev => ({ ...prev, totalAmount: qty * price }));
  }, [formData.quantity, formData.pricePerLitre]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await milkProductionService.getHistory();
      setRecords(data.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todayProd = 0;
    let monthProd = 0;
    let totalEarn = 0;

    records.forEach(record => {
      const recordDate = new Date(record.date);
      const recordDateStr = recordDate.toISOString().split('T')[0];

      // Today's Production
      if (recordDateStr === today) {
        todayProd += record.quantity || 0;
      }

      // This Month's Production
      if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
        monthProd += record.quantity || 0;
      }

      // Total Earnings (sum of all records)
      totalEarn += record.totalAmount || 0;
    });

    setStats({
      todayProduction: todayProd,
      monthProduction: monthProd,
      totalEarnings: totalEarn
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      animalType: 'Cow',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      pricePerLitre: '',
      totalAmount: 0,
      notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (record) => {
    setFormData({
      animalType: record.animalType,
      date: new Date(record.date).toISOString().split('T')[0],
      quantity: record.quantity,
      pricePerLitre: record.pricePerLitre,
      totalAmount: record.totalAmount,
      notes: record.notes || ''
    });
    setEditingId(record._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await milkProductionService.delete(id);
        fetchRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        pricePerLitre: parseFloat(formData.pricePerLitre)
      };

      if (editingId) {
        await milkProductionService.update(editingId, payload);
      } else {
        await milkProductionService.create(payload);
      }

      fetchRecords();
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
      alert(error.message || 'Failed to save record');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-2 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Milk Production</h1>
              <p className="mt-2 text-gray-600">
                Record and track daily milk production for better monitoring and profit analysis.
              </p>
            </div>
            <button
              onClick={() => {
                if (showAddForm) resetForm();
                else setShowAddForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              {showAddForm ? 'Cancel' : '+ Add Production'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Today's Production</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.todayProduction.toFixed(1)} L</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">This Month</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.monthProduction.toFixed(1)} L</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Total Earnings</p>
              <p className="text-3xl font-bold text-green-900 mt-2">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in-down">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
              {editingId ? 'Edit Production Record' : 'Add Daily Production'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Animal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Animal Type</label>
                <select
                  name="animalType"
                  value={formData.animalType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Cow">Cow</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Goat">Goat</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Litres)</label>
                <input
                  type="number"
                  step="0.1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g. 12.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Price per Litre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Litre (₹)</label>
                <input
                  type="number"
                  name="pricePerLitre"
                  value={formData.pricePerLitre}
                  onChange={handleInputChange}
                  placeholder="e.g. 45"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Total Amount (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-semibold">
                  {formData.totalAmount.toLocaleString()}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Morning milking only"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
                >
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Production Records</h3>
            <span className="text-sm text-gray-500">{records.length} records found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No production records found. Start by adding one!
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.animalType === 'Cow' ? 'bg-blue-100 text-blue-800' :
                            record.animalType === 'Buffalo' ? 'bg-slate-100 text-slate-800' :
                              'bg-orange-100 text-orange-800'
                          }`}>
                          {record.animalType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {record.quantity} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{record.pricePerLitre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ₹{record.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

export default FarmerMilkProduction;
