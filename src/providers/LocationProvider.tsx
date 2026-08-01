"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'loading'
  | 'success'
  | 'permission_denied'
  | 'location_unavailable';

export interface LocationState {
  lat: number | null;
  lon: number | null;
  accuracy: number | null;
  status: LocationStatus;
  errorMessage: string | null;
  locationName: string | null;
  governorate: string;
  requestLocation: () => void;
  setLocationOverride: (lat: number, lon: number, name: string, governorate: string) => void;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

// Default fallback location for Egypt (Giza Governorate) when browser GPS is unavailable/pending
const DEFAULT_LAT = 29.9792;
const DEFAULT_LON = 31.1342;
const DEFAULT_GOVERNORATE = 'Giza';
const DEFAULT_LOCATION_NAME = 'Giza Governorate, Egypt';

function extractGovernorateFromAddress(address: any, latitude: number, longitude: number): string {
  const rawState = address.state || address.governorate || address.county || address.city || address.town || '';
  const lower = (rawState + ' ' + (address.city || '') + ' ' + (address.suburb || '')).toLowerCase();

  if (lower.includes('cairo') || lower.includes('القاهرة')) return 'Cairo';
  if (lower.includes('giza') || lower.includes('الجيزة')) return 'Giza';
  if (lower.includes('luxor') || lower.includes('الأقصر')) return 'Luxor';
  if (lower.includes('aswan') || lower.includes('أسوان')) return 'Aswan';
  if (lower.includes('alexandria') || lower.includes('الإسكندرية')) return 'Alexandria';
  if (lower.includes('red sea') || lower.includes('hurghada') || lower.includes('البحر الأحمر')) return 'Red Sea';
  if (lower.includes('sinai') || lower.includes('sharm') || lower.includes('سيناء')) return 'South Sinai';
  if (lower.includes('faiyum') || lower.includes('fayoum') || lower.includes('الفيوم')) return 'Faiyum';
  if (lower.includes('qena') || lower.includes('قنا')) return 'Qena';
  if (lower.includes('matrouh') || lower.includes('مطروح')) return 'Matrouh';

  // Coordinate check fallback for Giza / Pyramids region
  if (latitude >= 29.7 && latitude <= 30.3 && longitude >= 30.9 && longitude <= 31.5) {
    return 'Giza';
  }

  // Clean rawState if available, e.g. "Giza Governorate" -> "Giza"
  if (rawState) {
    const cleaned = rawState.replace(/Governorate|محافظة/gi, '').trim();
    if (cleaned) return cleaned;
  }

  return DEFAULT_GOVERNORATE;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(DEFAULT_LAT);
  const [lon, setLon] = useState<number | null>(DEFAULT_LON);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(DEFAULT_LOCATION_NAME);
  const [governorate, setGovernorate] = useState<string>(DEFAULT_GOVERNORATE);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const gov = extractGovernorateFromAddress(address, latitude, longitude);
        setGovernorate(gov);

        const area = address.suburb || address.neighbourhood || address.quarter || address.residential;
        const city = address.city || address.town || address.village || address.county || address.state;
        const country = address.country || 'Egypt';

        let nameParts: string[] = [];
        if (area) nameParts.push(area);
        if (city && city !== area) nameParts.push(city);
        if (nameParts.length === 0 && country) nameParts.push(country);

        if (nameParts.length > 0) {
          setLocationName(nameParts.join(', '));
          return;
        }
      }
    } catch (e) {
      console.warn("Reverse geocode lookup failed:", e);
    }
    const fallbackGov = extractGovernorateFromAddress({}, latitude, longitude);
    setGovernorate(fallbackGov);
    setLocationName(`${fallbackGov} Governorate (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`);
  };

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('location_unavailable');
      setErrorMessage('Geolocation is not supported by your browser. Displaying default governorate (Giza).');
      return;
    }

    setStatus('requesting');
    setErrorMessage(null);

    const timeoutId = setTimeout(() => {
      setStatus((current) => (current === 'requesting' ? 'loading' : current));
    }, 500);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude, accuracy: acc } = position.coords;
        setLat(latitude);
        setLon(longitude);
        setAccuracy(acc);
        setStatus('success');
        setErrorMessage(null);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        clearTimeout(timeoutId);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('permission_denied');
          setErrorMessage('Location permission was denied. Displaying default location (Giza Governorate).');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('location_unavailable');
          setErrorMessage('Location information unavailable. Displaying default location (Giza Governorate).');
        } else if (error.code === error.TIMEOUT) {
          setStatus('location_unavailable');
          setErrorMessage('Location request timed out. Displaying default location (Giza Governorate).');
        } else {
          setStatus('location_unavailable');
          setErrorMessage(error.message || 'An unknown error occurred while retrieving location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const setLocationOverride = useCallback((newLat: number, newLon: number, name: string, gov: string) => {
    setLat(newLat);
    setLon(newLon);
    setLocationName(name);
    setGovernorate(gov);
    setStatus('success');
    setErrorMessage(null);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        lat,
        lon,
        accuracy,
        status,
        errorMessage,
        locationName,
        governorate,
        requestLocation,
        setLocationOverride,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
