'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
};

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('Uncategorized');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check-auth');
      const data = await res.json();
      setIsAuthorized(data.authorized);
      if (data.authorized) {
        fetchProducts();
        fetchCategories();
      }
    } catch {
      setIsAuthorized(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthorized(true);
        fetchProducts();
        fetchCategories();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('An error occurred during login');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsAuthorized(false);
      } else {
        alert('Logout failed');
      }
    } catch {
      alert('An error occurred during logout');
    }
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      setProducts(data.data);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      setCategories(data.data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return alert('Name and image are required');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: price === '' ? 0 : Number(price),
          category,
          imageUrl: uploadData.secure_url,
        }),
      });

      if (productRes.ok) {
        setName('');
        setPrice('');
        setCategory(categories[0] || 'Uncategorized');
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchProducts();
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return alert('Please enter a category name');
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCategoryName('');
        fetchCategories();
        setCategory(data.data);
        alert(`Category "${data.data}" added successfully!`);
      } else {
        alert('Failed to add category');
      }
    } catch {
      alert('Error adding category');
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !currentStatus }),
    });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  // Loading state while checking auth
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render Login Panel if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Admin Portal</h1>
            <p className="text-gray-500">Sign in to manage Hafiz Books & Stationers</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 border focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-gray-900"
                placeholder="Enter admin username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 border focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-gray-900"
                placeholder="Enter password"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-sm font-medium border border-red-100">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-4 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg active:scale-95 flex justify-center items-center"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">&larr; Back to Storefront</Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard if authorized
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg transition">
              &larr; View Store
            </Link>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-4 py-2 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border-gray-300 bg-gray-50 p-3 border focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition" placeholder="e.g. Geometry Box" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-xl border-gray-300 bg-gray-50 p-3 border focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition" placeholder="0" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border-gray-300 bg-gray-50 p-3 border focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition">
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Inline Category Adder */}
                  <div className="mt-2 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add custom category..." 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)} 
                      className="flex-grow rounded-lg border-gray-300 p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 border" 
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory} 
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-xs font-semibold transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <div className="relative w-full h-32 flex justify-center">
                    <img src={preview} alt="Preview" className="h-full object-contain rounded" />
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <span className="text-blue-600 font-semibold">Click to upload</span> or open camera
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" onChange={handleFileChange} accept="image/*" required className="hidden" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-md active:scale-95 flex justify-center items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">Manage Products ({products.length})</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-xl bg-gray-50 border" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 mb-1">{product.category || 'Uncategorized'}</p>
                    <p className="text-blue-600 font-bold">{product.price > 0 ? `Rs ${product.price}` : 'No price'}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                  <button onClick={() => toggleAvailability(product._id, product.isAvailable)} className="flex-1 text-sm font-medium bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                    Toggle Status
                  </button>
                  <button onClick={() => deleteProduct(product._id)} className="text-sm font-medium bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products found. Add your first product above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
