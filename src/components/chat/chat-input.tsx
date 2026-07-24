"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AI_PROVIDERS } from "@/config/constants";
import type { AIProvider } from "@/types";

interface ChatInputProps {
  onSubmit: (message: string, provider: AIProvider, model: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxChars = 10000;

  const providerConfig = AI_PROVIDERS.find((p) => p.id === selectedProvider);
  const models = providerConfig?.models ?? [];

  const handleProviderChange = useCallback(
    (provider: AIProvider) => {
      setSelectedProvider(provider);
      const config = AI_PROVIDERS.find((p) => p.id === provider);
      if (config && config.models.length > 0) {
        setSelectedModel(config.models[0]);
      }
      setShowProviderMenu(false);
    },
    []
  );

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 6 * 24;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= maxChars) {
        setMessage(e.target.value);
        adjustHeight();
      }
    },
    [adjustHeight]
  );

  const handleSubmit = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed, selectedProvider, selectedModel);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, isLoading, disabled, onSubmit, selectedProvider, selectedModel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.docx,.txt,.csv,.md,.json"
            onChange={(e) => {
              e.target.value = "";
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleFileClick}
            disabled={isLoading || disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={disabled}
            className="min-h-[24px] max-h-[144px] flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={() => setShowProviderMenu(!showProviderMenu)}
                disabled={isLoading || disabled}
              >
                <span className="max-w-[80px] truncate">
                  {providerConfig?.name ?? "Model"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showProviderMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProviderMenu(false)}
                  />
                  <div className="absolute bottom-full right-0 z-50 mb-1 w-64 rounded-lg border bg-popover p-1 shadow-md">
                    {AI_PROVIDERS.map((provider) => (
                      <div key={provider.id}>
                        <button
                          onClick={() => handleProviderChange(provider.id)}
                          className={cn(
                            "flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                            selectedProvider === provider.id &&
                              "bg-accent font-medium"
                          )}
                        >
                          {provider.name}
                        </button>
                        {selectedProvider === provider.id &&
                          provider.models.map((model) => (
                            <button
                              key={model}
                              onClick={() => {
                                setSelectedModel(model);
                                setShowProviderMenu(false);
                              }}
                              className={cn(
                                "ml-3 flex w-[calc(100%-0.75rem)] items-center rounded-md px-2 py-1 text-xs hover:bg-accent",
                                selectedModel === model &&
                                  "bg-accent font-medium"
                              )}
                            >
                              {model}
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="text-[10px] text-muted-foreground tabular-nums">
              {message.length}/{maxChars}
            </div>

            <Button
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading || disabled}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
