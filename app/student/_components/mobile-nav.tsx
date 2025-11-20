"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, CalendarCheck, Ticket, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  {
    title: "수업 예약",
    href: "/student/bookings",
    icon: CalendarCheck,
  },
  {
    title: "내 수강권",
    href: "/student/my-tickets",
    icon: Ticket,
  },
  {
    title: "내 수업",
    href: "/student/my-classes",
    icon: BookOpen,
  },
  {
    title: "마이페이지",
    href: "/student/profile",
    icon: User,
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
          <span className="font-bold text-xl text-primary">ISeeYou Student</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

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
