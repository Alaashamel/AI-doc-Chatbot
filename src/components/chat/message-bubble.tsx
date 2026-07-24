"use client";

import { useState, type Components } from "react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { Copy, Check, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-1 py-2">
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
    </div>
  );
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-2 rounded-lg border bg-background overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={resolvedTheme === "dark" ? oneDark : oneLight}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",
          fontSize: "0.875rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

function SourceCitation({ sources }: { sources: NonNullable<ChatMessage["sources"]> }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <FileText className="h-3.5 w-3.5" />
        {sources.length} source{sources.length !== 1 ? "s" : ""}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {sources.map((source, idx) => (
            <div
              key={`${source.documentId}-${idx}`}
              className="rounded-md border bg-muted/30 p-2 text-xs"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <FileText className="h-3 w-3" />
                {source.documentName}
                {source.page != null && (
                  <span className="text-muted-foreground">
                    (p. {source.page})
                  </span>
                )}
              </div>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                {source.chunkContent}
              </p>
              <div className="mt-1 text-muted-foreground/60">
                Relevance: {(source.score * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmptyAssistant =
    !isUser && isLast && !message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[75%] min-w-0",
          isUser ? "order-1" : "order-2"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border text-card-foreground rounded-bl-md shadow-sm"
          )}
        >
          {isEmptyAssistant ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-pre:my-0 prose-table:my-1 prose-blockquote:my-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code(props) {
                    const { className, children, ...rest } = props as { className?: string; children?: React.ReactNode } & Record<string, unknown>;
                    const match = /language-(\w+)/.exec(className ?? "");
                    const codeStr = String(children).replace(/\n$/, "");
                    if (match) {
                      return (
                        <CodeBlock language={match[1]}>
                          {codeStr}
                        </CodeBlock>
                      );
                    }
                    return (
                      <code
                        className={cn(
                          "rounded bg-muted px-1.5 py-0.5 text-xs font-mono",
                          className
                        )}
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  table(props) {
                    const { children, ...rest } = props as { children?: React.ReactNode } & Record<string, unknown>;
                    return (
                      <div className="overflow-x-auto">
                        <table {...rest}>{children}</table>
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className={cn(!isUser && "ml-0")}>
            <SourceCitation sources={message.sources} />
          </div>
        )}

        <div
          className={cn(
            "mt-1 text-[10px] text-muted-foreground",
            isUser ? "text-right" : "text-left"
          )}
        >
          {message.createdAt &&
            new Date(message.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </div>
      </div>
    </motion.div>
  );
}
