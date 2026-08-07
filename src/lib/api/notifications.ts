import { apiClient } from './client';
import { tokenManager } from './token-manager';
import { getApiBaseUrl } from './config';

export type NotificationType = 'INFO' | 'WARNING' | 'ALERT' | 'DANGER' | 'EMERGENCY' | 'SUCCESS';
export type NotificationCategory = 'SYSTEM' | 'SAFETY' | 'SECURITY' | 'CULTURE' | 'LOGISTICS' | 'BUDGET' | 'TRANSPORT';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type NotificationSource = 'SYSTEM' | 'AI' | 'ADMIN' | 'CONTEXT_ENGINE';

export interface NotificationInbox {
  id: string;
  userId: string;
  historyId?: string | null;
  templateId?: string | null;
  contextReportId?: string | null;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  source: NotificationSource;
  title: string;
  message: string;
  data?: unknown;
  cooldownKey?: string | null;
  lat?: number | null;
  lng?: number | null;
  isRead: boolean;
  readAt?: string | null;
  deliveredAt: string;
  createdAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationInboxPage {
  notifications: NotificationInbox[];
  pagination: NotificationPagination;
}

export interface ReportLocationPayload {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
  reason?: 'movement' | 'geofence_enter' | 'geofence_exit' | 'initial' | 'manual';
  geofenceEvents?: Array<{
    fenceId?: string;
    name?: string;
    type: 'enter' | 'exit';
    polygon?: Array<{ lat: number; lng: number }>;
  }>;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

function unwrap<T>(data: { success?: boolean; data?: T }): T | undefined {
  return data?.success === true ? data.data : undefined;
}

function apiUrl(): string {
  // baseURL already ends with `/api`; reuse it so SSE hits the same origin as the app.
  return getApiBaseUrl();
}

/** Reports the user's current location to the Context Engine. */
export async function reportLocation(payload: ReportLocationPayload): Promise<NotificationInbox[] | undefined> {
  const res = await apiClient.post<ApiEnvelope<{ notifications?: NotificationInbox[] }>>(
    '/context-notifications/location',
    payload,
  );
  return unwrap(res.data)?.notifications;
}

/** Pulls the current user's notification inbox, newest first. */
export async function fetchInbox(
  params: { page?: number; limit?: number; isRead?: boolean } = {},
): Promise<NotificationInboxPage | undefined> {
  const res = await apiClient.get<ApiEnvelope<NotificationInboxPage>>('/context-notifications/inbox', { params });
  return unwrap(res.data);
}

/** Fetches the unread notification count for the current user. */
export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<ApiEnvelope<{ unread: number }>>('/context-notifications/unread-count');
  return unwrap(res.data)?.unread ?? 0;
}

/** Marks a single inbox notification as read. */
export async function markRead(id: string): Promise<void> {
  await apiClient.patch(`/context-notifications/inbox/${id}/read`);
}

/** Marks all unread inbox notifications as read. */
export async function markAllRead(): Promise<void> {
  await apiClient.patch('/context-notifications/inbox/read-all');
}

/** Deletes a single inbox notification. */
export async function deleteInboxItem(id: string): Promise<void> {
  await apiClient.delete(`/context-notifications/inbox/${id}`);
}

/** Syncs any unread notifications missed while offline. */
export async function syncAfterReconnect(lastSync?: string): Promise<void> {
  await apiClient.post('/context-notifications/sync', { lastSync });
}

/**
 * Opens a Server-Sent Events stream for live notification delivery.
 * Uses fetch (instead of EventSource) so the JWT can be sent as a Bearer header.
 * Returns a close function.
 */
export async function openNotificationStream(
  handlers: {
    onNotification: (n: NotificationInbox) => void;
    onError?: (err: unknown) => void;
  },
): Promise<() => void> {
  const token = tokenManager.getAccessToken();
  const controller = new AbortController();
  const url = `${apiUrl()}/context-notifications/stream`;

  fetch(url, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
    signal: controller.signal,
  })
    .then(async (resp) => {
      if (!resp.ok || !resp.body) throw new Error(`Stream HTTP ${resp.status}`);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const raw = trimmed.replace(/^data:\s*/, '');
          try {
            const payload = JSON.parse(raw);
            if (payload?.success && Array.isArray(payload.data)) {
              payload.data.forEach((n: NotificationInbox) => handlers.onNotification(n));
            } else if (payload?.type === 'notification' && payload.notification) {
              handlers.onNotification(payload.notification as NotificationInbox);
            }
          } catch (err) {
            handlers.onError?.(err);
          }
        }
      }
    })
    .catch((err: unknown) => {
      if (!controller.signal.aborted) handlers.onError?.(err);
    });

  return () => controller.abort();
}