"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, CalendarDays, Users, Ticket, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  {
    title: "대시보드",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "수업 관리",
    href: "/admin/classes",
    icon: CalendarDays,
  },
  {
    title: "수강생 관리",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "수강권 관리",
    href: "/admin/tickets",
    icon: Ticket,
  },
  {
    title: "설정",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-surface-2 border-r-0">
        <div className="p-6 border-b border-border/50">
          <span className="font-bold text-xl text-primary">ISeeYou</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-pill transition-colors",
                  "hover:bg-surface-3",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
