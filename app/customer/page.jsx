'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomerNav from '@/components/CustomerNav';
import { useLanguage } from '@/components/LanguageProvider';
import LocationPicker from '@/components/LocationPicker';

const CATEGORIES = ['All', 'Restaurant', 'Grocery', 'Bakery', 'Sweets', 'Meat'];

export default function CustomerDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [userName, setUserName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    // Fetch profile
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name || t('Friend'));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = `/api/stores?category=${category === 'All' ? '' : encodeURIComponent(category)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setStores(data.stores || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category]);

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    (store.description && store.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 bg-slate-50 flex flex-col pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 pt-8 pb-10 rounded-b-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <LocationPicker 
            currentLocation={currentLocation} 
            onLocationUpdate={setCurrentLocation} 
          />
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg border border-white border-opacity-20">
            {userName ? userName.charAt(0).toUpperCase() : '👤'}
          </div>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">
          {t('Namaste')}, {userName || t('Friend')}!
        </h1>
        <p className="text-orange-100 text-sm mb-4">
          {t('Fresh meals & daily groceries delivered instantly.')}
        </p>

        {/* Search */}
        <div className="relative shadow-md rounded-2xl overflow-hidden bg-white text-slate-800">
          <input
            type="text"
            placeholder={t('Search stores, restaurants, categories...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 outline-none font-medium text-sm"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-full"
            >
              {t('Clear')}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm border transition-all ${
                category === cat
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Stores List */}
      <div className="px-4 py-4 flex-1">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3 tracking-wide uppercase">
          {category === 'All' ? t('Available Stores') : `${t(category)} ${t('Shops')}`}
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card animate-pulse h-24 bg-white flex items-center justify-between" />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <span className="text-4xl mb-2 block">🏪</span>
            <p className="text-slate-500 font-bold">{t('No shops active')}</p>
            <p className="text-slate-400 text-xs mt-1">
              {t('Select another category or modify search query.')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <Link key={store.id} href={`/customer/store/${store.id}`} className="block">
                <div className="card hover:shadow-md transition-all flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-extrabold text-slate-800 text-base leading-snug">
                        {store.name}
                      </h4>
                      <span className="text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded">
                        {t(store.category)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                      {store.description || t('No description available.')}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                      <span>⭐ {store.rating?.toFixed(1) || '5.0'}</span>
                      <span>•</span>
                      <span className="truncate">📍 {store.address}</span>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border border-white shadow-sm shrink-0 mt-1.5 ${store.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} title={store.isOpen ? t('Open') : t('Closed')} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CustomerNav />
    </div>
  );
}
