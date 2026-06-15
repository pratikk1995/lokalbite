'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomerNav from '@/components/CustomerNav';

export default function CustomerOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30">
        <h1 className="text-lg font-extrabold text-slate-800">My Orders</h1>
      </div>

      {/* List */}
      <div className="p-4 space-y-4 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card animate-pulse h-28 bg-white" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <span className="text-4xl mb-2 block">📦</span>
            <p className="text-slate-500 font-bold">No Orders Placed Yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Browse shops and enjoy fresh deliveries.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemSummary = order.orderItems
                ?.map((item) => `${item.product?.name || 'Item'} x ${item.quantity}`)
                .join(', ');
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <Link key={order.id} href={`/customer/orders/${order.id}`} className="block">
                  <div className="card bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                          {order.store?.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {orderDate}
                        </p>
                      </div>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate mb-3">
                      {itemSummary}
                    </p>

                    <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Grand Total</span>
                      <span className="text-orange-500">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CustomerNav />
    </div>
  );
}
