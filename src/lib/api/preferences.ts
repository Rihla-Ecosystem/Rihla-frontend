import { apiClient } from './client';

export type PreferenceValue = string | number | boolean | object | unknown[] | null;

export const preferencesApi = {
  getAll: async (): Promise<Record<string, unknown>> => {
    const { data } = await apiClient.get<Record<string, unknown>>('/memory/preferences');
    return data || {};
  },

  set: async (key: string, value: PreferenceValue): Promise<void> => {
    await apiClient.post('/memory/preferences', { key, value });
  },
};
