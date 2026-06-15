'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerStoreDetail({ params }) {
  const { id: storeId } = params;
  const router = useRouter();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cart state
  const [cart, setCart] = useState({ storeId: '', storeName: '', items: [] });

  // Load store and menu
  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Store not found');
        return res.json();
      })
      .then((data) => {
        setStore(data.store);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [storeId]);

  // Load cart on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('lokabite_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
  }, []);

  // Sync cart to localStorage
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('lokabite_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (product) => {
    // If cart is empty or belongs to another store
    if (cart.storeId && cart.storeId !== storeId) {
      const confirmClear = window.confirm(
        `Your cart contains items from "${cart.storeName}". Would you like to clear it to order from "${store.name}" instead?`
      );
      if (!confirmClear) return;
      
      // Clear and add new item
      const freshCart = {
        storeId,
        storeName: store.name,
        items: [{ productId: product.id, name: product.name, price: product.price, quantity: 1 }]
      };
      saveCart(freshCart);
      return;
    }

    const currentItems = [...cart.items];
    const existingItem = currentItems.find((item) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    saveCart({
      storeId: storeId,
      storeName: store.name,
      items: currentItems
    });
  };

  const handleRemoveOne = (productId) => {
    let currentItems = [...cart.items];
    const itemIndex = currentItems.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) return;

    if (currentItems[itemIndex].quantity > 1) {
      currentItems[itemIndex].quantity -= 1;
    } else {
      currentItems.splice(itemIndex, 1);
    }

    // If no items left, reset cart completely
    if (currentItems.length === 0) {
      saveCart({ storeId: '', storeName: '', items: [] });
    } else {
      saveCart({
        ...cart,
        items: currentItems
      });
    }
  };

  const getProductQuantity = (productId) => {
    if (cart.storeId !== storeId) return 0;
    const item = cart.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
        <span className="text-4xl mb-2">❌</span>
        <h2 className="text-xl font-bold text-slate-800">Shop Not Found</h2>
        <p className="text-slate-400 text-sm mt-1 mb-4">{error || 'Store detail could not be loaded.'}</p>
        <Link href="/customer" className="btn-primary px-6 w-auto">
          Back to Stores
        </Link>
      </div>
    );
  }

  // Group products by category
  const productsByCategory = (store.products || []).reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const totalCartItems = cart.storeId === storeId ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const totalCartPrice = cart.storeId === storeId ? cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-24">
      {/* Hero Banner header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 relative">
        <button
          onClick={() => router.push('/customer')}
          className="w-10 h-10 bg-black bg-opacity-20 hover:bg-opacity-35 rounded-full flex items-center justify-center font-bold text-sm border border-white border-opacity-10 mb-4"
        >
          ⬅️
        </button>

        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-400 bg-opacity-40 px-2 py-0.5 rounded">
              {store.category}
            </span>
            <h1 className="text-2xl font-extrabold mt-1">{store.name}</h1>
            <p className="text-orange-100 text-xs mt-1">{store.description || 'Welcome to our store!'}</p>
          </div>
          <div className="bg-white text-orange-600 font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-sm border border-orange-100 shrink-0">
            ★ {store.rating?.toFixed(1) || '5.0'}
          </div>
        </div>

        <div className="border-t border-orange-400 border-opacity-30 mt-4 pt-4 flex gap-4 text-xs font-semibold text-orange-50">
          <span>📞 {store.phone}</span>
          <span>•</span>
          <span className="truncate">📍 {store.address}</span>
        </div>
      </div>

      {/* Store status warning */}
      {!store.isOpen && (
        <div className="bg-rose-50 border-y border-rose-100 text-rose-600 px-6 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1">
          <span>⚠️</span> Store is currently closed. You can view the menu but ordering is disabled.
        </div>
      )}

      {/* Product List */}
      <div className="flex-1 px-4 py-4 space-y-6">
        {Object.keys(productsByCategory).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <span className="text-4xl mb-2 block">🍽️</span>
            <p className="text-slate-500 font-bold">No items available</p>
            <p className="text-slate-400 text-xs mt-1">
              Check back later! The shop owner hasn't listed any products yet.
            </p>
          </div>
        ) : (
          Object.keys(productsByCategory).map((catName) => (
            <div key={catName} className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {catName}
              </h3>
              <div className="space-y-3">
                {productsByCategory[catName].map((product) => {
                  const qty = getProductQuantity(product.id);
                  return (
                    <div key={product.id} className="card p-4 flex justify-between items-center gap-4 bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">
                            {product.name}
                          </h4>
                          {!product.available && (
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1 rounded uppercase">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {product.description || 'Tasty fresh items.'}
                        </p>
                        <p className="text-sm font-extrabold text-slate-700 mt-2">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Add/Remove Action */}
                      <div className="shrink-0">
                        {product.available && store.isOpen ? (
                          qty > 0 ? (
                            <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                              <button
                                onClick={() => handleRemoveOne(product.id)}
                                className="px-3 py-2 text-orange-600 font-extrabold text-sm active:bg-orange-100"
                              >
                                -
                              </button>
                              <span className="px-2 font-bold text-slate-800 text-sm select-none">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="px-3 py-2 text-orange-600 font-extrabold text-sm active:bg-orange-100"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="px-4 py-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 active:scale-95 transition-all text-xs font-bold rounded-xl"
                            >
                              ADD
                            </button>
                          )
                        ) : (
                          <button
                            disabled
                            className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-xl"
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating View Cart bar */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[432px] bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center z-50 animate-bounce">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} added
            </p>
            <h4 className="font-extrabold text-base">
              ₹{totalCartPrice.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">(Excl. delivery)</span>
            </h4>
          </div>
          <button
            onClick={() => router.push('/customer/cart')}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 shadow-md transition-all"
          >
            View Cart 🛒
          </button>
        </div>
      )}
    </div>
  );
}
