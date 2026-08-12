import { apiClient } from '@/lib/api';

export type IncidentType = 'SAFETY' | 'SCAM' | 'SERVICE' | 'DAMAGE' | 'ACCESSIBILITY' | 'OTHER';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentReport {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  lat?: number | null;
  lng?: number | null;
  relatedSiteName?: string | null;
  status?: string;
  createdAt: string;
}

export interface CreateIncidentReport {
  type: IncidentType;
  severity?: IncidentSeverity;
  description: string;
  lat?: number;
  lng?: number;
  relatedSiteName?: string;
}

function unwrap<T>(res: any): T {
  const body = res?.data ?? res;
  if (body && body.success === true) return body.data as T;
  return body as T;
}

export const incidentReportService = {
  async create(payload: CreateIncidentReport): Promise<IncidentReport> {
    const res = await apiClient.post('/reports', payload);
    return unwrap<IncidentReport>(res);
  },

  async list(): Promise<IncidentReport[]> {
    const res = await apiClient.get('/reports');
    const body = unwrap<any>(res);
    if (Array.isArray(body)) return body;
    return body?.reports ?? body?.items ?? body?.rows ?? [];
  },

  async get(id: string): Promise<IncidentReport> {
    const res = await apiClient.get(`/reports/${id}`);
    return unwrap<IncidentReport>(res);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  },
};