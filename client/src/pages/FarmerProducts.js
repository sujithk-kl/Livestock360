// src/pages/FarmerProducts.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowLeftIcon, TagIcon } from '@heroicons/react/24/outline'; // Updated icons

const FarmerProducts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    unit: 'Litre',
    quantity: '',
    price: '',
    qualityTag: 'Fresh',
    status: 'Available'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const categories = [
    'Milk', 'Curd', 'Butter', 'Ghee', 'Paneer', 'Honey', 'Eggs', 'Chicken', 'Country Chicken', 'Mutton', 'Meat', 'Other Farm Products'
  ];
  const units = ['Litre', 'Kg', 'Dozen', 'Piece'];
  const qualityTags = ['Fresh', 'Organic', 'Home-made'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getMyProducts();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      toast.error(error.message || t('loading_products'));
    } finally {
      setLoading(false);
    }
  };

  const { category, unit, quantity, price, qualityTag, status } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, productName: formData.category };

      if (isEditing) {
        const res = await productService.update(currentId, dataToSubmit);
        if (res.success) {
          toast.success(t('product_updated_msg'));
          setIsEditing(false);
          setCurrentId(null);
          setFormData({ category: '', unit: 'Litre', quantity: '', price: '', qualityTag: 'Fresh', status: 'Available' });
          fetchProducts();
        }
      } else {
        const res = await productService.create(dataToSubmit);
        if (res.success) {
          toast.success(t('product_added_msg'));
          setFormData({ category: '', unit: 'Litre', quantity: '', price: '', qualityTag: 'Fresh', status: 'Available' });
          fetchProducts();
        }
      }
    } catch (error) {
      toast.error(error.message || t('error_processing'));
    }
  };

  const onEdit = product => {
    setIsEditing(true);
    setCurrentId(product._id);
    setFormData({
      category: product.category,
      unit: product.unit,
      quantity: product.quantity,
      price: product.price,
      qualityTag: product.qualityTag || 'Fresh',
      status: product.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async id => {
    if (window.confirm(t('confirm_delete_product'))) {
      try {
        const res = await productService.delete(id);
        if (res.success) {
          toast.success(t('product_deleted_msg'));
          fetchProducts();
        }
      } catch (error) {
        toast.error(error.message || t('delete_failed'));
      }
    }
  };

  const totalValue = quantity && price ? (quantity * price).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all shadow-sm hover:shadow">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manage_products_title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('product_subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24 transition-all">
              <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <span className={`p-2 rounded-lg ${isEditing ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                  {isEditing ? <PencilSquareIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                </span>
                {isEditing ? t('edit_product_title') : t('add_product_title')}
              </h2>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category_label')}</label>
                  <select
                    name="category"
                    value={category}
                    onChange={onChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white py-2.5"
                    required
                  >
                    <option value="">{t('select_category')}</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('unit_label')}</label>
                    <select
                      name="unit"
                      value={unit}
                      onChange={onChange}
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white py-2.5"
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('quantity_label')}</label>
                    <input
                      type="number"
                      name="quantity"
                      value={quantity}
                      onChange={onChange}
                      placeholder="0"
                      min="0"
                      className="w-full rounded-xl border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white py-2.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price_label')} / {unit}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={price}
                      onChange={onChange}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white py-2.5"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('total_value_label')}</label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹ {totalValue}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('quality_tag_label')}</label>
                  <div className="flex flex-wrap gap-2">
                    {qualityTags.map(tag => (
                      <label key={tag} className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${qualityTag === tag ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}>
                        <input
                          type="radio"
                          name="qualityTag"
                          value={tag}
                          checked={qualityTag === tag}
                          onChange={onChange}
                          className="hidden"
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status_label')}</label>
                  <select
                    name="status"
                    value={status}
                    onChange={onChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white py-2.5"
                  >
                    <option value="Available">{t('status_available')}</option>
                    <option value="Out of Stock">{t('status_out_stock')}</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ category: '', unit: 'Litre', quantity: '', price: '', qualityTag: 'Fresh', status: 'Available' });
                      }}
                      className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                    >
                      {t('cancel_btn')}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    {isEditing ? t('update_product_btn') : t('add_product_btn')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Product List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('my_products_title')}</h3>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full">
                  {products.length} {t('items_text')}
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">{t('loading_inventory')}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TagIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('no_products_heading')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t('start_adding_products')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">{t('th_product')}</th>
                        <th className="px-6 py-4">{t('th_category')}</th>
                        <th className="px-6 py-4 text-center">{t('th_qty')}</th>
                        <th className="px-6 py-4 text-right">{t('th_price')}</th>
                        <th className="px-6 py-4 text-center">{t('th_status')}</th>
                        <th className="px-6 py-4 text-center">{t('th_actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {products.map(product => (
                        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 dark:text-white">{product.productName}</div>
                            <div className="text-xs text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 px-2 py-0.5 rounded-md inline-block mt-1">
                              {product.qualityTag}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-gray-900 dark:text-white">{product.quantity}</span>
                            <span className="text-xs text-gray-500 ml-1">{product.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEdit(product)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t('edit_btn')}
                              >
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => onDelete(product._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('delete_btn')}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
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
      </div>
    </div>
  );
};

export default FarmerProducts;
