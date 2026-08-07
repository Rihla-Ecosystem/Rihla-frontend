import { apiClient } from "../api";
import { tokenManager } from "../lib/api";
import { normalizeChatResponse } from "./chatAdapter";
import { components } from "../types";

const CORE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export type Persona = "auto" | "tour_guide" | "local_expert" | "safety_guru";

export const PERSONAS: Array<{ value: Persona; label: string; blurb: string }> = [
  {
    value: "auto",
    label: "Auto",
    blurb: "Picks the best guide for your question.",
  },
  {
    value: "tour_guide",
    label: "Tour Guide",
    blurb: "Sights, itineraries and history.",
  },
  {
    value: "local_expert",
    label: "Local Expert",
    blurb: "Food, culture and hidden gems.",
  },
  {
    value: "safety_guru",
    label: "Safety Guru",
    blurb: "Live safety & route advice.",
  },
];

export interface StreamResult {
  text: string;
  conversationId: string;
}

export interface StreamResult {
  text: string;
  conversationId: string;
}

export interface VoiceResult {
  text_response: string;
  audio_url?: string | null;
  audio_response?: string | null;
  conversation_id?: string | null;
}

const authHeaders = (): Record<string, string> => {
  const token = tokenManager.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface IdentifyResult {
  name: string;
  name_ar?: string | null;
  description: string;
  category?: string | null;
  historical_period?: string | null;
  wikipedia_url?: string | null;
  image_url?: string | null;
}

export const chatService = {
  sendMessage: async (
    message: string,
    lat?: number,
    lon?: number,
    base_currency?: string,
    conversation_id?: string,
    persona: Persona = "auto"
  ) => {
    const { data, error } = await (apiClient as any).POST("/chat", {
      body: { message, lat, lon, base_currency, conversation_id, persona },
      headers: {
        ...authHeaders(),
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    if (error) throw error;
    return normalizeChatResponse(data);
  },

  streamMessage: async (
    message: string,
    persona: Persona = "auto",
    onToken?: (token: string) => void,
    context?: { lat?: number; lon?: number; conversationId?: string }
  ): Promise<StreamResult> => {
    const response = await fetch(`${CORE_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
        ...authHeaders(),
      },
      body: JSON.stringify({
        message,
        persona,
        conversation_id: context?.conversationId || undefined,
        lat: context?.lat,
        lon: context?.lon,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Chat stream failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = "";
    let buffer = "";
    let conversationId = context?.conversationId || "";

    const handleEvent = (payload: Record<string, unknown>) => {
      if (payload.error) {
        throw new Error(String(payload.reason || payload.error));
      }
      if (typeof payload.token === "string") {
        fullReply += payload.token;
        onToken?.(payload.token);
      }
      if (payload.done && typeof payload.full_response === "string") {
        fullReply = payload.full_response;
      }
      if (typeof payload.conversation_id === "string") {
        conversationId = payload.conversation_id;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            handleEvent(JSON.parse(raw));
          } catch (e) {
            if (e instanceof Error && !(e instanceof SyntaxError)) throw e;
          }
        }
      }
    }

    return { text: fullReply, conversationId };
  },

  voice: async (
    audio: Blob,
    mimeType: string,
    context?: { lat?: number; lon?: number; conversationId?: string }
  ): Promise<VoiceResult> => {
    const formData = new FormData();
    const ext = mimeType.split("/")[1] || "webm";
    formData.append("audio", audio, `audio.${ext}`);
    if (context?.lat !== undefined) formData.append("lat", String(context.lat));
    if (context?.lon !== undefined) formData.append("lon", String(context.lon));
    if (context?.conversationId) formData.append("conversation_id", context.conversationId);

    const requestHeaders = new Headers(authHeaders());
    requestHeaders.delete("Content-Type");
    const response = await fetch(`${CORE_API_URL}/voice`, {
      method: "POST",
      headers: requestHeaders,
      body: formData,
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Voice request failed: ${response.status}`);
    }

    const result = (await response.json()) as VoiceResult;
    if (
      result.audio_url &&
      !result.audio_url.startsWith("http") &&
      !result.audio_url.startsWith("data:")
    ) {
      result.audio_url = `${CORE_API_URL}${result.audio_url}`;
    }
    return result;
  },

  identify: async (
    file: File,
    context?: { lat?: number; lon?: number; radius?: number }
  ): Promise<IdentifyResult> => {
    const formData = new FormData();
    formData.append("image", file);
    if (context?.lat !== undefined) formData.append("lat", String(context.lat));
    if (context?.lon !== undefined) formData.append("lon", String(context.lon));
    if (context?.radius !== undefined) formData.append("radius", String(context.radius));

    const requestHeaders = new Headers({
      ...authHeaders(),
      "Idempotency-Key": crypto.randomUUID(),
    });
    requestHeaders.delete("Content-Type");
    const response = await fetch(`${CORE_API_URL}/identify`, {
      method: "POST",
      headers: requestHeaders,
      body: formData,
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Identify request failed: ${response.status}`);
    }

    return (await response.json()) as IdentifyResult;
  },
};