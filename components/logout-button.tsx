"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // 쿠키 삭제 API 호출
      await fetch("/api/auth/logout", { method: "POST" });
      // 메인 페이지로 이동
      window.location.href = "/";
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
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
