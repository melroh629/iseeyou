import Link from "next/link"
import { LogoutButton } from "@/components/admin/logout-button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <Link href="/admin" className="font-bold text-xl text-primary">
            ISeeYou 관리자
          </Link>
          <div className="ml-auto flex items-center gap-6">
            <Link
              href="/admin/classes"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              수업 관리
            </Link>
            <Link
              href="/admin/students"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              수강생 관리
            </Link>
            <Link
              href="/admin/tickets"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              수강권 관리
            </Link>
            <div className="h-6 w-px bg-border" />
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
