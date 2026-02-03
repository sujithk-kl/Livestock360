import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import farmerService from '../services/farmerService';

const FarmerLivestock = () => {
  const navigate = useNavigate();
  const [livestockList, setLivestockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLivestock, setEditingLivestock] = useState(null);

  // Time ago calculation function
  const timeAgo = (date) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now - new Date(date);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  };

  // Form state
  const [formData, setFormData] = useState({
    animalType: '',
    count: '',
    healthNotes: '',
    vaccination: '',
    vaccinationDate: ''
  });

  // Common animal types
  const animalTypes = [
    'Cow',
    'Buffalo',
    'Goat',
    'Sheep',
    'Pig',
    'Chicken',
    'Duck',
    'Horse',
    'Camel',
    'Other'
  ];

  // Vaccination list by animal type
  const vaccinationList = {
    Cow: [
      "FMD (Foot and Mouth Disease)",
      "HS (Haemorrhagic Septicaemia)",
      "BQ (Black Quarter)",
      "Brucellosis",
      "Anthrax",
      "Rabies"
    ],
    Buffalo: [
      "FMD (Foot and Mouth Disease)",
      "HS (Haemorrhagic Septicaemia)",
      "BQ (Black Quarter)",
      "Brucellosis",
      "Anthrax"
    ],
    Goat: [
      "PPR (Peste des Petits Ruminants)",
      "ET (Enterotoxaemia)",
      "FMD (Foot and Mouth Disease)",
      "Goat Pox",
      "Brucellosis"
    ],
    Sheep: [
      "PPR (Peste des Petits Ruminants)",
      "ET (Enterotoxaemia)",
      "Sheep Pox",
      "FMD (Foot and Mouth Disease)",
      "Brucellosis"
    ],
    Pig: [
      "Swine Fever",
      "FMD (Foot and Mouth Disease)",
      "Swine Pox",
      "Erysipelas"
    ],
    Chicken: [
      "Ranikhet (Newcastle Disease)",
      "IBD (Infectious Bursal Disease)",
      "Fowl Pox",
      "Marek's Disease",
      "Infectious Bronchitis"
    ],
    Duck: [
      "Duck Plague",
      "Duck Viral Hepatitis",
      "Fowl Cholera",
      "Riemerella Anatipestifer"
    ],
    Horse: [
      "Tetanus",
      "Equine Influenza",
      "Rabies",
      "Strangles"
    ],
    Camel: [
      "Camel Pox",
      "Anthrax",
      "Rabies",
      "Trypanosomiasis"
    ],
    Other: [
      "General Vaccination",
      "Custom Vaccination"
    ]
  };

  // Get available vaccinations based on selected animal type
  const getAvailableVaccinations = () => {
    return vaccinationList[formData.animalType] || [];
  };

  // Fetch livestock list on component mount
  useEffect(() => {
    fetchLivestockList();
  }, []);

  const fetchLivestockList = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await farmerService.getLivestockList();
      setLivestockList(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch livestock data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      animalType: '',
      count: '',
      healthNotes: '',
      vaccination: '',
      vaccinationDate: ''
    });
    setShowAddForm(false);
    setEditingLivestock(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate
      if (!formData.animalType || !formData.count) {
        setError('Animal type and count are required');
        return;
      }

      if (formData.count <= 0) {
        setError('Count must be greater than 0');
        return;
      }

      // Clear any old vaccination data
      formData.vaccination = formData.vaccination || '';
      formData.vaccinationDate = formData.vaccinationDate || '';

      if (editingLivestock) {
        // Update existing livestock
        await farmerService.updateLivestock(editingLivestock._id, formData);
        setSuccess('Livestock updated successfully!');
      } else {
        // Create new livestock
        await farmerService.createLivestock(formData);
        setSuccess('Livestock added successfully!');
      }

      resetForm();
      fetchLivestockList();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save livestock data');
    }
  };

  const handleEdit = (livestock) => {
    setFormData({
      animalType: livestock.animalType,
      count: livestock.count,
      healthNotes: livestock.healthNotes || '',
      vaccination: livestock.vaccination || '',
      vaccinationDate: livestock.vaccinationDate
        ? new Date(livestock.vaccinationDate).toISOString().split('T')[0]
        : ''
    });
    setEditingLivestock(livestock);
    setShowAddForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this livestock record?')) {
      return;
    }

    try {
      setError('');
      await farmerService.deleteLivestock(id);
      setSuccess('Livestock deleted successfully!');
      fetchLivestockList();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete livestock');
    }
  };

  const getTotalCount = () => {
    return livestockList.reduce((total, livestock) => total + livestock.count, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Livestock Management</h1>

            </div>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) {
                  resetForm();
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              {showAddForm ? 'Cancel' : '+ Add Livestock'}
            </button>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Types</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{livestockList.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Animals</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getTotalCount()}</p>
            </div>
            <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Last Updated</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {livestockList.length > 0
                  ? new Date(livestockList[0].updatedAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingLivestock ? 'Edit Livestock' : 'Add New Livestock'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Animal Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Animal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="animalType"
                    value={formData.animalType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Animal Type</option>
                    {animalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="count"
                    value={formData.count}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Enter animal count"
                    required
                  />
                </div>

                {/* Health Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Health Notes
                  </label>
                  <textarea
                    name="healthNotes"
                    value={formData.healthNotes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Enter health observations, conditions, treatments, etc."
                  ></textarea>
                </div>

                {/* Vaccination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vaccination
                  </label>
                  <select
                    name="vaccination"
                    value={formData.vaccination}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
                    disabled={!formData.animalType}
                  >
                    <option value="">
                      {formData.animalType
                        ? 'Select Vaccination'
                        : 'Select Animal Type First'}
                    </option>
                    {getAvailableVaccinations().map((vaccine, index) => (
                      <option key={index} value={vaccine}>
                        {vaccine}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vaccination Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vaccination Date
                  </label>
                  <input
                    type="date"
                    name="vaccinationDate"
                    value={formData.vaccinationDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                >
                  {editingLivestock ? 'Update Livestock' : 'Add Livestock'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Livestock List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Livestock Records
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading livestock data...</p>
            </div>
          ) : livestockList.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No livestock records</h3>
              <p className="mt-1 text-gray-500">Get started by adding your first livestock entry.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                >
                  + Add Livestock
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Animal Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vaccination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vaccination Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Health Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {livestockList.map((livestock) => (
                    <tr key={livestock._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{livestock.animalType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{livestock.count}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {livestock.vaccination || 'Not vaccinated'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {livestock.vaccinationDate
                            ? new Date(livestock.vaccinationDate).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {livestock.healthNotes || 'No notes'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(livestock)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(livestock._id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerLivestock;
