import Link from "next/link"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-background">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <Link href="/student" className="font-bold text-xl">
            ISeeYou
          </Link>
          <div className="ml-auto flex gap-4">
            <Link
              href="/student/bookings"
              className="text-sm font-medium hover:underline"
            >
              수업 예약
            </Link>
            <Link
              href="/student/my-tickets"
              className="text-sm font-medium hover:underline"
            >
              내 수강권
            </Link>
            <Link
              href="/student/my-classes"
              className="text-sm font-medium hover:underline"
            >
              내 수업
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  )
}
