import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import farmerService from '../services/farmerService';
import { useAuth } from '../context/AuthContext';

const FarmerRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPincode: '',
    aadharNumber: '',
    password: '',
    confirmPassword: '',

    // Farm Details
    farmName: '',
    farmAddress: '',
    farmSize: '',
    farmType: 'Dairy',
    yearsOfFarming: '',

    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    const cleanAadhar = formData.aadharNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(cleanAadhar)) {
      newErrors.aadharNumber = 'Aadhar number must be exactly 12 digits';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.addressStreet.trim()) {
      newErrors.addressStreet = 'Street address is required';
    }

    if (!formData.addressCity.trim()) {
      newErrors.addressCity = 'City is required';
    }

    if (!formData.addressState.trim()) {
      newErrors.addressState = 'State is required';
    }

    if (!formData.addressPincode.trim()) {
      newErrors.addressPincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.addressPincode)) {
      newErrors.addressPincode = 'Please provide a valid 6-digit pincode';
    }

    if (!formData.farmSize || isNaN(parseFloat(formData.farmSize)) || parseFloat(formData.farmSize) < 0.1) {
      newErrors.farmSize = 'Farm size must be at least 0.1 acres';
    }

    if (!formData.farmName.trim()) {
      newErrors.farmName = 'Farm name is required';
    }

    if (!formData.farmAddress.trim()) {
      newErrors.farmAddress = 'Farm address is required';
    }

    if (!formData.yearsOfFarming || isNaN(parseInt(formData.yearsOfFarming)) || parseInt(formData.yearsOfFarming) < 0) {
      newErrors.yearsOfFarming = 'Years of farming must be a valid number';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be between 9 and 18 digits';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Please provide a valid IFSC code';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || isSubmitting) return; // Prevent double submission

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Register farmer (creates user account and farmer profile in one request)
      // Clean Aadhar number: remove spaces
      const cleanAadhar = formData.aadharNumber.replace(/\s/g, '');

      const farmerRegistrationData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: {
          street: formData.addressStreet,
          city: formData.addressCity,
          state: formData.addressState,
          pincode: formData.addressPincode,
          country: 'India'
        },
        farmSize: parseFloat(formData.farmSize),
        farmName: formData.farmName,
        farmAddress: formData.farmAddress,
        farmType: formData.farmType,
        yearsOfFarming: parseInt(formData.yearsOfFarming),
        aadharNumber: cleanAadhar,
        crops: [], // Empty array
        livestock: [], // Empty array
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName
        }
      };

      const response = await farmerService.registerFarmer(farmerRegistrationData);
      console.log('Farmer registered:', response);

      // Store token and user data for auto-login
      // Handle different response structures
      let token, userData;
      if (response.data && response.data.user && response.data.user.token) {
        token = response.data.user.token;
        userData = response.data.user;
      } else if (response.data && response.data.token) {
        token = response.data.token;
        userData = response.data;
      }

      if (token) {
        login(userData, token);
      }

      // Show success message
      setSuccessMessage('Registration successful! Redirecting to dashboard...');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);

      // Handle different error types with specific messages
      let errorMessage = 'Registration failed. Please try again.';

      if (err.errors && Array.isArray(err.errors)) {
        // Validation errors from server
        errorMessage = err.errors.map(e => e.msg || e.message || e).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('farmer_registration_title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 transition-colors duration-200">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Details Section */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">{t('personal_details_section')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name_label')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_label')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_label')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('aadhar_label')}</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password_label')} *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password_label')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('street_label')}</label>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.addressStreet ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.addressStreet && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressStreet}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city_label')}</label>
                <input
                  type="text"
                  name="addressCity"
                  value={formData.addressCity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.addressCity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.addressCity && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressCity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('state_label')}</label>
                <input
                  type="text"
                  name="addressState"
                  value={formData.addressState}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.addressState ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.addressState && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressState}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pincode_label')}</label>
                <input
                  type="text"
                  name="addressPincode"
                  value={formData.addressPincode}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.addressPincode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.addressPincode && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressPincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Farm Details Section */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">{t('farm_details_section')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_name_label')}</label>
                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.farmName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.farmName && (
                  <p className="mt-1 text-sm text-red-600">{errors.farmName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_size_label')}</label>
                <input
                  type="number"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.farmSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.farmSize && (
                  <p className="mt-1 text-sm text-red-600">{errors.farmSize}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_type_label')}</label>
                <select
                  name="farmType"
                  value={formData.farmType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('years_farming_label')}</label>
                <input
                  type="number"
                  name="yearsOfFarming"
                  value={formData.yearsOfFarming}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.yearsOfFarming ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.yearsOfFarming && (
                  <p className="mt-1 text-sm text-red-600">{errors.yearsOfFarming}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_address_label')}</label>
                <textarea
                  name="farmAddress"
                  value={formData.farmAddress}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-4 py-2 border ${errors.farmAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                ></textarea>
                {errors.farmAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.farmAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">{t('bank_details_section')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bank_name_label')}</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.bankName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_number_label')}</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('ifsc_label')}</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.ifscCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.ifscCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('holder_name_label')}</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white`}
                />
                {errors.accountHolderName && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountHolderName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {t('cancel_button')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? t('registering_button') : t('register_button')}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('already_have_account')}{' '}
                <Link
                  to="/farmer/login"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  {t('sign_in_button')}
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerRegistration;
