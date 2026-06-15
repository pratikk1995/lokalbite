'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StoreRegister() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Restaurant');
  
  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !phone || !category) {
      setError('Please fill out all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, address, phone, category })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register store');

      // Success, redirect to store dashboard
      router.push('/store');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center gap-3">
        <Link
          href="/customer/profile"
          className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold"
        >
          ⬅️
        </Link>
        <h1 className="text-base font-extrabold text-slate-800">Register Store</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-3">Shop Details</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Apply to register your restaurant, grocery shop, or kitchen on LokaBite. Once approved by the administrator, customers can browse and order from your shop.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Store Name</label>
              <input
                type="text"
                placeholder="e.g. Balaji Restaurant or Swastik Grocery"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input text-xs"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
              <textarea
                placeholder="e.g. Fresh daily meals, spices, milk, and seasonal vegetables"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input text-xs h-16 resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Address</label>
              <input
                type="text"
                placeholder="e.g. Shop No. 12, Main Bazar, Kolhapur Road"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="input text-xs"
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91XXXXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input text-xs"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input text-xs bg-white"
                  disabled={loading}
                  required
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Sweets">Sweets</option>
                  <option value="Meat">Meat</option>
                </select>
              </div>
            </div>

            {error && <p className="text-2xs text-rose-500 font-bold">⚠️ {error}</p>}

            <button
              type="submit"
              className="btn-primary py-2.5 text-xs font-bold"
              disabled={loading}
            >
              {loading ? 'Submitting registration...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
