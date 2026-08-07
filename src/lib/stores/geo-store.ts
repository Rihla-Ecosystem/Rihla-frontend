"use client";

import { create } from "zustand";

export type GeoCategory =
  | "archaeological"
  | "islamic"
  | "christian"
  | "infrastructure";

export interface GeoPoi {
  id: string;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  categories?: string[];
  governorate?: string | null;
  distance_meters?: number;
  lat: number;
  lon: number;
}

export interface Governorate {
  name: string;
  geometry: GeoJsonGeometry | null;
}

export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export interface Site {
  id: string;
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  category: string;
  governorate: string;
  description: string;
  images: string[];
  rating: number;
  visitDuration: number;
  bestTime: string;
  tips: string[];
}

interface GeoState {
  mapCenter: [number, number];
  zoom: number;
  selectedCategory: string;
  selectedGovernorate: string;
  sites: Site[];
  isLoading: boolean;

  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setCategory: (category: string) => void;
  setGovernorate: (governorate: string) => void;
  setSites: (sites: Site[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useGeoStore = create<GeoState>((set) => ({
  mapCenter: [26.8206, 30.8025],
  zoom: 7,
  selectedCategory: "",
  selectedGovernorate: "",
  sites: [],
  isLoading: false,

  setCenter: (mapCenter) => set({ mapCenter }),
  setZoom: (zoom) => set({ zoom }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setGovernorate: (selectedGovernorate) => set({ selectedGovernorate }),
  setSites: (sites) => set({ sites }),
  setLoading: (isLoading) => set({ isLoading }),
}));