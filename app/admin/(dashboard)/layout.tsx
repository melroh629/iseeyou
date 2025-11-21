import { AdminSidebar } from "./_components/admin-sidebar";
import { MobileNav } from "./_components/mobile-nav";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* 모바일 헤더 */}
        <header className="md:hidden border-b bg-background/80 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/admin" className="font-bold text-lg text-primary hover:opacity-80 transition-opacity">
            ISeeYou
          </Link>
          <MobileNav />
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
           {children}
        </main>
      </div>
    </div>
  );
}
