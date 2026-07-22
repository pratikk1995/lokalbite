'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

function VerifyOtpContent() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    const p = searchParams.get('phone');
    if (p) {
      setPhone(p);
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError(t('Please enter a valid 6-digit OTP code'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white">
      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full">
        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
          <span className="text-4xl text-orange-500">🔑</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          {t('Verify OTP')}
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          {t('We sent a 6-digit code to')} <span className="font-semibold text-slate-700">{phone}</span>.
        </p>

        <form onSubmit={handleVerify} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t('OTP Code')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="input text-center tracking-widest text-xl font-bold"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t('Full Name')} <span className="text-slate-300 font-normal">{t('Only if new user')}</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              disabled={loading}
            />
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
                {t('Verifying...')}
              </span>
            ) : (
              t('Verify & Continue')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            For local testing, read the code from your terminal console.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-xs text-orange-500 font-semibold mt-2 hover:underline"
          >
            {t('Go Back')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <svg className="animate-spin h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
