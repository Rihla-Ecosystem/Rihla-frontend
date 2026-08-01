import { apiClient } from "../api";
import { getAuthHeader } from "../providers/AuthProvider";
import { normalizeChatResponse } from "./chatAdapter";
import { components } from "../types";

export const chatService = {
  sendMessage: async (
    message: string,
    lat?: number,
    lon?: number,
    base_currency?: string,
    conversation_id?: string,
    persona?: "auto" | "tour_guide" | "local_expert" | "safety_guru"
  ) => {
    const { data, error } = await (apiClient as any).POST("/chat", {
      body: { message, lat, lon, base_currency, conversation_id, persona },
      headers: {
        ...getAuthHeader(),
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    if (error) throw error;
    return normalizeChatResponse(data);
  },
};
