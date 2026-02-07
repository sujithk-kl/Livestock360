import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    // Description ignored as per schema
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

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      // Auto-populate productName with Category since the field was removed
      const dataToSubmit = {
        ...formData,
        productName: formData.category
      };

      if (isEditing) {
        const res = await productService.update(currentId, dataToSubmit);
        if (res.success) {
          toast.success(t('product_updated_msg'));
          setIsEditing(false);
          setCurrentId(null);
          setFormData({
            category: '',
            unit: 'Litre',
            quantity: '',
            price: '',
            qualityTag: 'Fresh',
            status: 'Available'
          });
          fetchProducts();
        }
      } else {
        const res = await productService.create(dataToSubmit);
        if (res.success) {
          toast.success(t('product_added_msg'));
          setFormData({
            category: '',
            unit: 'Litre',
            quantity: '',
            price: '',
            qualityTag: 'Fresh',
            status: 'Available'
          });
          fetchProducts(); // Refresh list
        }
      }
    } catch (error) {
      toast.error(error.message || 'Error processing request');
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
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const onDelete = async id => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await productService.delete(id);
        if (res.success) {
          toast.success(t('product_deleted_msg'));
          fetchProducts();
        }
      } catch (error) {
        toast.error(error.message || 'Delete failed');
      }
    }
  };

  // Calculate total value for form preview
  const totalValue = quantity && price ? (quantity * price).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <ToastContainer />

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('manage_products_title')}</h1>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-4 text-green-700 dark:text-green-400">
                {isEditing ? t('edit_product_title') : t('add_product_title')}
              </h2>
              <form onSubmit={onSubmit}>


                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('category_label')}</label>
                  <select
                    name="category"
                    value={category}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">{t('select_category')}</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('unit_label')}</label>
                    <select
                      name="unit"
                      value={unit}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                    >
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('quantity_label')}</label>
                    <input
                      type="number"
                      name="quantity"
                      value={quantity}
                      onChange={onChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('price_label')} {unit}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 dark:text-gray-400">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={price}
                      onChange={onChange}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <label className="block text-gray-900 dark:text-gray-200 text-xs font-bold mb-1 uppercase">{t('total_value_label')}</label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹ {totalValue}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('quality_tag_label')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {qualityTags.map(tag => (
                      <label key={tag} className={`cursor-pointer px-3 py-1 rounded-full text-sm border ${qualityTag === tag ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
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

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">{t('status_label')}</label>
                  <select
                    name="status"
                    value={status}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 dark:hover:bg-green-500 transition duration-200"
                  >
                    {isEditing ? t('update_product_btn') : t('add_product_btn')}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          category: '',
                          unit: 'Litre',
                          quantity: '',
                          price: '',
                          qualityTag: 'Fresh',
                          status: 'Available'
                        });
                      }}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-200"
                    >
                      {t('cancel_btn')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('my_products_title')}</h2>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-1 rounded-full">
                  {t('total_products')}: {products.length}
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">{t('loading_products')}</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="mb-2">No products listed yet.</p>
                  <p className="text-sm">Add your first product using the form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs leading-normal">
                        <th className="py-3 px-6">{t('th_product')}</th>
                        <th className="py-3 px-6">{t('th_category')}</th>
                        <th className="py-3 px-6 text-center">{t('th_qty')}</th>
                        <th className="py-3 px-6 text-right">{t('th_price')}</th>
                        <th className="py-3 px-6 text-center">{t('th_status')}</th>
                        <th className="py-3 px-6 text-center">{t('th_actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                      {products.map(product => (
                        <tr key={product._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-3 px-6 text-left whitespace-nowrap">
                            <div className="font-medium text-gray-800 dark:text-white">{product.productName}</div>
                            <div className="text-xs text-green-600 dark:text-green-400">{product.qualityTag}</div>
                          </td>
                          <td className="py-3 px-6 text-left">
                            <span>{product.category}</span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className="font-medium">{product.quantity}</span> {product.unit}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <span className="font-medium">₹{product.price}</span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className={`py-1 px-3 rounded-full text-xs ${product.status === 'Available' ? 'bg-green-200 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-red-200 text-red-600 dark:bg-red-900 dark:text-red-300'}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <div className="flex item-center justify-center">
                              <button
                                onClick={() => onEdit(product)}
                                className="w-4 mr-2 transform hover:text-green-500 hover:scale-110 transiton duration-200 dark:text-gray-400 dark:hover:text-green-400"
                                title={t('edit_btn')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => onDelete(product._id)}
                                className="w-4 transform hover:text-red-500 hover:scale-110 transiton duration-200 dark:text-gray-400 dark:hover:text-red-400"
                                title={t('delete_btn')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
