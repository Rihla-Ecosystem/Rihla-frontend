'use client';

import React from 'react';
import { useAuth } from './auth-context';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  unauthenticatedFallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps view components to enforce authentication restrictions,
 * handling initialization loading states and unauthenticated access fallbacks.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = (
    <div className="flex items-center justify-center min-h-[200px] text-gray-500 font-medium">
      Authenticating...
    </div>
  ),
  unauthenticatedFallback = (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Access Denied</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        You must be signed in to view this content.
      </p>
    </div>
  ),
}) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{unauthenticatedFallback}</>;
  }

  return <>{children}</>;
};
