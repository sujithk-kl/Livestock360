// src/pages/CustomerRegistration.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import customerService from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import authBg from '../assets/modern_farm_hero.png';

const CustomerRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    preferences: {
      preferredProducts: [],
      budgetRange: { min: '', max: '' },
      notifications: { email: true, sms: false }
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        preferences: {
          preferredProducts: formData.preferences.preferredProducts,
          budgetRange: {
            min: formData.preferences.budgetRange.min ? parseFloat(formData.preferences.budgetRange.min) : undefined,
            max: formData.preferences.budgetRange.max ? parseFloat(formData.preferences.budgetRange.max) : undefined
          },
          notifications: formData.preferences.notifications
        }
      };

      const response = await customerService.registerCustomer(customerData);

      if (response.data && response.data.user && response.data.user.token) {
        login(response.data.user, response.data.user.token);
      }

      setSuccessMessage('Registration successful! Redirecting...');
      setTimeout(() => navigate('/customer/products'), 2000);

    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.errors && Array.isArray(err.errors)) {
        errorMessage = err.errors.map(e => e.msg).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.errors) errorMessage = errorData.errors.map(e => e.msg || e.message).join(', ');
        else if (errorData.message) errorMessage = errorData.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-gray-900 flex font-sans">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authBg})` }}
        ></div>
        <div className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full w-full">
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2 w-fit hover:text-secondary-200 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold mb-4">Join <span className="text-secondary-300">Livestock360</span></h1>
            <p className="text-lg text-secondary-100 max-w-md leading-relaxed">
              Create an account to access fresh, locally sourced livestock products delivered to your doorstep.
            </p>
          </div>
          <div className="text-sm text-secondary-200">
            &copy; {new Date().getFullYear()} Livestock360
          </div>
        </div>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6">
          <div className="lg:hidden mb-8" onClick={() => navigate('/')}>
            <span className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
              {t('customer_registration_title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/customer/login" className="font-medium text-secondary-600 hover:text-secondary-500 transition-colors">
                {t('sign_in_button')}
              </Link>
            </p>
          </div>

          {(successMessage || errors.general) && (
            <div className={`rounded-xl p-4 mb-6 flex items-start gap-3 border transition-all ${successMessage ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="text-sm font-medium">{successMessage || errors.general}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name_label')} *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_label')} *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_label')} *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm"
                placeholder="10-digit number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city_label')} *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm"
                placeholder="Enter your city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password_label')} *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm pr-10`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirm_password_label')} *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm pr-10`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
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

export default CustomerRegistration;
