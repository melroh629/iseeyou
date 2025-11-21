'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function AddAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: '비밀번호 불일치',
        description: '비밀번호가 일치하지 않습니다.',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '관리자 추가에 실패했습니다.')
      }

      toast({
        title: '관리자 추가 완료',
        description: `${formData.name}님이 관리자로 등록되었습니다.`,
      })

      // 폼 초기화
      setFormData({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
      })

      // 잠시 후 목록으로 이동
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">관리자 추가</h1>
          <p className="text-muted-foreground mt-1">새로운 관리자 계정을 생성합니다</p>
        </div>
      </div>

      {/* 경고 메시지 */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">주의사항</p>
              <ul className="list-disc list-inside space-y-1">
                <li>관리자는 모든 데이터에 접근할 수 있습니다.</li>
                <li>신뢰할 수 있는 사람에게만 관리자 권한을 부여하세요.</li>
                <li>비밀번호는 안전하게 관리하세요. (8자 이상, 영문+숫자 포함)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 관리자 추가 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>관리자 정보</CardTitle>
          <CardDescription>새로운 관리자의 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
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
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                required
              />
              <p className="text-xs text-muted-foreground">
                로그인 시 사용될 전화번호입니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="8자 이상, 영문+숫자 포함"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
              <PasswordInput
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex-1"
              >
                취소
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? '추가 중...' : '관리자 추가'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
