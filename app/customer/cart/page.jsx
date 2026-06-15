'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomerNav from '@/components/CustomerNav';

export default function CustomerCart() {
  const router = useRouter();

  // Cart & Address State
  const [cart, setCart] = useState({ storeId: '', storeName: '', items: [] });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [addressFormError, setAddressFormError] = useState('');
  const [addressFormLoading, setAddressFormLoading] = useState(false);

  // Load cart on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('lokabite_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || []);
        if (data.addresses && data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newFullAddress) {
      setAddressFormError('Address details are required');
      return;
    }

    setAddressFormLoading(true);
    setAddressFormError('');

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel,
          fullAddress: newFullAddress,
          landmark: newLandmark
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      // Refresh address list and select the new address
      const updatedList = [data.address, ...addresses];
      setAddresses(updatedList);
      setSelectedAddressId(data.address.id);
      
      // Reset form
      setNewFullAddress('');
      setNewLandmark('');
      setShowAddressForm(false);
    } catch (err) {
      setAddressFormError(err.message);
    } finally {
      setAddressFormLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError('Please add or select a delivery address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create the Order (status PENDING_PAYMENT)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: cart.storeId,
          addressId: selectedAddressId,
          notes: notes,
          items: cart.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity
          }))
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Checkout failed');
      }

      const order = orderData.order;

      // Step 2: Initialize Razorpay Payment Link
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        throw new Error(paymentData.error || 'Failed to create payment gateway session');
      }

      // Step 3: Clear local cart
      localStorage.removeItem('lokabite_cart');

      // Step 4: Redirect to Razorpay (opens in browser tab/web frame)
      window.location.href = paymentData.short_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const updateItemQty = (productId, delta) => {
    let currentItems = [...cart.items];
    const index = currentItems.findIndex(i => i.productId === productId);
    if (index === -1) return;

    if (delta > 0) {
      currentItems[index].quantity += 1;
    } else {
      if (currentItems[index].quantity > 1) {
        currentItems[index].quantity -= 1;
      } else {
        currentItems.splice(index, 1);
      }
    }

    const updatedCart = currentItems.length === 0
      ? { storeId: '', storeName: '', items: [] }
      : { ...cart, items: currentItems };

    setCart(updatedCart);
    localStorage.setItem('lokabite_cart', JSON.stringify(updatedCart));
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20.0;
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  if (cart.items.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col justify-between pb-20">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-6xl mb-4">🛒</span>
          <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Add items from your favorite local shops to get started.
          </p>
          <Link href="/customer" className="btn-primary px-8 w-auto">
            Browse Stores
          </Link>
        </div>
        <CustomerNav />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Header banner */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-slate-800">My Checkout</h1>
        <button
          onClick={() => {
            localStorage.removeItem('lokabite_cart');
            setCart({ storeId: '', storeName: '', items: [] });
          }}
          className="text-xs text-rose-500 font-bold hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Cart Store Title */}
        <div className="card bg-white">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Ordering From
          </p>
          <h3 className="font-extrabold text-slate-800 text-base mb-3 mt-0.5">
            {cart.storeName}
          </h3>

          {/* Items checklist */}
          <div className="space-y-3 divide-y divide-slate-100">
            {cart.items.map((item, idx) => (
              <div key={item.productId} className={`flex justify-between items-center ${idx > 0 ? 'pt-3' : ''}`}>
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <button
                    onClick={() => updateItemQty(item.productId, -1)}
                    className="px-2.5 py-1 text-slate-600 font-extrabold text-xs active:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="px-1.5 font-bold text-slate-700 text-xs select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItemQty(item.productId, 1)}
                    className="px-2.5 py-1 text-slate-600 font-extrabold text-xs active:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="card bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-slate-800 text-sm">Delivery Address</h3>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs text-orange-500 font-bold hover:underline"
              >
                + Add Address
              </button>
            )}
          </div>

          {showAddressForm ? (
            <form onSubmit={handleAddAddress} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map(lbl => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewLabel(lbl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      newLabel === lbl
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Full address (Street, Village name, Shop name)"
                value={newFullAddress}
                onChange={e => setNewFullAddress(e.target.value)}
                className="input text-xs"
                disabled={addressFormLoading}
                required
              />

              <input
                type="text"
                placeholder="Landmark (Optional, e.g. Near bus stop)"
                value={newLandmark}
                onChange={e => setNewLandmark(e.target.value)}
                className="input text-xs"
                disabled={addressFormLoading}
              />

              {addressFormError && <p className="text-2xs text-rose-500 font-bold">⚠️ {addressFormError}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
                  disabled={addressFormLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg"
                  disabled={addressFormLoading}
                >
                  {addressFormLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : addressLoading ? (
            <div className="animate-pulse h-10 bg-slate-50 rounded-xl" />
          ) : addresses.length === 0 ? (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-center">
              <p className="text-xs font-semibold text-orange-600">No delivery address saved</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="btn-primary mt-2 text-xs font-bold py-2 px-4 w-auto mx-auto"
              >
                Add Delivery Address
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {addresses.map(addr => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedAddressId === addr.id
                      ? 'border-orange-500 bg-orange-50 bg-opacity-30'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSelect"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 accent-orange-500"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-1.5">
                      {addr.label}
                    </span>
                    <p className="text-xs text-slate-800 font-bold mt-1 leading-snug">{addr.fullAddress}</p>
                    {addr.landmark && <p className="text-[10px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Order Notes */}
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-2">Order Notes</h3>
          <textarea
            placeholder="Add delivery instructions (e.g. Leave with security, ring bell, don't add cutlery)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input text-xs h-16 resize-none"
          />
        </div>

        {/* Bill Summary */}
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-3">Bill Details</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between font-semibold">
              <span>Item Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Delivery Partner Fee (Flat)</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-extrabold text-slate-800 text-sm">
              <span>Grand Total</span>
              <span className="text-orange-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handleCheckout}
          disabled={loading || addresses.length === 0}
          className="btn-primary w-full py-4 text-sm font-extrabold flex items-center gap-2 justify-center shadow-lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Setting up secure UPI checkout...
            </>
          ) : (
            `Proceed to Pay • ₹${total.toFixed(2)} 📱`
          )}
        </button>
      </div>

      <CustomerNav />
    </div>
  );
}
