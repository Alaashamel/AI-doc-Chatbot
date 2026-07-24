import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { streamChatCompletion, estimateTokens } from "@/services/ai-providers";
import { retrieveRelevantChunks, buildRAGPrompt } from "@/services/rag";
import type { AIProvider } from "@/types";
import {
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
} from "@/config/constants";

interface ChatRequestBody {
  conversationId?: string;
  content: string;
  provider?: AIProvider;
  model?: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: ChatRequestBody = await request.json();
    const { conversationId, content, provider, model } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    const selectedProvider = provider || DEFAULT_PROVIDER;
    const selectedModel = model || DEFAULT_MODEL;

    let activeConversationId = conversationId;

    if (activeConversationId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          id: activeConversationId,
          userId: session.user.id,
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      const title =
        content.length > 80 ? content.substring(0, 80) + "..." : content;
      const conversation = await prisma.conversation.create({
        data: {
          title,
          userId: session.user.id,
        },
      });
      activeConversationId = conversation.id;
    }

    await prisma.conversation.update({
      where: { id: activeConversationId! },
      data: { updatedAt: new Date() },
    });

    await prisma.message.create({
      data: {
        role: "user",
        content,
        conversationId: activeConversationId!,
      },
    });

    const recentMessages = await prisma.message.findMany({
      where: { conversationId: activeConversationId! },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: {
        role: true,
        content: true,
      },
    });

    const relevantChunks = await retrieveRelevantChunks(content);
    const ragPrompt = buildRAGPrompt(
      content,
      relevantChunks.map((c) => ({
        content: c.content,
        documentName: c.documentName,
      }))
    );

    const messagesForAI = [
      { role: "system", content: ragPrompt },
      ...recentMessages.filter((m) => m.role !== "system"),
    ];

    const stream = await streamChatCompletion({
      messages: messagesForAI,
      provider: selectedProvider,
      model: selectedModel,
      temperature: DEFAULT_TEMPERATURE,
      maxTokens: DEFAULT_MAX_TOKENS,
    });

    let fullResponse = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const textChunk = decoder.decode(value, { stream: true });
            fullResponse += textChunk;

            const sseData = `data: ${JSON.stringify({ type: "text", content: textChunk })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          const savedMessage = await prisma.message.create({
            data: {
              role: "assistant",
              content: fullResponse,
              conversationId: activeConversationId!,
              sources:
                relevantChunks.length > 0
                  ? relevantChunks.map((c) => ({
                      documentId: c.documentId,
                      documentName: c.documentName,
                      chunkContent: c.content.substring(0, 200),
                      score: c.score,
                    }))
                  : undefined,
            },
          });

          if (relevantChunks.length > 0) {
            const sourcesPayload = `data: ${JSON.stringify({
              type: "sources",
              content: "",
              sources: relevantChunks.map((c) => ({
                documentId: c.documentId,
                documentName: c.documentName,
                chunkContent: c.content.substring(0, 200),
                score: c.score,
              })),
            })}\n\n`;
            controller.enqueue(encoder.encode(sourcesPayload));
          }

          const donePayload = `data: ${JSON.stringify({ type: "done", content: "" })}\n\n`;
          controller.enqueue(encoder.encode(donePayload));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          const errorPayload = `data: ${JSON.stringify({
            type: "error",
            content: err instanceof Error ? err.message : "Stream error",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorPayload));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(transformedStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": activeConversationId!,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
