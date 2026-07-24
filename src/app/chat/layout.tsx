import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebarWrapper />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderWrapper />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

async function HeaderWrapper() {
  return <Header onSidebarToggle={() => {}} />;
}
