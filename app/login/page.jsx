'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    let formattedPhone = phone.trim();

    if (!formattedPhone) {
      setError('Please enter a phone number');
      return;
    }

    // Auto prepend +91 for 10-digit indian numbers
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }

    if (!formattedPhone.startsWith('+') || formattedPhone.length < 11) {
      setError('Enter a valid phone number with country code, e.g. +919876543210');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP. Try again.');
      }

      router.push(`/login/verify?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white">
      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full">
        {/* Brand Logo */}
        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
          <span className="text-4xl">🛵</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          LokaBite
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          Local food and grocery delivery designed for rural India.
        </p>

        <form onSubmit={handleSendOtp} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🇮🇳
              </span>
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input pl-12"
                disabled={loading}
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Enter phone with country code (e.g. +91XXXXXXXXXX)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending OTP...
              </span>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400">
        By continuing, you agree to LokaBite's Terms of Service.
      </div>
    </div>
  );
}
