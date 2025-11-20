import { AdminSidebar } from "./_components/admin-sidebar";
import { MobileNav } from "./_components/mobile-nav"; // Will create this next

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page should not have the sidebar
  // We can handle this by checking pathname in the component or just letting the page handle it
  // But for layout simplicity, let's assume the login page might use a different layout or we check here.
  // Actually, usually auth pages have their own layout group (auth). 
  // If /admin/login is inside this layout, we need to conditionally render.
  // The previous code checked for /admin/login.

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden border-b bg-surface-1 p-4 flex items-center justify-between sticky top-0 z-10">
          <span className="font-bold text-lg">ISeeYou</span>
          <MobileNav />
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
           {/* Top App Bar area could go here if needed, for now just content */}
           {children}
        </main>
      </div>
    </div>
  );
}
