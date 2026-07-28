"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  Pin,
  PinOff,
  Edit,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, truncate, getInitials } from "@/lib/utils";
import type { ChatConversation, ChatFolder } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

type DateGroup = {
  label: string;
  conversations: ChatConversation[];
};

function groupConversationsByDate(
  conversations: ChatConversation[]
): DateGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups: DateGroup[] = [
    { label: "Today", conversations: [] },
    { label: "Yesterday", conversations: [] },
    { label: "Previous 7 Days", conversations: [] },
    { label: "Previous 30 Days", conversations: [] },
    { label: "Older", conversations: [] },
  ];

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    const convDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (convDate >= today) {
      groups[0].conversations.push(conv);
    } else if (convDate >= yesterday) {
      groups[1].conversations.push(conv);
    } else if (convDate >= sevenDaysAgo) {
      groups[2].conversations.push(conv);
    } else if (convDate >= thirtyDaysAgo) {
      groups[3].conversations.push(conv);
    } else {
      groups[4].conversations.push(conv);
    }
  }

  return groups.filter((g) => g.conversations.length > 0);
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Skeleton className="h-9 w-full rounded-md" />
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="mt-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onRename,
  onPin,
  onDelete,
  onMoveToFolder,
  folders,
}: {
  conversation: ChatConversation;
  isActive: boolean;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (id: string, folderId: string | null) => void;
  folders: ChatFolder[];
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleRename = () => {
    if (editTitle.trim()) {
      onRename(conversation.id, editTitle.trim());
      setEditing(false);
    }
  };

  return (
    <div className="group relative">
      {editing ? (
        <div className="flex items-center gap-1 px-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={handleRename}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
      ) : (
        <Link
          href={`/chat/${conversation.id}`}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          {conversation.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{conversation.title}</span>
        </Link>
      )}

      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setEditing(true);
              }}
            >
              <Edit className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onPin(conversation.id, !conversation.isPinned);
              }}
            >
              {conversation.isPinned ? (
                <>
                  <PinOff className="mr-2 h-3.5 w-3.5" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="mr-2 h-3.5 w-3.5" />
                  Pin
                </>
              )}
            </DropdownMenuItem>
            {folders.length > 0 && (
              <DropdownMenuItem
                onClick={(e) => e.preventDefault()}
                className="relative"
              >
                <Folder className="mr-2 h-3.5 w-3.5" />
                Move to Folder
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onDelete(conversation.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      return (data.data ?? data) as ChatConversation[];
    },
  });

  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      const data = await res.json();
      return (data.data ?? data) as ChatFolder[];
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const data = await res.json();
      return data.data ?? data;
    },
    onSuccess: (data: ChatConversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${data.id}`);
      onToggle();
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
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
      if (pathname === `/chat/${id}`) {
        router.push("/chat");
      }
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return (await res.json()) as ChatFolder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      setShowNewFolderInput(false);
    },
  });

  const moveToFolderMutation = useMutation({
    mutationFn: async ({
      conversationId,
      folderId,
    }: {
      conversationId: string;
      folderId: string | null;
    }) => {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) throw new Error("Failed to move conversation");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const pinnedConversations = useMemo(
    () => filteredConversations.filter((c) => c.isPinned),
    [filteredConversations]
  );

  const unpinnedConversations = useMemo(
    () => filteredConversations.filter((c) => !c.isPinned),
    [filteredConversations]
  );

  const unpinnedGrouped = useMemo(
    () => groupConversationsByDate(unpinnedConversations),
    [unpinnedConversations]
  );

  const folderMap = useMemo(() => {
    if (!folders) return new Map<string, ChatConversation[]>();
    const map = new Map<string, ChatConversation[]>();
    for (const conv of filteredConversations) {
      if (conv.folderId) {
        const existing = map.get(conv.folderId) ?? [];
        existing.push(conv);
        map.set(conv.folderId, existing);
      }
    }
    return map;
  }, [folders, filteredConversations]);

  const handleNewChat = useCallback(() => {
    createConversationMutation.mutate();
  }, [createConversationMutation]);

  const handleCreateFolder = useCallback(() => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName.trim());
    }
  }, [newFolderName, createFolderMutation]);

  const user = session?.user;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background lg:relative lg:z-auto",
          !isOpen && "pointer-events-none lg:pointer-events-auto"
        )}
      >
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-1">
          {conversationsLoading ? (
            <SidebarSkeleton />
          ) : (
            <div className="space-y-1 pb-4">
              {pinnedConversations.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pinned
                  </p>
                  {pinnedConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={pathname === `/chat/${conv.id}`}
                      onRename={(id, title) =>
                        renameMutation.mutate({ id, title })
                      }
                      onPin={(id, pinned) =>
                        pinMutation.mutate({ id, isPinned: pinned })
                      }
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onMoveToFolder={(id, folderId) =>
                        moveToFolderMutation.mutate({
                          conversationId: id,
                          folderId,
                        })
                      }
                      folders={folders ?? []}
                    />
                  ))}
                </div>
              )}

              {folders && folders.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => setFoldersExpanded(!foldersExpanded)}
                    className="flex w-full items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
                  >
                    {foldersExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    Folders
                  </button>
                  <AnimatePresence>
                    {foldersExpanded &&
                      folders.map((folder) => (
                        <motion.div
                          key={folder.id}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-1 px-2 py-1.5 text-sm">
                            <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{folder.name}</span>
                          </div>
                          {folderMap.get(folder.id)?.map((conv) => (
                            <div key={conv.id} className="pl-4">
                              <ConversationItem
                                conversation={conv}
                                isActive={pathname === `/chat/${conv.id}`}
                                onRename={(id, title) =>
                                  renameMutation.mutate({ id, title })
                                }
                                onPin={(id, pinned) =>
                                  pinMutation.mutate({ id, isPinned: pinned })
                                }
                                onDelete={(id) => deleteMutation.mutate(id)}
                                onMoveToFolder={(id, folderId) =>
                                  moveToFolderMutation.mutate({
                                    conversationId: id,
                                    folderId,
                                  })
                                }
                                folders={folders ?? []}
                              />
                            </div>
                          ))}
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}

              {unpinnedGrouped.map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </p>
                  {group.conversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={pathname === `/chat/${conv.id}`}
                      onRename={(id, title) =>
                        renameMutation.mutate({ id, title })
                      }
                      onPin={(id, pinned) =>
                        pinMutation.mutate({ id, isPinned: pinned })
                      }
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onMoveToFolder={(id, folderId) =>
                        moveToFolderMutation.mutate({
                          conversationId: id,
                          folderId,
                        })
                      }
                      folders={folders ?? []}
                    />
                  ))}
                </div>
              ))}

              {!conversationsLoading &&
                filteredConversations.length === 0 && (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                    {searchQuery
                      ? "No conversations found"
                      : "No conversations yet"}
                  </div>
                )}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-3">
          {showNewFolderInput ? (
            <div className="mb-2 flex items-center gap-1">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") {
                    setShowNewFolderInput(false);
                    setNewFolderName("");
                  }
                }}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="mb-2 w-full justify-start gap-2 text-sm"
              onClick={() => setShowNewFolderInput(true)}
            >
              <Folder className="h-4 w-4" />
              New Folder
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user?.image ?? undefined}
                    alt={user?.name ?? "User"}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">
                  {user?.name ?? user?.email ?? "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>
    </>
  );
}
