import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { DocumentChunk } from "@/types";
import prisma from "@/lib/prisma";
import { CHUNK_SIZE, CHUNK_OVERLAP, RETRIEVAL_K } from "@/config/constants";

interface ProcessedChunk {
  content: string;
  metadata: DocumentChunk["metadata"];
}

interface RetrievalResult {
  id: string;
  content: string;
  documentId: string;
  documentName: string;
  score: number;
}

export async function processDocument(
  text: string,
  documentId: string,
  documentName: string
): Promise<ProcessedChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const docs = await splitter.createDocuments([text]);

  const chunks: ProcessedChunk[] = docs.map((doc, index) => ({
    content: doc.pageContent,
    metadata: {
      documentId,
      documentName,
      chunkIndex: index,
      totalChunks: docs.length,
      createdAt: new Date(),
    },
  }));

  return chunks;
}

export async function retrieveRelevantChunks(
  query: string,
  documentIds?: string[]
): Promise<RetrievalResult[]> {
  const searchTerms = query
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .map((term) => `%${term}%`);

  if (searchTerms.length === 0) {
    return [];
  }

  const whereConditions: string[] = [];
  const params: (string | string[])[] = [];

  const ilikeClause = searchTerms
    .map((term, i) => `dc.content ILIKE $${i + 1}`)
    .join(" OR ");
  whereConditions.push(`(${ilikeClause})`);
  params.push(...searchTerms);

  if (documentIds && documentIds.length > 0) {
    const paramIndex = params.length + 1;
    whereConditions.push(`dc."documentId" = ANY($${paramIndex})`);
    params.push(documentIds);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const queryStr = `
    SELECT
      dc.id,
      dc.content,
      dc."documentId",
      d.name AS "documentName",
      (
        ${searchTerms.map((_, i) => `(CASE WHEN dc.content ILIKE $${i + 1} THEN 1 ELSE 0 END)`).join(" + ")}
      )::float / ${searchTerms.length} AS score
    FROM "DocumentChunk" dc
    JOIN "Document" d ON d.id = dc."documentId"
    ${whereClause}
    ORDER BY score DESC, dc."createdAt" DESC
    LIMIT ${RETRIEVAL_K}
  `;

  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      content: string;
      documentId: string;
      documentName: string;
      score: number;
    }>
  >(queryStr, ...params);

  return results.map((r: { id: string; content: string; documentId: string; documentName: string; score: number }) => ({
    id: r.id,
    content: r.content,
    documentId: r.documentId,
    documentName: r.documentName,
    score: Number(r.score),
  }));
}

export function buildRAGPrompt(
  query: string,
  chunks: Array<{ content: string; documentName: string }>
): string {
  if (chunks.length === 0) {
    return `You are a helpful AI assistant. The user has not uploaded any relevant documents for this question. Please answer based on your general knowledge, and let the user know that no specific documents were found for their query.

User question: ${query}`;
  }

  const contextBlocks = chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] Source: ${chunk.documentName}\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  return `You are a helpful AI assistant that answers questions based on the provided document context. Follow these rules strictly:

1. Answer ONLY based on the provided context documents.
2. If the context does not contain enough information to answer the question, say so clearly.
3. Always cite your sources by referencing the document name when you use information from a specific document.
4. Do not make up or hallucinate information that is not in the context.
5. If multiple documents provide different perspectives, acknowledge both.
6. Be concise but thorough in your answers.

CONTEXT DOCUMENTS:
${contextBlocks}

USER QUESTION: ${query}

Provide a clear, accurate answer based on the context above:`;
}
