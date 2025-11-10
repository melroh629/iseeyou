import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <Link href="/admin" className="font-bold text-xl">
            ISeeYou 관리자
          </Link>
          <div className="ml-auto flex gap-4">
            <Link
              href="/admin/classes"
              className="text-sm font-medium hover:underline"
            >
              수업 관리
            </Link>
            <Link
              href="/admin/students"
              className="text-sm font-medium hover:underline"
            >
              수강생 관리
            </Link>
            <Link
              href="/admin/tickets"
              className="text-sm font-medium hover:underline"
            >
              수강권 관리
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}
