// src/pages/FarmerRegistration.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import farmerService from '../services/farmerService';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, UserIcon, HomeIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import authBg from '../assets/modern_farm_hero.png';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits';

    const cleanAadhar = formData.aadharNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(cleanAadhar)) newErrors.aadharNumber = 'Aadhar number must be exactly 12 digits';

    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!/\d/.test(formData.password)) newErrors.password = 'Password must contain at least one number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.addressStreet.trim()) newErrors.addressStreet = 'Street address is required';
    if (!formData.addressCity.trim()) newErrors.addressCity = 'City is required';
    if (!formData.addressState.trim()) newErrors.addressState = 'State is required';
    if (!formData.addressPincode.trim()) newErrors.addressPincode = 'Pincode is required';
    else if (!/^[1-9][0-9]{5}$/.test(formData.addressPincode)) newErrors.addressPincode = 'Please provide a valid 6-digit pincode';

    if (!formData.farmSize || isNaN(parseFloat(formData.farmSize)) || parseFloat(formData.farmSize) < 0.1) newErrors.farmSize = 'Farm size must be at least 0.1 acres';
    if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required';
    if (!formData.farmAddress.trim()) newErrors.farmAddress = 'Farm address is required';
    if (!formData.yearsOfFarming || isNaN(parseInt(formData.yearsOfFarming)) || parseInt(formData.yearsOfFarming) < 0) newErrors.yearsOfFarming = 'Years of farming must be a valid number';

    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    else if (!/^\d{9,18}$/.test(formData.accountNumber)) newErrors.accountNumber = 'Account number must be between 9 and 18 digits';

    if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) newErrors.ifscCode = 'Please provide a valid IFSC code';

    if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
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
        crops: [],
        livestock: [],
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName
        }
      };

      const response = await farmerService.registerFarmer(farmerRegistrationData);

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

      setSuccessMessage('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.errors && Array.isArray(err.errors)) {
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

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 mt-8 first:mt-0">
      <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 flex font-sans">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authBg})` }}
        ></div>
        <div className="absolute inset-0 bg-green-900/60 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full w-full">
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2 w-fit hover:text-green-200 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold mb-4">Partner with <span className="text-green-300">Livestock360</span></h1>
            <p className="text-lg text-green-100 max-w-md leading-relaxed">
              Join our network of farmers and reach thousands of customers directly. Manage your farm, track sales, and grow your business.
            </p>
          </div>
          <div className="text-sm text-green-200">
            &copy; {new Date().getFullYear()} Livestock360
          </div>
        </div>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="lg:hidden mb-8" onClick={() => navigate('/')}>
            <span className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
              {t('farmer_registration_title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/farmer/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                {t('sign_in_button')}
              </Link>
            </p>
          </div>

          {(successMessage || errors.general) && (
            <div className={`rounded-xl p-4 mb-6 flex items-start gap-3 border transition-all ${successMessage ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="text-sm font-medium">{successMessage || errors.general}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">

            {/* Personal Details Section */}
            <SectionHeader icon={UserIcon} title={t('personal_details_section')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name_label')} *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_label')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_label')} *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('aadhar_label')} *</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm"
                />
                {errors.aadharNumber && <p className="mt-1 text-xs text-red-600">{errors.aadharNumber}</p>}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password_label')} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm pr-10`}
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password_label')} *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm pr-10`}
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('street_label')} *</label>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.addressStreet ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.addressStreet && <p className="mt-1 text-xs text-red-600">{errors.addressStreet}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city_label')} *</label>
                  <input
                    type="text"
                    name="addressCity"
                    value={formData.addressCity}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2.5 rounded-lg border ${errors.addressCity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                  />
                  {errors.addressCity && <p className="mt-1 text-xs text-red-600">{errors.addressCity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('state_label')} *</label>
                  <input
                    type="text"
                    name="addressState"
                    value={formData.addressState}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2.5 rounded-lg border ${errors.addressState ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                  />
                  {errors.addressState && <p className="mt-1 text-xs text-red-600">{errors.addressState}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pincode_label')} *</label>
                  <input
                    type="text"
                    name="addressPincode"
                    value={formData.addressPincode}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2.5 rounded-lg border ${errors.addressPincode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                  />
                  {errors.addressPincode && <p className="mt-1 text-xs text-red-600">{errors.addressPincode}</p>}
                </div>
              </div>
            </div>

            {/* Farm Details Section */}
            <SectionHeader icon={HomeIcon} title={t('farm_details_section')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_name_label')} *</label>
                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.farmName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.farmName && <p className="mt-1 text-xs text-red-600">{errors.farmName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_size_label')} *</label>
                <input
                  type="number"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.farmSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.farmSize && <p className="mt-1 text-xs text-red-600">{errors.farmSize}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_type_label')} *</label>
                <select
                  name="farmType"
                  value={formData.farmType}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm"
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('years_farming_label')} *</label>
                <input
                  type="number"
                  name="yearsOfFarming"
                  value={formData.yearsOfFarming}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.yearsOfFarming ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.yearsOfFarming && <p className="mt-1 text-xs text-red-600">{errors.yearsOfFarming}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('farm_address_label')} *</label>
                <textarea
                  name="farmAddress"
                  value={formData.farmAddress}
                  onChange={handleChange}
                  rows="2"
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.farmAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                ></textarea>
                {errors.farmAddress && <p className="mt-1 text-xs text-red-600">{errors.farmAddress}</p>}
              </div>
            </div>

            {/* Bank Details Section */}
            <SectionHeader icon={BanknotesIcon} title={t('bank_details_section')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('bank_name_label')} *</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.bankName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.bankName && <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('account_number_label')} *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.accountNumber && <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('ifsc_label')} *</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.ifscCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.ifscCode && <p className="mt-1 text-xs text-red-600">{errors.ifscCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('holder_name_label')} *</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition shadow-sm`}
                />
                {errors.accountHolderName && <p className="mt-1 text-xs text-red-600">{errors.accountHolderName}</p>}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t('register_button')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistration;
