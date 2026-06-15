'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats'); // stats, stores, users, orders
  
  // Data States
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const res = await fetch('/api/admin?type=stats');
        const data = await res.json();
        if (res.ok) setStats(data.stats);
      } else if (activeTab === 'stores') {
        const res = await fetch('/api/admin?type=stores');
        const data = await res.json();
        if (res.ok) setStores(data.stores || []);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/admin?type=users');
        const data = await res.json();
        if (res.ok) setUsers(data.users || []);
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/admin?type=orders');
        const data = await res.json();
        if (res.ok) setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStore = async (storeId, approve) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_store', storeId, approve })
      });
      if (res.ok) {
        // Update local list
        setStores(stores.map(s => s.id === storeId ? { ...s, isApproved: approve } : s));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (userId, role) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_role', userId, role })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUser = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_user', userId, active: !currentStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-8">
      {/* Dark Header Panel */}
      <div className="bg-slate-900 text-white p-5 shadow-md sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-extrabold text-orange-400">Admin Control Room</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">⚡ LokaBite Infrastructure Console</p>
          </div>
          <Link
            href="/customer"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-bold"
          >
            Exit Console
          </Link>
        </div>

        {/* Tab Selection Row */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800 text-center text-xs font-bold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'stats' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Statistics
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'stores' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏪 Shop Approvals
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 User Registry
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Order Auditor
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
            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Metrics Snapshot</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card bg-white p-5 text-center shadow-sm">
                    <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
                    <h2 className="text-3xl font-black text-slate-800 mt-1">{stats.totalUsers}</h2>
                  </div>
                  <div className="card bg-white p-5 text-center shadow-sm">
                    <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Active Shops</p>
                    <h2 className="text-3xl font-black text-emerald-600 mt-1">{stats.activeStores}</h2>
                  </div>
                  <div className="card bg-white p-5 text-center shadow-sm">
                    <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Pending Approvals</p>
                    <h2 className="text-3xl font-black text-amber-500 mt-1">{stats.pendingStores}</h2>
                  </div>
                  <div className="card bg-white p-5 text-center shadow-sm">
                    <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                    <h2 className="text-3xl font-black text-orange-500 mt-1">{stats.totalOrders}</h2>
                  </div>
                </div>

                <div className="card bg-white p-5 text-center shadow-sm mt-2">
                  <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Today's Order Runs</p>
                  <h2 className="text-3xl font-black text-indigo-600 mt-1">{stats.ordersToday}</h2>
                </div>
              </div>
            )}

            {/* Stores Tab */}
            {activeTab === 'stores' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Store Approvals Manager ({stores.length})
                </h3>

                {stores.length === 0 ? (
                  <p className="text-slate-400 text-center text-xs py-8 bg-white card shadow-sm">No stores registered yet.</p>
                ) : (
                  stores.map(store => (
                    <div key={store.id} className="card bg-white p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{store.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Category: {store.category}</p>
                        </div>
                        <span className={`badge ${store.isApproved ? 'badge-delivered' : 'badge-pending'}`}>
                          {store.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>

                      <p className="text-2xs text-slate-500 mt-1 leading-normal">
                        Address: {store.address} | Owner: {store.owner?.name || 'Unknown'} ({store.owner?.phone})
                      </p>

                      <div className="border-t border-slate-100 pt-3 mt-3 flex gap-2 justify-end">
                        {store.isApproved ? (
                          <button
                            onClick={() => handleApproveStore(store.id, false)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold rounded-lg"
                          >
                            Suspend Shop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveStore(store.id, true)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Approve Shop Live 🟢
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  User Account System ({users.length})
                </h3>

                {users.map(u => (
                  <div key={u.id} className="card bg-white p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">{u.name || 'Anonymous User'}</h4>
                      <p className="text-xs text-slate-400">Phone: {u.phone}</p>
                      <p className="text-2xs text-slate-400">ID: {u.id}</p>
                      <span className="inline-block text-[9px] font-extrabold tracking-wide uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Active: {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                      <div className="flex gap-1 items-center">
                        <label className="text-2xs font-bold text-slate-400 uppercase mr-1.5">Role</label>
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          disabled={actionLoading}
                          className="input py-1 px-2 text-2xs font-bold text-slate-800 bg-white border border-slate-200"
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="STORE_OWNER">Store Owner</option>
                          <option value="DELIVERY_BOY">Delivery Partner</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleToggleUser(u.id, u.isActive)}
                        disabled={actionLoading}
                        className={`py-1.5 px-3 rounded-lg text-2xs font-bold text-center border transition-all ${
                          u.isActive
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {u.isActive ? 'Suspend User' : 'Unsuspend User'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Global Order Auditing ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <p className="text-slate-400 text-center text-xs py-8 bg-white card shadow-sm">No orders recorded.</p>
                ) : (
                  orders.map(order => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={order.id} className="card bg-white p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-xs">
                              Order #{order.id.substring(0, 8)}
                            </h4>
                            <p className="text-[9px] text-slate-400 mt-0.5">{orderDate}</p>
                          </div>
                          <span className={`badge badge-${order.status.toLowerCase()}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 font-semibold space-y-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                          <p>🏪 Shop: {order.store?.name} ({order.store?.phone})</p>
                          <p>👤 Client: {order.customer?.name || 'Guest'} ({order.customer?.phone})</p>
                          <p>📍 Location: {order.address?.fullAddress}</p>
                          {order.paymentId && <p>💳 UPI Pay Reference: {order.paymentId}</p>}
                        </div>

                        <div className="border-t border-slate-100 pt-2.5 mt-2.5 flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>Subtotal + Delivery</span>
                          <span className="text-orange-500">₹{order.subtotal.toFixed(0)} + ₹20 = ₹{order.totalAmount.toFixed(0)}</span>
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
