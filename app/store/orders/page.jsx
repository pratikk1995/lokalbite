'use client';

import { useState, useEffect } from 'react';
import StoreNav from '@/components/StoreNav';

export default function StoreOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // We only want completed (Delivered) or Cancelled orders for history
        const filtered = (data.orders || []).filter(o => 
          o.status === 'DELIVERED' || o.status === 'CANCELLED'
        );
        setOrders(filtered);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30">
        <h1 className="text-lg font-extrabold text-slate-800">Order History</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="card animate-pulse h-24 bg-white" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <span className="text-4xl mb-2 block">📁</span>
            <p className="text-slate-500 font-bold">No completed orders</p>
            <p className="text-slate-400 text-xs mt-1">
              Your store's past delivered and cancelled orders will be archived here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });
              const summaryItems = order.orderItems?.map(i => `${i.product?.name} x ${i.quantity}`).join(', ');

              return (
                <div key={order.id} className="card bg-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Order #{order.id.substring(0, 8)}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{orderDate}</p>
                    </div>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 truncate">
                    Items: {summaryItems}
                  </p>

                  <div className="border-t border-slate-100 pt-2.5 mt-2.5 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Total Sales</span>
                    <span className="text-orange-500">₹{order.subtotal.toFixed(0)}</span>
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
