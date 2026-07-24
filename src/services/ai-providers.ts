import OpenAI from "openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai";
import type { AIProvider } from "@/types";
import { AI_PROVIDERS, DEFAULT_PROVIDER, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "@/config/constants";

interface ChatMessage {
  role: string;
  content: string;
}

interface StreamChatParams {
  messages: ChatMessage[];
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ProviderStatus {
  id: AIProvider;
  name: string;
  available: boolean;
}

async function streamOpenAI(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model,
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

async function streamDeepSeek(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });
  const response = await client.chat.completions.create({
    model,
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

async function streamAnthropic(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const chat = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: model,
    temperature,
    maxTokens,
  });

  const langchainMessages = messages.map((m) => {
    if (m.role === "system") {
      return { role: "system" as const, content: m.content };
    }
    return { role: m.role as "human" | "ai", content: m.content };
  });

  const stream = await chat.stream(langchainMessages);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

async function streamGoogle(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const chat = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    modelName: model,
    temperature,
    maxOutputTokens: maxTokens,
  });

  const langchainMessages = messages.map((m) => {
    if (m.role === "system") {
      return { role: "system" as const, content: m.content };
    }
    return { role: m.role === "assistant" ? ("ai" as const) : ("human" as const), content: m.content };
  });

  const stream = await chat.stream(langchainMessages);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

async function streamGroq(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const chat = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: model,
    temperature,
    maxTokens,
  });

  const langchainMessages = messages.map((m) => {
    if (m.role === "system") {
      return { role: "system" as const, content: m.content };
    }
    return { role: m.role === "assistant" ? ("ai" as const) : ("human" as const), content: m.content };
  });

  const stream = await chat.stream(langchainMessages);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

async function streamMistral(
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream> {
  const chat = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    modelName: model,
    temperature,
    maxTokens,
  });

  const langchainMessages = messages.map((m) => {
    if (m.role === "system") {
      return { role: "system" as const, content: m.content };
    }
    return { role: m.role === "assistant" ? ("ai" as const) : ("human" as const), content: m.content };
  });

  const stream = await chat.stream(langchainMessages);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

const STREAM_HANDLERS: Record<AIProvider, (
  messages: ChatMessage[],
  model: string,
  temperature: number,
  maxTokens: number
) => Promise<ReadableStream>> = {
  openai: streamOpenAI,
  deepseek: streamDeepSeek,
  anthropic: streamAnthropic,
  google: streamGoogle,
  groq: streamGroq,
  mistral: streamMistral,
};

export async function streamChatCompletion(params: StreamChatParams): Promise<ReadableStream> {
  const {
    messages,
    provider = DEFAULT_PROVIDER,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
  } = params;

  const handler = STREAM_HANDLERS[provider];
  if (!handler) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  return handler(messages, model, temperature, maxTokens);
}

const ENV_VAR_MAP: Record<AIProvider, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
};

export function getAvailableProviders(): ProviderStatus[] {
  return AI_PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    available: !!process.env[ENV_VAR_MAP[p.id]],
  }));
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
