'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
      setCategories(['All', ...data.data]);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    setToastMessage(`Added ${product.name} to cart`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || (p.category || 'Uncategorized') === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {toastMessage}
        </div>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 truncate mr-4">
            Hafiz Store
          </h1>
          <nav className="flex space-x-4 sm:space-x-6 items-center">
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition bg-gray-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Everything you need, <br className="hidden md:block" /><span className="text-blue-600">delivered to you.</span></h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Browse our wide selection of books, stationery, uniforms and more.</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg transition"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar justify-start md:justify-center">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm transition-all ${activeCategory === cat ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden group flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-red-600 font-bold px-3 py-1.5 border-2 border-red-600 rounded-full rotate-[-15deg] uppercase tracking-wider text-xs md:text-sm shadow-sm bg-white/50">Out of Stock</span>
                  </div>
                )}
                {product.category && product.category !== 'Uncategorized' && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-800 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                    {product.category}
                  </span>
                )}
              </div>
              <div className="p-4 md:p-5 flex-grow flex flex-col justify-between border-t border-gray-50">
                <div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                  <p className="text-blue-600 font-extrabold mb-3 md:mb-4 text-sm md:text-base">{product.price > 0 ? `Rs ${product.price}` : 'Price on request'}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.isAvailable}
                  className={`w-full py-2.5 rounded-xl text-sm md:text-base font-bold transition-all flex justify-center items-center gap-2 ${
                    product.isAvailable 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/20' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {product.isAvailable ? (
                    <>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      Add
                    </>
                  ) : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
              {(searchQuery || activeCategory !== 'All') && (
                <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-4 text-blue-600 font-medium hover:underline">Clear all filters</button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 md:py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hafiz Books & Stationers</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Providing high-quality books, stationery, uniforms, and accessories for all your educational and professional needs.</p>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Hafiz Delivery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
