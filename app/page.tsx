'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatPhoneNumber } from '@/lib/utils/phone'
import { useLogin } from '@/lib/hooks/use-login'

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading } = useLogin()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(phoneNumber, password)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">ISeeYou</h1>
          <p className="text-muted-foreground mt-2">아이씨유 독 트레이닝</p>
        </div>

        {/* 로그인 카드 */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
            <CardDescription className="text-center">
              전화번호와 비밀번호로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <PasswordInput
                  id="password"
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

                <div className="text-center text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">계정이 없으신가요? </span>
                    <Link href="/student/signup" className="text-primary hover:underline">
                      회원가입
                    </Link>
                  </div>
                  <div>
                    <Link href="/reset-password" className="text-muted-foreground hover:text-foreground text-xs">
                      비밀번호 찾기
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
