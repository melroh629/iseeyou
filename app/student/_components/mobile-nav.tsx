"use client";

import { CalendarCheck, Ticket, BookOpen, User } from "lucide-react";
import { MobileMenu } from "@/components/ui/mobile-menu";
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
  return (
    <MobileMenu title="ISeeYou Student" items={navItems}>
      <LogoutButton />
    </MobileMenu>
  );
}
