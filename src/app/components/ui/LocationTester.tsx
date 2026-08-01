"use client";

import React, { useState } from 'react';
import { useLocation } from '@/providers/LocationProvider';
import { C } from '@/lib/constants/theme';
import { MapPin, Settings2 } from 'lucide-react';

const TEST_LOCATIONS = [
  { name: 'Luxor Temple', gov: 'Luxor', lat: 25.6995, lon: 32.6396 },
  { name: 'Giza Pyramids', gov: 'Giza', lat: 29.9792, lon: 31.1342 },
  { name: 'Aswan High Dam', gov: 'Aswan', lat: 23.9716, lon: 32.8804 },
  { name: 'Fayoum (Wadi Rayan)', gov: 'Fayoum', lat: 29.1306, lon: 30.3853 },
  { name: 'Alexandria Library', gov: 'Alexandria', lat: 31.2089, lon: 29.9092 },
  { name: 'St. Catherine, Sinai', gov: 'South Sinai', lat: 28.5562, lon: 33.9757 },
  { name: 'Current Location', gov: '', lat: 0, lon: 0, reset: true }
];

export function LocationTester() {
  const { setLocationOverride, requestLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (loc: typeof TEST_LOCATIONS[0]) => {
    if (loc.reset) {
      requestLocation();
    } else {
      setLocationOverride(loc.lat, loc.lon, loc.name, loc.gov);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen && (
        <div className="mb-4 bg-white/95 backdrop-blur-md border border-[#E5E0D8] rounded-2xl p-4 shadow-xl shadow-black/5 flex flex-col gap-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E5E0D8]">
            <MapPin size={16} color={C.limestone} />
            <span className="font-semibold text-sm text-[#2C3E50]">Test Locations</span>
          </div>
          {TEST_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleSelect(loc)}
              className="text-left text-sm py-2 px-3 hover:bg-[#F8F9FA] rounded-lg transition-colors text-[#2C3E50]"
            >
              {loc.name}
              {loc.gov && <span className="block text-xs text-[#7F8C8D] mt-0.5">{loc.gov}</span>}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border border-[#E5E0D8] hover:scale-105 transition-transform"
        title="Test Location Override"
      >
        <Settings2 size={24} color={C.limestone} />
      </button>
    </div>
  );
}
