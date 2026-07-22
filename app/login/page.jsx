'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const rawPhone = phone.trim();

    if (rawPhone.length !== 10) {
      setError(t('Enter a valid 10-digit number'));
      return;
    }

    const formattedPhone = `+91${rawPhone}`;

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
        throw new Error(data.error || t('Try Again'));
      }

      router.push(`/login/verify?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10 flex gap-2 bg-slate-50 p-1 rounded-full border border-slate-100 shadow-sm">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            language === 'en' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('mr')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            language === 'mr' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          मराठी
        </button>
        <button
          onClick={() => changeLanguage('hi')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            language === 'hi' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          हिंदी
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full pt-10">
        {/* Brand Logo */}
        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
          <span className="text-4xl">🛵</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          {t('LokaBite')}
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          {t('Local food and grocery delivery designed for rural India.')}
        </p>

        <form onSubmit={handleSendOtp} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t('Enter your mobile number')}
            </label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 bg-slate-50 border-r border-slate-200 rounded-l-xl text-slate-600 font-bold text-sm">
                +91
              </div>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                className="input pl-14"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('Sending...')}
              </span>
            ) : (
              t('Send OTP')
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
