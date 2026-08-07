export interface NormalizedChatResponse {
  text: string;
  attachments?: any[];
  meta?: Record<string, any>;
}

export const normalizeChatResponse = (response: any): NormalizedChatResponse => {
  // Extracting data based on runtime inspection of actual server responses
  const text = response?.text || response?.message || (typeof response === "string" ? response : JSON.stringify(response));
  
  return {
    text,
    attachments: response?.attachments || [],
    meta: response?.meta || {},
  };
};
