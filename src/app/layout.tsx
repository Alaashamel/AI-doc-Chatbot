import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "globals.css";
import { Providers } from "@/components/providers/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Knowledge Platform",
  description:
    "Enterprise AI-powered document chat platform with RAG, multi-provider LLM support, and intelligent knowledge retrieval.",
  keywords: [
    "AI",
    "RAG",
    "knowledge platform",
    "document chat",
    "LLM",
    "ChatGPT",
    "enterprise",
  ],
  authors: [{ name: "AI Knowledge Platform Team" }],
  openGraph: {
    title: "AI Knowledge Platform",
    description:
      "Enterprise AI-powered document chat platform with RAG and multi-provider LLM support.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
