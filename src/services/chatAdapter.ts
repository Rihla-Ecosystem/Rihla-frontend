export interface NormalizedChatResponse {
  text: string;
  attachments?: any[];
  meta?: Record<string, any>;
}

export const normalizeChatResponse = (response: any): NormalizedChatResponse => {
  // Core returns { response, conversation_id, persona, ... } for POST /chat.
  // Keep .text / .message fallbacks for other/legacy shapes.
  const text =
    response?.response ||
    response?.text ||
    response?.message ||
    (typeof response === "string" ? response : JSON.stringify(response));

  return {
    text,
    attachments: response?.attachments || [],
    meta: {
      ...(response?.meta || {}),
      ...(response?.conversation_id ? { conversationId: response.conversation_id } : {}),
    },
  };
};
