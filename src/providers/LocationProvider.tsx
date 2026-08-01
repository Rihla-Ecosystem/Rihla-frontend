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
  requestLocation: () => void;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

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
        const area = address.suburb || address.neighbourhood || address.quarter || address.residential;
        const city = address.city || address.town || address.village || address.county || address.state;
        const country = address.country;

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
    setLocationName(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
  };

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('location_unavailable');
      setErrorMessage('Geolocation is not supported by your browser.');
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
          setErrorMessage('Location permission was denied. Please enable location access in your browser settings to see nearby sites and local weather.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('location_unavailable');
          setErrorMessage('Location information is currently unavailable.');
        } else if (error.code === error.TIMEOUT) {
          setStatus('location_unavailable');
          setErrorMessage('Location request timed out. Please try again.');
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

  return (
    <LocationContext.Provider
      value={{
        lat,
        lon,
        accuracy,
        status,
        errorMessage,
        locationName,
        requestLocation,
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
