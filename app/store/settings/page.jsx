'use client';

import { useState, useEffect } from 'react';
import StoreNav from '@/components/StoreNav';

export default function StoreSettings() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/stores/mine')
      .then(res => res.json())
      .then(data => {
        if (data.store) {
          setStore(data.store);
          setName(data.store.name || '');
          setDescription(data.store.description || '');
          setAddress(data.store.address || '');
          setPhone(data.store.phone || '');
          setCategory(data.store.category || '');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store) return;
    if (!name || !address || !phone || !category) {
      setError('Name, address, phone, and category are required');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, address, phone, category })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update store settings');

      setStore(data.store);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
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
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30">
        <h1 className="text-lg font-extrabold text-slate-800">Store Settings</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-3">Shop Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Store Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input text-xs"
                disabled={updating}
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input text-xs h-16 resize-none"
                disabled={updating}
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="input text-xs"
                disabled={updating}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input text-xs"
                  disabled={updating}
                  required
                />
              </div>
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input text-xs bg-white"
                  disabled={updating}
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
            {success && <p className="text-2xs text-emerald-600 font-bold">✅ Settings updated successfully!</p>}

            <button
              type="submit"
              className="btn-primary py-2.5 text-xs font-bold"
              disabled={updating}
            >
              {updating ? 'Saving settings...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>

      <StoreNav />
    </div>
  );
}
