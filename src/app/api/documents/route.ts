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

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        chunkCount: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { chunks: true },
        },
      },
    });

    const formatted = documents.map((d: typeof documents[number] & { _count: { chunks: number } }) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      size: d.size,
      chunkCount: d.chunkCount || d._count.chunks,
      metadata: d.metadata,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("List documents error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
