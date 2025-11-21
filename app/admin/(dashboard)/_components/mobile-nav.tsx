"use client";

import { LayoutDashboard, CalendarDays, Users, Ticket, Settings } from "lucide-react";
import { MobileMenu } from "@/components/ui/mobile-menu";
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
  return (
    <MobileMenu title="ISeeYou" items={navItems}>
      <LogoutButton />
    </MobileMenu>
  );
}
