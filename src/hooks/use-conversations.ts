"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ChatConversation } from "@/types";

interface UseConversationsReturn {
  conversations: ChatConversation[];
  isLoading: boolean;
  error: string | null;
  createConversation: (title?: string) => Promise<ChatConversation>;
  renameConversation: (id: string, title: string) => Promise<void>;
  pinConversation: (id: string, isPinned: boolean) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  isCreating: boolean;
}

export function useConversations(): UseConversationsReturn {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      return (data.data ?? data) as ChatConversation[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "New Chat" }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const data = await res.json();
      return (data.data ?? data) as ChatConversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to create conversation");
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to rename");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      if (!res.ok) throw new Error("Failed to update pin");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push("/chat");
      toast.success("Conversation deleted");
    },
    onError: () => {
      toast.error("Failed to delete conversation");
    },
  });

  return {
    conversations,
    isLoading,
    error: error?.message ?? null,
    createConversation: createMutation.mutateAsync,
    renameConversation: async (id, title) =>
      renameMutation.mutateAsync({ id, title }),
    pinConversation: async (id, isPinned) =>
      pinMutation.mutateAsync({ id, isPinned }),
    deleteConversation: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
