'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerOrderTracking({ params }) {
  const { id: orderId } = params;
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  // Poll order details every 5 seconds
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = () => {
      fetch(`/api/orders/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Order not found');
          return res.json();
        })
        .then((data) => {
          setOrder(data.order);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', cancelReason: 'Cancelled by customer' })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setOrder(data.order);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryPayment = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      window.location.href = data.short_url;
    } catch (err) {
      alert(err.message);
      setPaying(false);
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

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
        <span className="text-4xl mb-2 text-rose-500">⚠️</span>
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-slate-400 text-sm mt-1 mb-4">{error || 'Order detail could not be loaded.'}</p>
        <Link href="/customer/orders" className="btn-primary px-6 w-auto">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Helper status flags
  const statusTexts = {
    PENDING_PAYMENT: 'Waiting for UPI payment',
    PAYMENT_CONFIRMED: 'Paid! Waiting for store to accept',
    ACCEPTED: 'Order accepted by store owner',
    PREPARING: 'Kitchen is preparing your fresh order',
    READY_FOR_PICKUP: 'Ready for pickup! Delivery partner arriving',
    OUT_FOR_DELIVERY: 'Out for delivery! On the way to you',
    DELIVERED: 'Delivered successfully! Enjoy your food',
    CANCELLED: 'This order was cancelled'
  };

  const currentStatusIndex = ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center gap-3">
        <button
          onClick={() => router.push('/customer/orders')}
          className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold"
        >
          ⬅️
        </button>
        <div>
          <h1 className="text-base font-extrabold text-slate-800">Track Order</h1>
          <p className="text-[10px] text-slate-400 font-medium">#{order.id.substring(0, 8)}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Status Card Banner */}
        <div className="card bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 border-none">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Current Status
          </p>
          <h2 className="text-lg font-extrabold mt-1 text-orange-400 leading-snug">
            {statusTexts[order.status] || order.status}
          </h2>

          {/* Cancel details */}
          {order.status === 'CANCELLED' && order.cancelReason && (
            <p className="text-xs text-rose-300 font-medium mt-2 bg-rose-500 bg-opacity-20 border border-rose-400 border-opacity-30 p-2 rounded-lg">
              Reason: {order.cancelReason}
            </p>
          )}

          {/* Simple step indicator for non-cancelled orders */}
          {order.status !== 'CANCELLED' && (
            <div className="mt-4 flex items-center justify-between gap-1 text-[10px] text-slate-400 font-bold">
              <span className={currentStatusIndex >= 1 ? 'text-emerald-400' : ''}>Ordered</span>
              <span>➔</span>
              <span className={currentStatusIndex >= 3 ? 'text-emerald-400' : ''}>Preparing</span>
              <span>➔</span>
              <span className={currentStatusIndex >= 5 ? 'text-emerald-400' : ''}>On the Way</span>
              <span>➔</span>
              <span className={currentStatusIndex >= 6 ? 'text-emerald-400' : ''}>Delivered</span>
            </div>
          )}
        </div>

        {/* Retry Payment (if PENDING) */}
        {order.status === 'PENDING_PAYMENT' && (
          <div className="card bg-amber-50 border-amber-200 p-4">
            <h3 className="font-extrabold text-amber-800 text-sm mb-1">Payment is Pending</h3>
            <p className="text-xs text-amber-600 mb-3 leading-relaxed">
              We did not receive confirmation for this payment. If you already made a payment, please wait or retry.
            </p>
            <button
              onClick={handleRetryPayment}
              disabled={paying}
              className="btn-primary bg-amber-500 hover:bg-amber-600 font-bold text-xs"
            >
              {paying ? 'Opening gateway...' : 'Pay with UPI Now 📱'}
            </button>
          </div>
        )}

        {/* Store & Delivery Contacts */}
        <div className="card bg-white space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Store Details
              </p>
              <h3 className="font-bold text-slate-800 text-sm mt-0.5">{order.store?.name}</h3>
            </div>
            <a
              href={`tel:${order.store?.phone}`}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-lg shadow-sm active:scale-95 transition-all"
            >
              📞
            </a>
          </div>

          {order.deliveryBoy ? (
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Delivery Partner
                </p>
                <h3 className="font-bold text-slate-800 text-sm mt-0.5">{order.deliveryBoy.name}</h3>
                <p className="text-[10px] text-emerald-600 font-medium">Out for delivery</p>
              </div>
              <a
                href={`tel:${order.deliveryBoy.phone}`}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-lg shadow-sm active:scale-95 transition-all"
              >
                📞
              </a>
            </div>
          ) : order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
            <div className="border-t border-slate-100 pt-3 text-xs text-slate-400 font-semibold">
              🚴 Delivery partner will be assigned once store completes preparing the order.
            </div>
          ) : null}
        </div>

        {/* Drop address details */}
        <div className="card bg-white">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Deliver To
          </p>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
            {order.address?.label || 'Home'}
          </span>
          <p className="text-xs font-bold text-slate-800 mt-2 leading-relaxed">
            {order.address?.fullAddress}
          </p>
          {order.address?.landmark && (
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Landmark: {order.address.landmark}
            </p>
          )}
          {order.notes && (
            <div className="mt-3 bg-slate-50 border border-slate-100 p-2 rounded-lg">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Notes</p>
              <p className="text-xs text-slate-600 font-medium">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Bill breakdown */}
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-3">Order Items</h3>
          <div className="space-y-2.5 divide-y divide-slate-100">
            {order.orderItems?.map((item, idx) => (
              <div key={item.id} className={`flex justify-between items-center text-xs ${idx > 0 ? 'pt-2.5' : ''}`}>
                <div className="text-slate-700 font-semibold pr-4">
                  {item.product?.name || 'Deleted item'} <span className="text-slate-400 font-bold text-2xs ml-1">x {item.quantity}</span>
                </div>
                <span className="font-extrabold text-slate-800">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-3 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Delivery Partner Fee</span>
              <span>₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-1.5 border-t border-slate-50">
              <span>Total Amount</span>
              <span className="text-orange-500">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cancel Button (Visible only during PENDING_PAYMENT or PAYMENT_CONFIRMED) */}
        {(order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_CONFIRMED') && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="w-full py-3 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
}
