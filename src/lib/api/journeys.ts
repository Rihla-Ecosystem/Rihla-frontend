import { apiClient } from './client';

export interface JourneyStep {
  id: string;
  stepNumber: number;
  title: string;
  content: string;
  xpReward: number;
}

export interface Journey {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  xpReward: number;
  isActive: boolean;
  steps: JourneyStep[];
  completedSteps: number;
  totalSteps: number;
  isCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
  nextStep: number | null;
}

export interface CompleteStepResult {
  journey: string;
  step: number;
  completed: number;
  total: number;
  journeyCompleted: boolean;
  xpAwarded: number;
  badgesAwarded: string[];
}

export const journeysApi = {
  list: async (): Promise<Journey[]> => {
    const { data } = await apiClient.get<Journey[]>("/journeys");
    return data || [];
  },

  get: async (slug: string): Promise<Journey> => {
    const { data } = await apiClient.get<Journey>(`/journeys/${encodeURIComponent(slug)}`);
    return data;
  },

  start: async (slug: string): Promise<Journey> => {
    const { data } = await apiClient.post<Journey>(`/journeys/${encodeURIComponent(slug)}/start`);
    return data;
  },

  completeStep: async (
    slug: string,
    stepNumber: number
  ): Promise<CompleteStepResult> => {
    const { data } = await apiClient.post<CompleteStepResult>(
      `/journeys/${encodeURIComponent(slug)}/steps/complete`,
      { step_number: stepNumber }
    );
    return data;
  },
};
