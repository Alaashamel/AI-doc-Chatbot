"use client";

import { ChatArea } from "@/components/chat/chat-area";
import { useParams } from "next/navigation";

export default function ChatConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  return <ChatArea conversationId={conversationId} />;
}
