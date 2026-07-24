import type { AIProviderConfig } from "@/types";

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    apiKeyEnv: "OPENAI_API_KEY",
    requiresApiKey: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
    apiKeyEnv: "ANTHROPIC_API_KEY",
    requiresApiKey: true,
  },
  {
    id: "google",
    name: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"],
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
    requiresApiKey: true,
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    apiKeyEnv: "GROQ_API_KEY",
    requiresApiKey: true,
  },
  {
    id: "mistral",
    name: "Mistral",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
    apiKeyEnv: "MISTRAL_API_KEY",
    requiresApiKey: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    apiKeyEnv: "DEEPSEEK_API_KEY",
    requiresApiKey: true,
  },
];

export const DEFAULT_PROVIDER = "openai";
export const DEFAULT_MODEL = "gpt-4o-mini";
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4096;

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;
export const RETRIEVAL_K = 5;

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = [
  ".pdf",
  ".txt",
  ".docx",
  ".csv",
  ".md",
  ".json",
  ".pptx",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
];

export const RATE_LIMIT_REQUESTS = 100;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const APP_NAME = "AI Knowledge Platform";
export const APP_DESCRIPTION =
  "Enterprise AI-powered document chat platform with RAG and multi-provider LLM support.";
