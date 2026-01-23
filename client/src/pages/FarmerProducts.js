import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FarmerProducts = () => {
  const navigate = useNavigate();
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
    'Milk', 'Curd', 'Butter', 'Ghee', 'Eggs', 'Chicken', 'Country Chicken', 'Meat', 'Other Farm Products'
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
      toast.error(error.message || 'Failed to load products');
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
          toast.success('Product updated successfully');
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
          toast.success('Product added successfully');
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
          toast.success('Product deleted');
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
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <ToastContainer />
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-green-600 transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add/Edit Product Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={onSubmit}>


              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <select
                  name="category"
                  value={category}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Unit</label>
                  <select
                    name="unit"
                    value={unit}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={quantity}
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Price per {unit}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={price}
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                    className="w-full pl-8 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4 bg-gray-50 p-3 rounded">
                <label className="block text-gray-900 text-xs font-bold mb-1 uppercase">Total Value</label>
                <div className="text-2xl font-bold text-green-600">₹ {totalValue}</div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Quality Tag</label>
                <div className="flex gap-2 flex-wrap">
                  {qualityTags.map(tag => (
                    <label key={tag} className={`cursor-pointer px-3 py-1 rounded-full text-sm border ${qualityTag === tag ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}>
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
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-200"
                >
                  {isEditing ? 'Update Product' : 'Add Product'}
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
                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">My Farm Products</h2>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                Total: {products.length}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-2">No products listed yet.</p>
                <p className="text-sm">Add your first product using the form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-6">Category</th>
                      <th className="py-3 px-6 text-center">Qty</th>
                      <th className="py-3 px-6 text-right">Price</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light">
                    {products.map(product => (
                      <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <div className="font-medium text-gray-800">{product.productName}</div>
                          <div className="text-xs text-green-600">{product.qualityTag}</div>
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
                          <span className={`py-1 px-3 rounded-full text-xs ${product.status === 'Available' ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex item-center justify-center">
                            <button
                              onClick={() => onEdit(product)}
                              className="w-4 mr-2 transform hover:text-green-500 hover:scale-110 transiton duration-200"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDelete(product._id)}
                              className="w-4 transform hover:text-red-500 hover:scale-110 transiton duration-200"
                              title="Delete"
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
  );
};

export default FarmerProducts;
