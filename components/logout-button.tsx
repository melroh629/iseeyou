"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export function LogoutButton({ className, iconOnly = false }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // 쿠키 삭제 API 호출
      await fetch("/api/auth/logout", { method: "POST" });
      
      // 메인 도메인으로 이동
      if (window.location.hostname.startsWith('admin.')) {
        const mainDomain = window.location.hostname.replace('admin.', '')
        window.location.href = `${window.location.protocol}//${mainDomain}/`
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      <LogOut className={iconOnly ? "h-6 w-6" : "h-4 w-4 mr-2"} />
      {!iconOnly && (loading ? "로그아웃 중..." : "로그아웃")}
    </Button>
  );
}
