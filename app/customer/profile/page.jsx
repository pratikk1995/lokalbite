'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomerNav from '@/components/CustomerNav';

export default function CustomerProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch((err) => {
        console.error(err);
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE'
      });
      if (res.ok) {
        localStorage.removeItem('lokabite_cart');
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Header Profile card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 pt-8 pb-10 rounded-b-[2rem] shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-2xl border border-white border-opacity-10 shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{user?.name || 'LokaBite User'}</h1>
          <p className="text-orange-100 text-xs mt-0.5">{user?.phone}</p>
          <span className="inline-block mt-2 text-[9px] font-bold tracking-widest uppercase bg-white bg-opacity-25 px-2 py-0.5 rounded">
            Role: {user?.role}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Language Preferences */}
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-1">🌐 App Language</h3>
          <p className="text-xs text-slate-400 mb-3">
            Choose your preferred language for the LokaBite application.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.setItem('lokabite_language', 'en');
                window.location.reload();
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              English
            </button>
            <button
              onClick={() => {
                localStorage.setItem('lokabite_language', 'mr');
                window.location.reload();
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              मराठी (Marathi)
            </button>
          </div>
        </div>

        {/* Address management */}
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-1">📍 Saved Locations</h3>
          <p className="text-xs text-slate-400 mb-3">
            Add or review your delivery locations for faster checkout.
          </p>
          <Link href="/customer/addresses" className="btn-secondary py-2.5 text-slate-700 text-xs font-bold w-full text-center">
            Manage Addresses
          </Link>
        </div>

        {/* Admin workspace */}
        {user?.role === 'ADMIN' && (
          <div className="card bg-slate-900 border-none text-white">
            <h3 className="font-extrabold text-orange-400 text-sm mb-1">⚡ Administrator Console</h3>
            <p className="text-xs text-slate-400 mb-3">
              System Admin. Approve stores, change user role elevations, and trace overall transactions.
            </p>
            <Link href="/admin" className="btn-primary bg-orange-500 hover:bg-orange-600 text-xs font-bold w-full text-center py-2.5">
              Enter Admin Portal
            </Link>
          </div>
        )}

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 text-center mt-6"
        >
          Logout Session
        </button>
      </div>

      <CustomerNav />
    </div>
  );
}
