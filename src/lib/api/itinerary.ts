import { apiClient } from "@/lib/api";
import { InsufficientBalanceError } from "./wallet";

export interface ItineraryItem {
  time?: string;
  activity: string;
  type?: string;
  fee_egp?: number | null;
  duration_hours?: number | null;
  safety_tip?: string | null;
  scam_warning?: string | null;
  lat?: number | null;
  lon?: number | null;
}

export interface ItineraryDay {
  day: number;
  city: string;
  theme?: string;
  items: ItineraryItem[];
}

export interface ItineraryPlace {
  name: string;
  lat?: number | null;
  lon?: number | null;
  city?: string;
  day?: number | null;
  type?: string;
  time?: string | null;
}

export interface ItineraryStructured {
  title?: string;
  budget_estimate?: { egp?: number; usd?: number } | null;
  currency_note?: string | null;
  days: ItineraryDay[];
  trip_notes?: string[];
  places?: ItineraryPlace[];
}

export interface ItineraryResult {
  itinerary: string;
  structured?: ItineraryStructured | null;
}

export interface ItineraryRequest {
  interests: string[];
  days: number;
  budget: "budget" | "mid" | "luxury";
  style?: string;
  cities?: string[];
  base_currency?: string;
}

/** Strips the internal `<!-- structured: ... -->` comment from the markdown. */
export function stripStructuredComment(markdown: string): string {
  return (markdown || "").replace(/<!-- structured:[\s\S]*?-->\s*$/, "").trim();
}

export const itineraryApi = {
  generate: async (payload: ItineraryRequest): Promise<ItineraryResult> => {
    try {
      const { data } = await apiClient.post<ItineraryResult>("/itinerary", payload, {
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      return data;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 402
      ) {
        throw new InsufficientBalanceError(
          "Not enough tokens. Top up your wallet to plan your trip."
        );
      }
      throw err;
    }
  },
};