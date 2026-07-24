import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { processUploadedDocument } from "@/services/documents";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from "@/config/constants";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type "${ext}" is not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB`,
        },
        { status: 400 }
      );
    }

    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const { mkdirSync, writeFileSync } = await import("fs");
    const path = await import("path");

    const userDir = path.join(uploadDir, session.user.id);
    mkdirSync(userDir, { recursive: true });

    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(userDir, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(filePath, buffer);

    const document = await processUploadedDocument(
      filePath,
      fileName,
      session.user.id
    );

    return NextResponse.json(
      { success: true, data: document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process document",
      },
      { status: 500 }
    );
  }
}
