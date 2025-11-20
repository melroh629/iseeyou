import { StudentSidebar } from "./_components/student-sidebar";
import { MobileNav } from "./_components/mobile-nav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden border-b bg-surface-1 p-4 flex items-center justify-between sticky top-0 z-10">
          <span className="font-bold text-lg">ISeeYou</span>
          <MobileNav />
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
           {children}
        </main>
      </div>
    </div>
  )
}
