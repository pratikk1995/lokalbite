'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export default function LocationPicker({ currentLocation, onLocationUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const { t } = useLanguage();

  // Handle native modal dialog
  useEffect(() => {
    const dialog = document.getElementById('location-picker');
    if (dialog) {
      if (isOpen) dialog.showModal();
      else dialog.close();
    }
  }, [isOpen]);

  // Try to load cached location on mount
  useEffect(() => {
    const cached = localStorage.getItem('lokabite_location');
    if (cached && !currentLocation) {
      onLocationUpdate(cached);
    }
  }, [currentLocation, onLocationUpdate]);

  const handleGPSLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await res.json();
            
            // Build a granular, human-readable address
            const addr = data.address || {};
            const parts = [];
            
            // Most specific first: road/neighbourhood
            if (addr.road) parts.push(addr.road);
            else if (addr.neighbourhood) parts.push(addr.neighbourhood);
            
            // Then suburb/village
            if (addr.suburb) parts.push(addr.suburb);
            else if (addr.village) parts.push(addr.village);
            else if (addr.hamlet) parts.push(addr.hamlet);
            
            // Then city/town
            if (addr.city) parts.push(addr.city);
            else if (addr.town) parts.push(addr.town);
            else if (addr.county) parts.push(addr.county);
            
            const locationName = parts.length > 0 ? parts.join(', ') : (data.display_name || 'Your Location');
            
            // Save coordinates for future distance checks
            localStorage.setItem('lokabite_lat', String(latitude));
            localStorage.setItem('lokabite_lng', String(longitude));
            
            onLocationUpdate(locationName);
            localStorage.setItem('lokabite_location', locationName);
            setIsOpen(false);
          } catch (err) {
            console.error('Geocoding failed', err);
            alert(t('Could not fetch location. Please try again.'));
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('GPS error', error);
          alert(t('GPS permission denied or unavailable. Please type manually.'));
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      alert(t('Geolocation is not supported by your browser'));
      setLoading(false);
    }
  };

  const handleManualSave = () => {
    if (manualAddress.trim()) {
      onLocationUpdate(manualAddress.trim());
      localStorage.setItem('lokabite_location', manualAddress.trim());
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">
          {t('Deliver To')}
        </p>
        <h2 className="text-lg font-extrabold flex items-center gap-1">
          📍 <span className="truncate max-w-[200px]">{currentLocation || t('Fetching location...')}</span>
          <span className="text-[10px] font-normal bg-orange-400 bg-opacity-40 px-2 py-0.5 rounded-full ml-1 shrink-0">
            {t('LokaBite')}
          </span>
        </h2>
      </div>

      <dialog id="location-picker" className="modal bg-transparent p-0 w-full max-w-sm rounded-2xl backdrop:bg-slate-900/50 open:animate-in open:fade-in open:zoom-in-95">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full">
          <h3 className="font-bold text-lg text-slate-800 mb-4">{t('Choose Delivery Location')}</h3>
          
          <button
            onClick={handleGPSLocation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 font-bold py-3 px-4 rounded-xl mb-4 border border-orange-200 transition-colors hover:bg-orange-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('Fetching location...')}
              </span>
            ) : (
              <>
                <span>📍</span> {t('Use my current GPS location')}
              </>
            )}
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-xs text-slate-400 font-semibold uppercase">{t('Or type address manually')}</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <textarea
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder={t('House/Flat No., Landmark, Village, City')}
            className="w-full p-3 border border-slate-200 rounded-xl mb-4 text-sm outline-none focus:border-orange-500 bg-slate-50 min-h-[80px]"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-100"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleManualSave}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-orange-500 disabled:opacity-50"
              disabled={!manualAddress.trim()}
            >
              {t('Save')}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
