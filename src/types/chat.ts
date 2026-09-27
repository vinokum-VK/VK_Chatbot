export type Role = 'user' | 'assistant';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 data (without data:image/... prefix for Gemini API)
  previewUrl: string; // Full data URL for UI display
  sizeBytes: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isStreaming?: boolean;
  error?: string;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  systemPrompt: string;
  icon: string;
  temperature: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  personaId: string;
  messages: Message[];
}

export interface AppSettings {
  temperature: number;
  customSystemPrompt: string;
  autoSpeak: boolean;
  sendOnEnter: boolean;
}
