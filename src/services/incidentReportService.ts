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

export const incidentReportService = {
  async create(payload: CreateIncidentReport): Promise<IncidentReport> {
    const { data, error } = await (apiClient as any).POST('/reports', { body: payload });
    if (error) throw error;
    return data?.data ?? data;
  },

  async list(): Promise<IncidentReport[]> {
    const { data, error } = await (apiClient as any).GET('/reports');
    if (error) throw error;
    const payload = data?.data ?? data;
    return Array.isArray(payload) ? payload : payload?.reports ?? payload?.items ?? [];
  },

  async get(id: string): Promise<IncidentReport> {
    const { data, error } = await (apiClient as any).GET('/reports/{id}', {
      params: { path: { id } },
    });
    if (error) throw error;
    return data?.data ?? data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await (apiClient as any).DELETE('/reports/{id}', {
      params: { path: { id } },
    });
    if (error) throw error;
  },
};
