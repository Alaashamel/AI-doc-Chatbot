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

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        _count: {
          select: { messages: true },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formatted = conversations.map((c: typeof conversations[number] & { _count: { messages: number }; folder: { id: string; name: string } | null }) => ({
      id: c.id,
      title: c.title,
      isPinned: c.isPinned,
      folderId: c.folderId,
      folder: c.folder,
      messageCount: c._count.messages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const { title } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: title.trim(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: conversation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
