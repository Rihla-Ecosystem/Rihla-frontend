import { apiClient } from '../lib/api/client';
import { API_CONFIG } from '../lib/api/config';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  authorId?: string | null;
  authorName?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResult {
  notifications: AppNotification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const unwrap = <T>(res: { data: ApiEnvelope<T> }): T => res.data?.data;

export const notificationService = {
  getNotifications: async (page = 1, limit = 20, isRead?: boolean): Promise<NotificationListResult> => {
    const params: Record<string, string | number> = { page, limit };
    if (isRead !== undefined) params.isRead = String(isRead);
    const res = await apiClient.get<ApiEnvelope<NotificationListResult>>('/notifications', { params });
    return unwrap(res);
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiEnvelope<{ unread: number }>>('/notifications/unread-count');
    return unwrap(res)?.unread ?? 0;
  },

  markRead: async (id: string): Promise<AppNotification> => {
    const res = await apiClient.patch<ApiEnvelope<AppNotification>>(`/notifications/${id}/read`);
    return unwrap(res);
  },

  markAllRead: async (): Promise<{ count: number }> => {
    const res = await apiClient.patch<ApiEnvelope<{ count: number }>>('/notifications/read-all');
    return unwrap(res);
  },

  deleteNotification: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    const res = await apiClient.delete<ApiEnvelope<{ id: string; deleted: boolean }>>(`/notifications/${id}`);
    return unwrap(res);
  },
};

export const NOTIF_TYPE_META: Record<
  NotificationType,
  { label: string; color: string; glyph: string }
> = {
  INFO: { label: 'Info', color: '#2E9C93', glyph: '◈' },
  SUCCESS: { label: 'Success', color: '#2E7A54', glyph: '✦' },
  WARNING: { label: 'Warning', color: '#D98E2C', glyph: '▲' },
  ERROR: { label: 'Error', color: '#B23A2E', glyph: '✕' },
  SYSTEM: { label: 'System', color: '#8A5A34', glyph: '☀' },
};

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return 'recently';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const API_TIMEOUT_MS = API_CONFIG.timeout;
