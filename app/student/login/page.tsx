'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatPhoneNumber } from '@/lib/utils/phone'
import { useLogin } from '@/lib/hooks/use-login'

export default function StudentLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading } = useLogin({ role: 'student', redirectPath: '/student' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(phoneNumber, password)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">ISeeYou</h1>
          <p className="text-muted-foreground mt-2">강아지 훈련 수업 예약</p>
        </div>

        {/* 로그인 카드 */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
            <CardDescription className="text-center">
              수강생 계정으로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || phoneNumber.length < 13 || password.length < 1}
                >
                  {loading ? '로그인 중...' : '로그인'}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">계정이 없으신가요? </span>
                  <Link href="/student/signup" className="text-primary hover:underline">
                    회원가입
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 홈으로 */}
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
