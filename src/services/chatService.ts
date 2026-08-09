import { apiClient } from "../api";
import { tokenManager } from "../lib/api";
import { normalizeChatResponse } from "./chatAdapter";
import { components } from "../types";
import { InsufficientBalanceError } from "@/lib/api/wallet";
import type { RafiqContext } from "@/lib/rafiq";

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
  usage?: { model?: string | null; inputTokens?: number; outputTokens?: number; totalTokens?: number } | null;
}

export interface VoiceResult {
  text_response: string;
  audio_url?: string | null;
  audio_response?: string | null;
  conversation_id?: string | null;
  usage?: { model?: string | null; inputTokens?: number; outputTokens?: number; totalTokens?: number } | null;
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  createdAt?: string;
  messageCount?: number;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

async function parseErrorBody(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(text);
    return parsed.error || parsed.message || text;
  } catch {
    return text || `Request failed: ${res.status}`;
  }
}

function normalizeUsage(value: unknown): StreamResult['usage'] {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const number = (camel: string, snake: string) => {
    const candidate = raw[camel] ?? raw[snake];
    return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : undefined;
  };
  return {
    model: typeof raw.model === 'string' ? raw.model : null,
    inputTokens: number('inputTokens', 'input_tokens'),
    outputTokens: number('outputTokens', 'output_tokens'),
    totalTokens: number('totalTokens', 'total_tokens'),
  };
}

function throwForBalance(res: Response, message: string): never {
  if (res.status === 402) {
    throw new InsufficientBalanceError(message);
  }
  throw new Error(message);
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

interface ChatContext {
  lat?: number;
  lon?: number;
  conversationId?: string;
  context?: RafiqContext;
  title?: string;
}

export const chatService = {
  sendMessage: async (
    message: string,
    lat?: number,
    lon?: number,
    base_currency?: string,
    conversation_id?: string,
    persona: Persona = "auto",
    context?: RafiqContext
  ) => {
    const { data, error } = await (apiClient as any).POST("/chat", {
      body: { message, lat, lon, base_currency, conversation_id, persona, context },
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
    opts?: ChatContext
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
        conversation_id: opts?.conversationId || undefined,
        lat: opts?.lat,
        lon: opts?.lon,
        context: opts?.context,
        title: opts?.title,
      }),
    });

    if (!response.ok) {
      const detail = await parseErrorBody(response);
      throwForBalance(response, detail || `Chat stream failed: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("Chat stream failed: empty response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = "";
    let buffer = "";
    let conversationId = opts?.conversationId || "";
    let usage: StreamResult["usage"] = null;

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
      if (payload.usage && typeof payload.usage === "object") {
        usage = normalizeUsage(payload.usage);
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

    return { text: fullReply, conversationId, usage };
  },

  voice: async (
    audio: Blob,
    mimeType: string,
    context?: {
      lat?: number;
      lon?: number;
      conversationId?: string;
      persona?: Persona;
      title?: string;
      transcript?: string;
      rafiqContext?: RafiqContext;
    }
  ): Promise<VoiceResult> => {
    const formData = new FormData();
    const ext = mimeType.split("/")[1] || "webm";
    formData.append("audio", audio, `audio.${ext}`);
    if (context?.lat !== undefined) formData.append("lat", String(context.lat));
    if (context?.lon !== undefined) formData.append("lon", String(context.lon));
    if (context?.conversationId) formData.append("conversation_id", context.conversationId);
    if (context?.persona) formData.append("persona", context.persona);
    if (context?.title) formData.append("title", context.title);
    if (context?.transcript) formData.append("transcript", context.transcript);
    if (context?.rafiqContext) formData.append("context", JSON.stringify(context.rafiqContext));

    const requestHeaders = new Headers(authHeaders());
    requestHeaders.delete("Content-Type");
    const response = await fetch(`${CORE_API_URL}/voice`, {
      method: "POST",
      headers: requestHeaders,
      body: formData,
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const detail = await parseErrorBody(response);
      throwForBalance(response, detail || `Voice request failed: ${response.status}`);
    }

    const result = (await response.json()) as VoiceResult & { usage?: unknown };
    result.usage = normalizeUsage(result.usage);
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

  getConversations: async (): Promise<ConversationSummary[]> => {
    const response = await fetch(`${CORE_API_URL}/chat/conversations`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(await parseErrorBody(response) || "Failed to load conversations");
    }
    const data = (await response.json()) as {
      conversations?: Array<{
        id: string;
        title: string;
        updatedAt?: string;
        createdAt?: string;
        _count?: { messages?: number };
      }>;
    };
    return (data.conversations ?? []).map((c) => ({
      id: c.id,
      title: c.title || "Conversation",
      updatedAt: c.updatedAt || c.createdAt || "",
      createdAt: c.createdAt,
      messageCount: c._count?.messages ?? 0,
    }));
  },

  getMessages: async (conversationId: string): Promise<ConversationMessage[]> => {
    const response = await fetch(
      `${CORE_API_URL}/chat/conversations/${conversationId}/messages`,
      { headers: authHeaders(), signal: AbortSignal.timeout(15000) }
    );
    if (!response.ok) {
      throw new Error(await parseErrorBody(response) || "Failed to load messages");
    }
    const data = (await response.json()) as {
      messages?: Array<{ id: string; role: string; content: string; createdAt?: string }>;
    };
    return (data.messages ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt || "",
      }));
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    const response = await fetch(`${CORE_API_URL}/chat/conversations/${conversationId}`, {
      method: "DELETE",
      headers: authHeaders(),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(await parseErrorBody(response) || "Failed to delete conversation");
    }
  },

};
