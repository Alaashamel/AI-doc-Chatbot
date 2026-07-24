import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import csvParser from "csv-parser";
import { Readable } from "stream";
import prisma from "@/lib/prisma";
import { processDocument, retrieveRelevantChunks } from "@/services/rag";

export async function extractText(filePath: string, fileType: string): Promise<string> {
  const ext = fileType.toLowerCase();

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse();
    const buffer = await fs.readFile(filePath);
    const data = await parser.parseBuffer(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === ".txt" || ext === ".md") {
    return await fs.readFile(filePath, "utf-8");
  }

  if (ext === ".json") {
    const content = await fs.readFile(filePath, "utf-8");
    try {
      const parsed = JSON.parse(content);
      return typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }

  if (ext === ".csv") {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      const readStream = require("fs").createReadStream(filePath);
      readStream
        .pipe(csvParser())
        .on("data", (row: Record<string, string>) => {
          rows.push(row);
        })
        .on("end", () => {
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          const lines = rows.map((row) =>
            headers.map((h) => `${h}: ${row[h]}`).join(", ")
          );
          resolve(lines.join("\n"));
        })
        .on("error", (err: Error) => {
          reject(err);
        });
    });
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export async function processUploadedDocument(
  filePath: string,
  fileName: string,
  userId: string
): Promise<{
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}> {
  const ext = path.extname(fileName).toLowerCase();
  const stats = await fs.stat(filePath);
  const text = await extractText(filePath, ext);

  if (!text || text.trim().length === 0) {
    throw new Error("Extracted text is empty. The document may be corrupted or contain no readable text.");
  }

  const document = await prisma.document.create({
    data: {
      name: fileName,
      type: ext,
      size: stats.size,
      path: filePath,
      userId,
    },
  });

  const chunks = await processDocument(text, document.id, fileName);

  if (chunks.length > 0) {
    await prisma.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        content: chunk.content,
        metadata: chunk.metadata,
        documentId: document.id,
      })),
    });

    await prisma.document.update({
      where: { id: document.id },
      data: { chunkCount: chunks.length },
    });
  }

  return {
    id: document.id,
    name: document.name,
    type: document.type,
    size: document.size,
    path: document.path,
    chunkCount: chunks.length,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    userId: document.userId,
  };
}
