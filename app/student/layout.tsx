"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const linkClass =
    "block rounded-md px-2 py-1 text-sm font-medium hover:bg-muted transition sm:inline-flex sm:items-center sm:rounded-none sm:px-0 sm:py-0 sm:hover:bg-transparent"

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    closeMenu()
  }, [pathname])

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/90 shadow-sm backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <Link href="/student" className="font-semibold text-lg">
              ISeeYou Student
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              예약, 수강권, 수업 정보를 한눈에 관리하세요
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/student/bookings" className={linkClass}>
              수업 예약
            </Link>
            <Link href="/student/my-tickets" className={linkClass}>
              내 수강권
            </Link>
            <Link href="/student/my-classes" className={linkClass}>
              내 수업
            </Link>
            <Link href="/student/profile" className={linkClass}>
              마이페이지
            </Link>
            <div className="h-6 w-px bg-border" />
            <LogoutButton />
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border sm:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden border-t bg-white px-4 py-3 space-y-3">
            <Link href="/student/bookings" className={linkClass} onClick={closeMenu}>
              수업 예약
            </Link>
            <Link href="/student/my-tickets" className={linkClass} onClick={closeMenu}>
              내 수강권
            </Link>
            <Link href="/student/my-classes" className={linkClass} onClick={closeMenu}>
              내 수업
            </Link>
            <Link href="/student/profile" className={linkClass} onClick={closeMenu}>
              마이페이지
            </Link>
            <div className="border-t pt-3">
              <LogoutButton />
            </div>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
