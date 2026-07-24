export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "mistral"
  | "deepseek";

export type VectorDBType = "memory" | "pinecone" | "qdrant" | "chroma" | "faiss";

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  models: string[];
  apiKeyEnv: string;
  requiresApiKey: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  sources?: ChatSource[];
  tokenUsage?: TokenUsage;
}

export interface ChatSource {
  documentId: string;
  documentName: string;
  chunkContent: string;
  score: number;
  page?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    documentName: string;
    chunkIndex: number;
    totalChunks: number;
    page?: number;
    createdAt: Date;
  };
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPinned: boolean;
  folderId?: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  createdAt: Date;
  userId: string;
}

export interface UserSettings {
  defaultProvider: AIProvider;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  theme: "light" | "dark" | "system";
}

export interface AdminStats {
  totalUsers: number;
  totalDocuments: number;
  totalChats: number;
  totalMessages: number;
  storageUsed: number;
  apiCallsToday: number;
}

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StreamChunk {
  type: "text" | "sources" | "done" | "error";
  content: string;
  sources?: ChatSource[];
}
