"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Ticket, 
  Settings,
  LogOut
} from "lucide-react";
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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-20 lg:w-64 flex-col border-r bg-surface-2 h-screen sticky top-0">
      <Link href="/admin" className="p-6 flex items-center justify-center lg:justify-start hover:opacity-80 transition-opacity">
        <span className="font-bold text-xl text-primary hidden lg:block">ISeeYou</span>
        <span className="font-bold text-xl text-primary lg:hidden">ISY</span>
      </Link>
      
      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

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
           {/* Icon only logout for rail */}
           <button className="text-muted-foreground hover:text-destructive">
             <LogOut className="h-6 w-6" />
           </button>
        </div>
      </div>
    </aside>
  );
}
