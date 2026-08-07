import { apiClient, API_BASE_URL, formatApiError } from '../api';
import { tokenManager } from '../lib/api';
import type { components } from '../api/generated/types';

type User = components['schemas']['User'];
export type AuditLog = components['schemas']['AuditLog'];

export interface TokenPackage {
  id: number;
  name: string;
  description?: string | null;
  code: string;
  price: string | number;
  currency: string;
  tokens: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  tokenPackageId: number;
  amount: string | number;
  currency: string;
  status: string;
  packageNameSnapshot: string;
  tokensSnapshot: number;
  provider: string;
  paidAt: string | null;
  createdAt: string;
  user?: { id: string; displayName: string | null; email: string } | null;
}

const adminFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  const token = tokenManager.getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Admin request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const adminService = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await apiClient.GET('/admin/users');
    if (error) throw formatApiError(error, 'Failed to load users');
    return data ?? [];
  },

  changeRole: async (userId: string, roleId: number): Promise<void> => {
    const { error } = await apiClient.PATCH('/admin/users/{id}/role', {
      params: { path: { id: userId } },
      body: { role_id: roleId },
    });
    if (error) throw formatApiError(error, 'Failed to change role');
  },

  toggleBan: async (userId: string): Promise<void> => {
    const { error } = await apiClient.PATCH('/admin/users/{id}/ban', {
      params: { path: { id: userId } },
    });
    if (error) throw formatApiError(error, 'Failed to toggle ban');
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const { data, error } = await apiClient.GET('/admin/audit-logs');
    if (error) throw formatApiError(error, 'Failed to load audit logs');
    return data ?? [];
  },

  getTokenPackages: async (): Promise<TokenPackage[]> => {
    try {
      const data = await adminFetch<{ data: { items: TokenPackage[] } }>('/admin/token-packages?limit=100');
      return data?.data?.items ?? [];
    } catch {
      return [];
    }
  },

  createTokenPackage: async (input: {
    name: string;
    code: string;
    price: number;
    currency: string;
    tokens: number;
    sortOrder: number;
    description?: string;
  }): Promise<TokenPackage> => {
    const data = await adminFetch<{ data: TokenPackage }>('/admin/token-packages', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data?.data;
  },

  updateTokenPackageStatus: async (id: number, isActive: boolean): Promise<void> => {
    await adminFetch(`/admin/token-packages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  getPayments: async (page = 1, limit = 20): Promise<{ items: PaymentRecord[]; pagination: any }> => {
    try {
      const data = await adminFetch<{ data: { items: PaymentRecord[]; pagination: any } }>(
        `/admin/payments?page=${page}&limit=${limit}`
      );
      return data?.data ?? { items: [], pagination: { page, limit, total: 0, totalPages: 1 } };
    } catch {
      return { items: [], pagination: { page, limit, total: 0, totalPages: 1 } };
    }
  },
};
