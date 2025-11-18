'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Dog } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils/phone'
import { validatePasswordMatch } from '@/lib/utils/validation'

export default function StudentSignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    dogName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 비밀번호 확인
    const passwordCheck = validatePasswordMatch(formData.password, formData.confirmPassword)
    if (!passwordCheck.valid) {
      toast({
        variant: 'destructive',
        title: '비밀번호 불일치',
        description: passwordCheck.message,
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: normalizePhoneNumber(formData.phone),
          email: formData.email,
          password: formData.password,
          dogName: formData.dogName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.')
      }

      toast({
        title: '회원가입 완료',
        description: '환영합니다! 로그인 페이지로 이동합니다.',
      })

      // 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/student/login')
      }, 1500)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '회원가입 실패',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">ISeeYou</h1>
          <p className="text-muted-foreground mt-2">강아지 훈련 수업 예약</p>
        </div>

        {/* 회원가입 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>수강생 회원가입</CardTitle>
            <CardDescription>새로운 계정을 만들어보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 보호자 정보 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">보호자 이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호 *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    로그인 시 사용될 전화번호입니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일 (선택)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* 반려견 정보 */}
              <div className="pt-4 border-t space-y-2">
                <Label htmlFor="dogName" className="flex items-center gap-2">
                  <Dog className="h-4 w-4" />
                  반려견 이름 (선택)
                </Label>
                <Input
                  id="dogName"
                  value={formData.dogName}
                  onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                  placeholder="멍멍이"
                />
                <p className="text-xs text-muted-foreground">
                  나중에 마이페이지에서 수정할 수 있습니다.
                </p>
              </div>

              {/* 비밀번호 */}
              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호 *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="8자 이상, 영문+숫자 포함"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div className="pt-4 space-y-3">
                <Button type="submit" disabled={loading} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? '가입 중...' : '회원가입'}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                  <Link href="/student/login" className="text-primary hover:underline">
                    로그인
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
