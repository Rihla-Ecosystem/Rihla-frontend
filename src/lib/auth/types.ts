/**
 * Authentication Module Types & Interfaces
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  gender?: 'MALE' | 'FEMALE' | string;
  nationality?: string;
  language?: string[];
  budgetLevel?: string;
  arrivalDate?: string;
  departureDate?: string;
  travelStyle?: string;
  interests?: string[];
  accommodationType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  gender: 'MALE' | 'FEMALE';
  nationality: string;
  language: string[];
  budget_level?: string;
  arrival_date?: string;
  departure_date?: string;
  travel_style?: string;
  interests?: string[];
  accommodation_type?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
