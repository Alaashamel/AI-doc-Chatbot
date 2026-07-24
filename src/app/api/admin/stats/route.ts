import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [userCount, documentCount, conversationCount, messageCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.document.count(),
        prisma.conversation.count(),
        prisma.message.count(),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalDocuments: documentCount,
        totalConversations: conversationCount,
        totalMessages: messageCount,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
