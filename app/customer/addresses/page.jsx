'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerAddresses() {
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [label, setLabel] = useState('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullAddress) {
      setFormError('Please enter the full address');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, fullAddress, landmark })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add address');
      }

      setAddresses([data.address, ...addresses]);
      // Reset form fields
      setFullAddress('');
      setLandmark('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center gap-3">
        <button
          onClick={() => router.push('/customer/profile')}
          className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold"
        >
          ⬅️
        </button>
        <h1 className="text-base font-extrabold text-slate-800">My Addresses</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Add Address Form */}
        <div className="card bg-white">
          <h3 className="font-extrabold text-slate-800 text-sm mb-3">Add New Address</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              {['Home', 'Work', 'Other'].map(lbl => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setLabel(lbl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    label === lbl
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
              placeholder="e.g. House No. 42, Ram Mandir Lane, Kolhapur"
              value={fullAddress}
              onChange={e => setFullAddress(e.target.value)}
              className="input text-xs"
              disabled={formLoading}
              required
            />

            <input
              type="text"
              placeholder="Landmark (e.g. Near old Banyan tree)"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              className="input text-xs"
              disabled={formLoading}
            />

            {formError && <p className="text-2xs text-rose-500 font-bold">⚠️ {formError}</p>}

            <button
              type="submit"
              className="btn-primary py-2.5 text-xs font-bold w-full"
              disabled={formLoading}
            >
              {formLoading ? 'Adding...' : 'Save Location'}
            </button>
          </form>
        </div>

        {/* Addresses List */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Saved Locations
          </h3>

          {loading ? (
            <div className="space-y-2">
              <div className="animate-pulse h-16 bg-white rounded-xl" />
              <div className="animate-pulse h-16 bg-white rounded-xl" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-400 text-xs font-semibold">No saved addresses found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr.id} className="card bg-white p-4">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    {addr.label}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-2 leading-relaxed">
                    {addr.fullAddress}
                  </p>
                  {addr.landmark && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
