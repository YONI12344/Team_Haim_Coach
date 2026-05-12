import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { requireAuth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAuth();

  return (
    <div className="min-h-screen bg-navy-950">
      <Header profile={profile} />
      <div className="flex flex-col md:flex-row">
        <Sidebar profile={profile} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
