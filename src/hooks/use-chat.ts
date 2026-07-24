"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage, ChatSource, AIProvider, StreamChunk } from "@/types";

interface UseChatOptions {
  conversationId?: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onStreamComplete?: (message: ChatMessage) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamedContent: string;
  streamedSources: ChatSource[];
  sendMessage: (content: string) => Promise<void>;
  error: string | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    conversationId,
    provider = "openai",
    model = "gpt-4o-mini",
    temperature,
    maxTokens,
    onStreamComplete,
  } = options;

  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [streamedSources, setStreamedSources] = useState<ChatSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      return (data.data ?? data) as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setStreamedContent("");
      setStreamedSources([]);

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            content,
            provider,
            model,
            temperature,
            maxTokens,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to send message");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const chunk: StreamChunk = JSON.parse(jsonStr);

                if (chunk.type === "text") {
                  accumulated += chunk.content;
                  setStreamedContent(accumulated);
                } else if (chunk.type === "sources" && chunk.sources) {
                  setStreamedSources(chunk.sources);
                } else if (chunk.type === "error") {
                  throw new Error(chunk.content);
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        const completedMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: accumulated,
          createdAt: new Date(),
          sources: streamedSources.length > 0 ? streamedSources : undefined,
        };

        onStreamComplete?.(completedMessage);

        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "Stream error";
        setError(message);
      } finally {
        setIsStreaming(false);
        setStreamedContent("");
        setStreamedSources([]);
        abortControllerRef.current = null;
      }
    },
    [
      conversationId,
      provider,
      model,
      temperature,
      maxTokens,
      isStreaming,
      streamedSources,
      onStreamComplete,
      queryClient,
    ]
  );

  return {
    messages,
    isLoading: messagesLoading,
    isStreaming,
    streamedContent,
    streamedSources,
    sendMessage,
    error,
  };
}
