import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { createFolderSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { conversations: true },
        },
      },
    });

    const formatted = folders.map((f: typeof folders[number] & { _count: { conversations: number } }) => ({
      id: f.id,
      name: f.name,
      conversationCount: f._count.conversations,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("List folders error:", error);
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
    const validated = createFolderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = validated.data;

    const existing = await prisma.folder.findFirst({
      where: {
        name,
        userId: session.user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A folder with this name already exists" },
        { status: 409 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: folder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
