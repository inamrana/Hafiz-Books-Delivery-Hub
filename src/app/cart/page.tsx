'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', contact: '', address: '' });
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.product._id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.product._id !== id);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty');
    
    let message = `Hello, I would like to order the following from Hafiz Books & Stationers:\n\n`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (x${item.quantity})`;
      if (item.product.price > 0) {
        message += ` - Rs ${item.product.price * item.quantity}`;
      }
      message += `\n`;
    });

    if (total > 0) {
      message += `\n*Subtotal:* Rs ${total}\n`;
      message += `*Delivery:* Delivery fee will be applied\n`;
      message += `*Total Amount:* Rs ${total} (excluding delivery fee)\n\n`;
    } else {
      message += `\n`;
    }

    message += `*Customer Details:*\nName: ${customer.name}\nContact: ${customer.contact}\nAddress: ${customer.address}\n\n`;
    message += `*Note:* Products delivered under 24 hours. Contact if needed early.`;

    const whatsappNumber = '923075597125'; // 0307-5597125 converted to PK intl format
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Clear cart
    localStorage.removeItem('cart');
    setCart([]);
    
    window.location.href = whatsappUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-center py-2.5 px-4 text-xs md:text-sm font-semibold tracking-wide flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 shadow-sm">
        <span>🚀 Products delivered under 24 hours. Contact if you need early delivery!</span>
        <span className="hidden sm:inline-block text-white/40">|</span>
        <span>🚚 Delivery fee applied</span>
        <span className="hidden sm:inline-block text-white/40">|</span>
        <span>💳 Min. Order: Rs. 500</span>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 mr-4">
            &larr; Back to Store
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Your Cart</h1>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-8">
        <div className="flex-grow">
          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
              <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product._id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl bg-gray-100" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-900">{item.product.name}</h3>
                    <p className="text-blue-600 font-medium">{item.product.price > 0 ? `Rs ${item.product.price}` : 'Price on request'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button onClick={() => removeItem(item.product._id)} className="text-red-500 hover:text-red-700 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="flex items-center border rounded-lg bg-gray-50">
                      <button onClick={() => updateQuantity(item.product._id, -1)} className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-l-lg transition">-</button>
                      <span className="px-4 font-medium min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-r-lg transition">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="w-full md:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Checkout Details</h2>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    className="w-full rounded-xl border-gray-300 shadow-sm px-4 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Ali Khan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={customer.contact}
                    onChange={(e) => setCustomer({...customer, contact: e.target.value})}
                    className="w-full rounded-xl border-gray-300 shadow-sm px-4 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="03xx-xxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    value={customer.address}
                    onChange={(e) => setCustomer({...customer, address: e.target.value})}
                    className="w-full rounded-xl border-gray-300 shadow-sm px-4 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="House/Street/City"
                  />
                </div>

                <div className="pt-4 border-t mt-6">
                  {/* Delivery Notices */}
                  <div className="mb-4 bg-blue-50/50 text-blue-800 p-3.5 rounded-xl text-xs space-y-1.5 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <span>🚚</span>
                      <span>Products delivered in <strong>under 24 hours</strong>. Contact if early delivery is needed.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💵</span>
                      <span><strong>Delivery fee</strong> will be applied upon shipping.</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">Rs {total}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-md bg-[#25D366] hover:bg-[#128C7E] text-white active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Send Order on WhatsApp
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-3">You will be redirected to WhatsApp to confirm your order.</p>
                </div>
              </form>
            </div>
          </div>
        )}
        </main>
      </div>
    );
  }
