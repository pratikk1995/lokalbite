'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DeliveryWorkspace() {
  const router = useRouter();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('available'); // available, active, earnings
  
  // Data States
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState('');
  const [completingId, setCompletingId] = useState('');

  useEffect(() => {
    fetchData();
    // Poll available orders every 5 seconds
    const interval = setInterval(fetchAvailableOnly, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch available deliveries
      const availRes = await fetch('/api/orders/available');
      if (availRes.ok) {
        const availData = await availRes.json();
        setAvailableOrders(availData.orders || []);
      }

      // Fetch active/past deliveries
      const myRes = await fetch('/api/orders');
      if (myRes.ok) {
        const myData = await myRes.json();
        setMyOrders(myData.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOnly = async () => {
    try {
      const availRes = await fetch('/api/orders/available');
      if (availRes.ok) {
        const availData = await availRes.json();
        setAvailableOrders(availData.orders || []);
      }
    } catch (e) {
      console.error('Error polling available orders:', e);
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    setAcceptingId(orderId);
    try {
      const res = await fetch('/api/orders/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim delivery');

      // Refresh data and switch to active tab
      await fetchData();
      setActiveTab('active');
    } catch (err) {
      alert(err.message);
    } finally {
      setAcceptingId('');
    }
  };

  const handleMarkDelivered = async (orderId) => {
    const confirmDeliver = window.confirm('Have you successfully delivered the order and collected payment (if required)?');
    if (!confirmDeliver) return;

    setCompletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete order');

      // Refresh data and switch to earnings tab
      await fetchData();
      setActiveTab('earnings');
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingId('');
    }
  };

  // Derived datasets
  const activeDeliveries = myOrders.filter(o => o.status === 'OUT_FOR_DELIVERY');
  const completedDeliveries = myOrders.filter(o => o.status === 'DELIVERED');
  const earnings = completedDeliveries.length * 20; // ₹20 flat fee per delivery

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 shadow-md sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-extrabold text-orange-400">Rider Workspace</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🚴 LokaBite Delivery Partner</p>
          </div>
          <Link
            href="/customer"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-bold"
          >
            Customer Panel
          </Link>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 text-center text-xs font-bold pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'available'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Runs ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'active'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Drops ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'earnings'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Earnings (₹{earnings})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {loading ? (
          <div className="space-y-3">
            <div className="card animate-pulse h-28 bg-white" />
            <div className="card animate-pulse h-28 bg-white" />
          </div>
        ) : (
          <>
            {/* Open Runs (Available Deliveries) */}
            {activeTab === 'available' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Open Deliveries Near You
                </h3>

                {availableOrders.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <span className="text-4xl mb-2 block">🔔</span>
                    <p className="text-slate-500 font-bold">Waiting for orders</p>
                    <p className="text-slate-400 text-xs mt-1">
                      New pickup opportunities appear automatically (5s poll).
                    </p>
                  </div>
                ) : (
                  availableOrders.map(order => (
                    <div key={order.id} className="card bg-white p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                          Flat ₹20 Reward
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">#{order.id.substring(0, 8)}</span>
                      </div>

                      {/* Route Details */}
                      <div className="space-y-3 text-xs leading-relaxed font-semibold text-slate-600">
                        <div className="flex gap-2">
                          <span className="text-slate-400">🏪 From:</span>
                          <div>
                            <p className="font-bold text-slate-800">{order.store?.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Store Address: {order.store?.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2.5 border-t border-dashed border-slate-100">
                          <span className="text-slate-400">📍 Drop:</span>
                          <div>
                            <p className="font-bold text-slate-800">{order.address?.fullAddress}</p>
                            {order.address?.landmark && (
                              <p className="text-[10px] text-slate-500 font-medium">Landmark: {order.address.landmark}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptDelivery(order.id)}
                        disabled={acceptingId === order.id}
                        className="btn-primary mt-4 py-2.5 text-xs font-bold w-full"
                      >
                        {acceptingId === order.id ? 'Claiming run...' : 'Accept Job 🚴'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* My Drops (Active Deliveries) */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Active Drop Tasks ({activeDeliveries.length})
                </h3>

                {activeDeliveries.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <span className="text-4xl mb-2 block">🚴</span>
                    <p className="text-slate-500 font-bold">No active tasks</p>
                    <p className="text-slate-400 text-xs mt-1 mb-4">
                      Accept delivery requests from the Open Runs tab.
                    </p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="btn-primary px-6 w-auto mx-auto py-2 text-xs font-bold"
                    >
                      Browse Open Runs
                    </button>
                  </div>
                ) : (
                  activeDeliveries.map(order => (
                    <div key={order.id} className="card bg-white p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="badge badge-out_for_delivery">Out For Delivery</span>
                        <span className="text-[10px] text-slate-400 font-medium">#{order.id.substring(0, 8)}</span>
                      </div>

                      {/* Store pickup contacts */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1. Pickup Store</p>
                            <h4 className="font-bold text-slate-800 text-xs mt-0.5">{order.store?.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-snug">{order.store?.address}</p>
                          </div>
                          <a
                            href={`tel:${order.store?.phone}`}
                            className="w-8 h-8 bg-white hover:bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-sm shadow-sm"
                          >
                            📞
                          </a>
                        </div>
                      </div>

                      {/* Customer drop contacts */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">2. Customer Dropoff</p>
                            <h4 className="font-bold text-slate-800 text-xs mt-0.5">{order.customer?.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-snug">{order.address?.fullAddress}</p>
                            {order.address?.landmark && (
                              <p className="text-[10px] text-amber-600 font-medium mt-0.5">Landmark: {order.address.landmark}</p>
                            )}
                          </div>
                          <a
                            href={`tel:${order.customer?.phone}`}
                            className="w-8 h-8 bg-white hover:bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-sm shadow-sm"
                          >
                            📞
                          </a>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-2xs font-semibold text-amber-700 mb-4 leading-normal">
                          📝 Notes: "{order.notes}"
                        </div>
                      )}

                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        disabled={completingId === order.id}
                        className="btn-primary py-3 text-xs font-bold w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {completingId === order.id ? 'Saving state...' : 'Mark as Delivered 📦'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Earnings History */}
            {activeTab === 'earnings' && (
              <div className="space-y-4">
                {/* Statistics panel */}
                <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 border-none text-center shadow-md">
                  <p className="text-[10px] text-orange-100 font-bold uppercase tracking-widest">Lifetime Payout</p>
                  <h2 className="text-3xl font-black mt-1">₹{earnings}</h2>
                  <p className="text-2xs text-orange-100 font-medium mt-1">
                    Calculated at flat ₹20 reward per successfully delivered drop.
                  </p>
                </div>

                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Delivered Order Log ({completedDeliveries.length})
                </h3>

                {completedDeliveries.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <span className="text-4xl mb-2 block">💸</span>
                    <p className="text-slate-500 font-bold">No runs completed yet</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Your payout details will populate here once you deliver active orders.
                    </p>
                  </div>
                ) : (
                  completedDeliveries.map(order => {
                    const dateStr = new Date(order.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={order.id} className="card bg-white p-4 flex justify-between items-center gap-4 shadow-sm border border-slate-100">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs">Order #{order.id.substring(0, 8)}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Completed: {dateStr}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">Shop: {order.store?.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-emerald-600">+₹20</span>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Rider Fee</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
