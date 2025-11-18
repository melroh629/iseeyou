"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const linkClass =
    "block rounded-md px-2 py-1 text-sm hover:bg-muted transition sm:inline-flex sm:items-center sm:rounded-none sm:px-0 sm:py-0 sm:hover:bg-transparent";

  const NavLinks = () => (
    <>
      <Link
        href="/admin/classes"
        className={`${linkClass} sm:hover:text-primary`}
        onClick={() => setIsMenuOpen(false)}
      >
        수업 관리
      </Link>
      <Link
        href="/admin/students"
        className={`${linkClass} sm:hover:text-primary`}
        onClick={() => setIsMenuOpen(false)}
      >
        수강생 관리
      </Link>
      <Link
        href="/admin/tickets"
        className={`${linkClass} sm:hover:text-primary`}
        onClick={() => setIsMenuOpen(false)}
      >
        수강권 관리
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {!isLoginPage && (
        <header className="border-b bg-white/90 shadow-sm backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <Link href="/admin" className="font-semibold text-lg text-primary">
                ISeeYou 관리자센터
              </Link>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                오늘의 수업과 수강생 현황을 빠르게 확인하세요
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <NavLinks />
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
            <div className="sm:hidden border-t bg-white px-4 py-3 text-sm font-medium space-y-3">
              <NavLinks />
              <div className="border-t pt-3">
                <LogoutButton />
              </div>
            </div>
          )}
        </header>
      )}
      <main className={isLoginPage ? "px-4 py-6" : "container mx-auto px-4 py-6 sm:px-6"}>
        {children}
      </main>
    </div>
  );
}
