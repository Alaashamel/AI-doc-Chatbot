import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(10000, "Message too long"),
  conversationId: z.string().uuid().optional(),
  documentIds: z.array(z.string().uuid()).optional(),
  provider: z.enum(["openai", "anthropic", "google", "groq", "mistral", "deepseek"]).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(128000).optional(),
});

export const documentUploadSchema = z.object({
  name: z.string().min(1).max(255),
  collectionId: z.string().uuid().optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  isPinned: z.boolean().optional(),
  folderId: z.string().uuid().nullable().optional(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
});

export const userSettingsSchema = z.object({
  defaultProvider: z.enum(["openai", "anthropic", "google", "groq", "mistral", "deepseek"]).optional(),
  defaultModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(128000).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;
export type CreateFolder = z.infer<typeof createFolderSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
