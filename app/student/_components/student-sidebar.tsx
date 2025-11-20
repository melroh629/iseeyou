"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  CalendarCheck, 
  Ticket, 
  BookOpen, 
  User,
  LogOut
} from "lucide-react";
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

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-20 lg:w-64 flex-col border-r bg-surface-2 h-screen sticky top-0">
      <div className="p-6 flex items-center justify-center lg:justify-start">
        <span className="font-bold text-xl text-primary hidden lg:block">ISeeYou</span>
        <span className="font-bold text-xl text-primary lg:hidden">ISY</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-pill transition-colors",
                "hover:bg-surface-3",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="hidden lg:block">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="hidden lg:block">
          <LogoutButton />
        </div>
        <div className="lg:hidden flex justify-center">
           <button className="text-muted-foreground hover:text-destructive">
             <LogOut className="h-6 w-6" />
           </button>
        </div>
      </div>
    </aside>
  );
}
