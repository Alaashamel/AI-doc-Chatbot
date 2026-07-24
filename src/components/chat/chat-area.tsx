"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Zap, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import type { ChatMessage, StreamChunk, AIProvider } from "@/types";

const SUGGESTIONS = [
  "Summarize the key points from the uploaded documents",
  "What are the main risks identified in the report?",
  "Compare the data across all available sources",
  "Generate an action plan based on the analysis",
];

const FEATURES = [
  { icon: FileText, title: "Document Analysis", desc: "Upload and query your documents" },
  { icon: Zap, title: "Multi-Provider AI", desc: "Choose from leading AI models" },
  { icon: Globe, title: "RAG-Powered", desc: "Context-aware responses with sources" },
];

interface ChatAreaProps {
  conversationId?: string;
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessages, setStreamedMessages] = useState<
    Record<string, string>
  >({});
  const [streamedSources, setStreamedSources] = useState<
    Record<string, NonNullable<ChatMessage["sources"]>>
  >({});

  const activeId = conversationId ?? pathname.split("/chat/")[1];

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: async () => {
      if (!activeId) return [];
      const res = await fetch(`/api/conversations/${activeId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      return (data.data ?? data) as ChatMessage[];
    },
    enabled: !!activeId,
  });

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedMessages, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages?.length, scrollToBottom]);

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: {
      conversationId: string;
      content: string;
      provider: AIProvider;
      model: string;
    }) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res;
    },
  });

  const handleSubmit = useCallback(
    async (content: string, provider: AIProvider, model: string) => {
      if (!activeId) return;

      const tempId = `temp-${Date.now()}`;
      setStreamedMessages((prev) => ({ ...prev, [tempId]: "" }));
      setIsStreaming(true);

      scrollToBottom();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeId,
            content,
            provider,
            model,
          }),
        });

        if (!res.ok) throw new Error("Failed to send message");

        const reader = res.body?.getReader();
        if (!reader) return;

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
                  setStreamedMessages((prev) => ({
                    ...prev,
                    [tempId]: accumulated,
                  }));
                } else if (chunk.type === "sources" && chunk.sources) {
                  setStreamedSources((prev) => ({
                    ...prev,
                    [tempId]: chunk.sources!,
                  }));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } catch (error) {
        console.error("Stream error:", error);
      } finally {
        setIsStreaming(false);
        setStreamedMessages((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
        setStreamedSources((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
    },
    [activeId, queryClient, scrollToBottom]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSubmit(suggestion, "openai", "gpt-4o-mini");
    },
    [handleSubmit]
  );

  const displayMessages = (messages ?? []).map((msg) => ({
    ...msg,
  }));

  const streamingEntries = Object.entries(streamedMessages);
  const isShowingStream =
    streamingEntries.length > 0 && displayMessages.length > 0;

  return (
    <div className="flex h-full flex-col">
      {!activeId || (displayMessages.length === 0 && !isLoading) ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">AI Knowledge Platform</h2>
            <p className="mt-2 text-muted-foreground">
              Ask questions about your documents. Powered by RAG with
              multi-provider LLM support.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border bg-card p-3 text-left"
                >
                  <feature.icon className="mb-1.5 h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="rounded-lg border bg-card p-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="mx-auto max-w-3xl py-4">
            <AnimatePresence mode="popLayout">
              {displayMessages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isLast={idx === displayMessages.length - 1 && !isStreaming}
                />
              ))}
              {isShowingStream && streamingEntries.map(([id, content]) => (
                <MessageBubble
                  key={id}
                  message={{
                    id,
                    role: "assistant",
                    content,
                    createdAt: new Date(),
                    sources: streamedSources[id],
                  }}
                  isLast
                />
              ))}
            </AnimatePresence>

            {isLoading && displayMessages.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground/40" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isStreaming}
        disabled={!activeId}
      />
    </div>
  );
}
