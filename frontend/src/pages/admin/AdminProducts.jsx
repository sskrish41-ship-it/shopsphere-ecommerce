import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, X, Upload, Star } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: 999,
    original_price: 1299,
    stock_quantity: 10,
    category_id: '',
    brand_id: '',
    short_description: '',
    description: '',
    status: 'active',
    is_featured: false,
    is_trending: false,
    is_deal: false,
    images: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.get('/admin/products?per_page=50'),
        api.get('/categories'),
        api.get('/brands')
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      setBrands(brandRes.data.brands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setUrlInput('');
    setFormData({
      name: '',
      price: 1499,
      original_price: 1999,
      stock_quantity: 20,
      category_id: categories[0]?.id || 1,
      brand_id: brands[0]?.id || 1,
      short_description: 'High quality product with premium features.',
      description: 'Detailed description of the product built with top grade materials.',
      status: 'active',
      is_featured: false,
      is_trending: false,
      is_deal: false,
      images: []
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchData();
    if (searchParams.get('action') === 'new') {
      openNewModal();
    }
  }, [searchParams]);

  const openEditModal = (product) => {
    setEditingId(product.id);
    setUrlInput('');
    const existingImages = product.images?.map(i => i.image_url) || (product.primary_image ? [product.primary_image] : []);
    setFormData({
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      brand_id: product.brand_id,
      short_description: product.short_description || '',
      description: product.description || '',
      status: product.status || 'active',
      is_featured: product.is_featured || false,
      is_trending: product.is_trending || false,
      is_deal: product.is_deal || false,
      images: existingImages
    });
    setShowModal(true);
  };

  // Image Upload Logic
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new FormData();
      data.append('image', file);

      try {
        const res = await api.post('/admin/upload-image', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(res.data.image_url);
      } catch (err) {
        const msg = err.response?.data?.error || `Failed to upload ${file.name}`;
        addToast(msg, 'error');
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      addToast(`${uploadedUrls.length} image(s) uploaded successfully!`, 'success');
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, urlInput.trim()]
    }));
    setUrlInput('');
    addToast('Image URL added', 'success');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [selected] = newImages.splice(indexToPrimary, 1);
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      addToast('Please upload or add at least one product image', 'warning');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, formData);
        addToast('Product updated successfully!', 'success');
      } else {
        await api.post('/admin/products', formData);
        addToast('Product created successfully!', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        addToast('Product deleted', 'info');
        fetchData();
      } catch (err) {
        addToast('Failed to delete product', 'error');
      }
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage catalog items, INR prices, stock quantities, and product image galleries</p>
        </div>

        <button
          onClick={openNewModal}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold outline-none"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">Loading Product Catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Price (INR)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="p-4 font-bold flex items-center gap-3">
                    <img 
                      src={p.primary_image} 
                      alt="" 
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'; }}
                    />
                    <span className="truncate max-w-xs text-gray-900 dark:text-white">{p.name}</span>
                  </td>
                  <td className="p-4 font-semibold text-gray-500">{p.category?.name}</td>
                  <td className="p-4 font-semibold text-gray-500">{p.brand?.name}</td>
                  <td className="p-4 font-black text-gray-900 dark:text-white">{formatINR(p.price)}</td>
                  <td className="p-4">
                    <span className={`font-bold ${p.stock_quantity <= 5 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(p)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Brand</label>
                  <select
                    value={formData.brand_id}
                    onChange={e => setFormData({...formData, brand_id: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  >
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number" step="1" value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Original MRP (₹)</label>
                  <input
                    type="number" step="1" value={formData.original_price}
                    onChange={e => setFormData({...formData, original_price: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number" value={formData.stock_quantity}
                    onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Real Product Images Drag & Drop Section */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 dark:text-gray-300 block">Product Images (Drag & Drop or Select)</label>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragOver 
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-bold text-gray-700 dark:text-gray-300">
                    {uploading ? 'Uploading images to server...' : 'Drag & drop product images here, or browse'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, JPEG, WebP (Max 5MB per file)</p>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    id="file-upload-input"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="inline-block mt-3 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-extrabold rounded-xl cursor-pointer shadow-md"
                  >
                    Select Local Files
                  </label>
                </div>

                {/* Optional URL input fallback */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="px-4 py-2.5 bg-gray-800 dark:bg-gray-700 text-white font-bold rounded-xl"
                  >
                    Add URL
                  </button>
                </div>

                {/* Uploaded Images Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-gray-500 mb-2">
                      Gallery ({formData.images.length} images) — Click star to set primary image:
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          className={`relative group rounded-xl overflow-hidden border-2 bg-black/5 ${
                            idx === 0 ? 'border-amber-500 shadow-md ring-2 ring-amber-500/30' : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <img 
                            src={imgUrl} 
                            alt="" 
                            className="w-full h-24 object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'; }}
                          />
                          
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-md flex items-center gap-1 shadow">
                              <Star className="w-2.5 h-2.5 fill-current" /> Primary
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                            {idx !== 0 && (
                              <button
                                type="button"
                                title="Set as Primary Image"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="p-1.5 bg-amber-500 text-white rounded-lg hover:scale-110 transition-transform"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Remove Image"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 bg-rose-600 text-white rounded-lg hover:scale-110 transition-transform"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Short Summary</label>
                <input
                  type="text" value={formData.short_description}
                  onChange={e => setFormData({...formData, short_description: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Description</label>
                <textarea
                  rows="3" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                  Featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="checkbox" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} />
                  Trending
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="checkbox" checked={formData.is_deal} onChange={e => setFormData({...formData, is_deal: e.target.checked})} />
                  Flash Deal
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
