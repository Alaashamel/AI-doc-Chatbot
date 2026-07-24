import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const textContent = await readFile(document.path, "utf-8").catch(() => null);

    const chunks = await prisma.documentChunk.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        metadata: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...document,
        textContent,
        chunks,
      },
    });
  } catch (error) {
    console.error("Document preview error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
