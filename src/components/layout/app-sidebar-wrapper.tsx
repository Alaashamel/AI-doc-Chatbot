"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export function AppSidebarWrapper() {
  const [isOpen, setIsOpen] = useState(true);

  return <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />;
}
