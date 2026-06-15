'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StoreNav from '@/components/StoreNav';

export default function StoreDashboard() {
  const router = useRouter();

  const [store, setStore] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingStore, setTogglingStore] = useState(false);
  const [error, setError] = useState('');

  // Fetch store and orders on mount
  useEffect(() => {
    fetchStoreAndOrders();
    const interval = setInterval(fetchOrdersOnly, 8000); // 8-second polling
    return () => clearInterval(interval);
  }, []);

  const fetchStoreAndOrders = async () => {
    try {
      const storeRes = await fetch('/api/stores/mine');
      const storeData = await storeRes.json();
      if (!storeRes.ok) throw new Error(storeData.error || 'Failed to fetch store');

      if (!storeData.store) {
        setLoading(false);
        return; // Prompt store registration
      }

      setStore(storeData.store);

      // Fetch owner orders
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      if (ordersRes.ok) {
        const orders = ordersData.orders || [];
        setAllOrders(orders);
        setActiveOrders(orders.filter(o =>
          o.status !== 'DELIVERED' &&
          o.status !== 'CANCELLED' &&
          o.status !== 'PENDING_PAYMENT'
        ));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersOnly = async () => {
    try {
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      if (ordersRes.ok) {
        const orders = ordersData.orders || [];
        setAllOrders(orders);
        setActiveOrders(orders.filter(o =>
          o.status !== 'DELIVERED' &&
          o.status !== 'CANCELLED' &&
          o.status !== 'PENDING_PAYMENT'
        ));
      }
    } catch (err) {
      console.error('Error polling orders:', err);
    }
  };

  const handleToggleStoreOpen = async () => {
    if (!store) return;
    setTogglingStore(true);
    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !store.isOpen })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');
      setStore(data.store);
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingStore(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, rejectReason = '') => {
    try {
      const body = { status: newStatus };
      if (newStatus === 'CANCELLED') {
        body.cancelReason = rejectReason || 'Rejected by store owner';
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      // Refresh order list
      fetchOrdersOnly();
    } catch (err) {
      alert(err.message);
    }
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

  // Prompt register
  if (!store) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col justify-between pb-20">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-6xl mb-4">🏪</span>
          <h2 className="text-xl font-bold text-slate-800">Register Your Store</h2>
          <p className="text-slate-400 text-sm mt-1 mb-6 max-w-xs mx-auto">
            You need to register your store details before you can start selling on LokaBite.
          </p>
          <Link href="/store/register" className="btn-primary px-8 w-auto">
            Register Shop Now
          </Link>
        </div>
        <StoreNav />
      </div>
    );
  }

  // Calculate metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
  const todaySales = todayOrders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Orange Gradient Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 pt-8 pb-10 rounded-b-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-extrabold truncate max-w-[200px]">{store.name}</h1>
            <p className="text-[10px] text-orange-100 font-medium">🏪 {store.category}</p>
          </div>
          <button
            onClick={handleToggleStoreOpen}
            disabled={togglingStore}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              store.isOpen
                ? 'bg-white border-white text-orange-600'
                : 'bg-orange-700 border-orange-700 text-orange-200'
            }`}
          >
            {store.isOpen ? '🟢 Open' : '🔴 Closed'}
          </button>
        </div>

        {/* Warning Banner */}
        {!store.isApproved && (
          <div className="bg-amber-500 bg-opacity-30 border border-amber-400 text-white p-3 rounded-xl text-xs font-semibold mb-4 leading-relaxed">
            ⚠️ Store pending admin approval. You will go live once administrators approve your shop profile.
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 text-center mt-6">
          <div className="bg-white bg-opacity-10 rounded-xl p-2.5 border border-white border-opacity-10">
            <p className="text-[9px] text-orange-100 font-bold uppercase tracking-wider">Today's Sales</p>
            <h4 className="text-sm font-extrabold mt-0.5">₹{todaySales.toFixed(0)}</h4>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-2.5 border border-white border-opacity-10">
            <p className="text-[9px] text-orange-100 font-bold uppercase tracking-wider">Today's Orders</p>
            <h4 className="text-sm font-extrabold mt-0.5">{todayOrders.length}</h4>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-2.5 border border-white border-opacity-10">
            <p className="text-[9px] text-orange-100 font-bold uppercase tracking-wider">Active Orders</p>
            <h4 className="text-sm font-extrabold mt-0.5">{activeOrders.length}</h4>
          </div>
        </div>
      </div>

      {/* Active orders */}
      <div className="px-4 py-4 flex-1">
        <h3 className="text-xs font-extrabold text-slate-400 mb-3 tracking-wide uppercase">
          Active Store Orders ({activeOrders.length})
        </h3>

        {activeOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <span className="text-4xl mb-2 block">🔔</span>
            <p className="text-slate-500 font-bold">No active orders</p>
            <p className="text-slate-400 text-xs mt-1">
              New orders will appear here automatically (8-second poll).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={order.id} className="card bg-white p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Order #{order.id.substring(0, 8)}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Time: {orderTime}</p>
                    </div>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 my-3">
                    <p className="font-bold text-slate-800 flex items-center justify-between">
                      <span>👤 {order.customer?.name || 'Customer'}</span>
                      <a href={`tel:${order.customer?.phone}`} className="text-orange-500 underline text-2xs">Call</a>
                    </p>
                    <p className="text-[10px] leading-relaxed">📍 {order.address?.fullAddress}</p>
                    {order.notes && <p className="text-[10px] text-amber-600 font-medium">📝 Notes: "{order.notes}"</p>}
                  </div>

                  {/* Order items */}
                  <div className="space-y-1.5 text-xs text-slate-700 font-medium my-2">
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.product?.name} x {item.quantity}</span>
                        <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="border-t border-slate-100 pt-3 mt-3 flex gap-2">
                    {order.status === 'PAYMENT_CONFIRMED' && (
                      <>
                        <button
                          onClick={() => {
                            const reason = window.prompt('Reason for rejecting order?');
                            if (reason !== null) {
                              handleUpdateOrderStatus(order.id, 'CANCELLED', reason);
                            }
                          }}
                          className="btn-secondary py-2 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 flex-1"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'ACCEPTED')}
                          className="btn-primary py-2 text-xs font-bold flex-1"
                        >
                          Accept
                        </button>
                      </>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                        className="btn-primary py-2.5 text-xs font-bold w-full"
                      >
                        Start Preparing 👨‍🍳
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                        className="btn-primary py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 w-full"
                      >
                        Mark Ready for Pickup 📦
                      </button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (
                      <div className="text-center text-xs font-semibold text-slate-400 py-1 w-full bg-slate-50 border border-slate-100 rounded-lg">
                        🚴 Waiting for delivery boy acceptance...
                      </div>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <div className="text-center text-xs font-semibold text-emerald-600 py-1.5 w-full bg-emerald-50 border border-emerald-100 rounded-lg">
                        🚴 Partner delivering to customer...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StoreNav />
    </div>
  );
}
