import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
      settings: {
        create: {
          defaultProvider: "openai",
          defaultModel: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 4096,
          theme: "system",
        },
      },
    },
  });

  console.log(`Created user: ${user.email}`);

  const folder = await prisma.folder.create({
    data: {
      name: "Getting Started",
      userId: user.id,
    },
  });

  console.log(`Created folder: ${folder.name}`);

  const conversation = await prisma.conversation.create({
    data: {
      title: "Welcome to AI Knowledge Platform",
      userId: user.id,
      folderId: folder.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        role: "user",
        content: "What can you do?",
        conversationId: conversation.id,
      },
      {
        role: "assistant",
        content:
          "I'm an AI assistant powered by RAG (Retrieval-Augmented Generation). I can:\n\n" +
          "1. **Answer questions** about your uploaded documents\n" +
          "2. **Summarize** content from multiple sources\n" +
          "3. **Compare** information across documents\n" +
          "4. **Generate** insights and action plans\n\n" +
          "Upload some documents and start asking questions!",
        conversationId: conversation.id,
      },
    ],
  });

  console.log(`Created welcome conversation`);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
