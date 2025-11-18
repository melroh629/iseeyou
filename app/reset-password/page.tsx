'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils/phone'
import { KeyRound, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 1단계: 전화번호 입력 및 코드 발송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhoneNumber(phone) }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '코드 발송에 실패했습니다.')
      }

      toast({
        title: '인증코드 발송',
        description: '전화번호로 인증코드가 발송되었습니다.',
      })

      // 개발 모드에서 코드를 받았다면 표시
      if (data.code) {
        toast({
          title: '개발 모드 - 인증코드',
          description: `코드: ${data.code}`,
        })
      }

      setStep('verify')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '코드 발송 실패',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // 2단계: 코드 검증 및 비밀번호 재설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: '비밀번호 불일치',
        description: '비밀번호가 일치하지 않습니다.',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password/verify-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhoneNumber(phone),
          code,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '비밀번호 재설정에 실패했습니다.')
      }

      toast({
        title: '비밀번호 재설정 완료',
        description: '새 비밀번호로 로그인해주세요.',
      })

      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '비밀번호 재설정 실패',
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
          <p className="text-muted-foreground mt-2">비밀번호 재설정</p>
        </div>

        {/* 재설정 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 찾기</CardTitle>
            <CardDescription>
              {step === 'phone'
                ? '등록된 전화번호를 입력하세요'
                : '인증코드를 입력하고 새 비밀번호를 설정하세요'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <Button type="submit" className="w-full" disabled={loading || phone.length < 13}>
                    <KeyRound className="h-4 w-4 mr-2" />
                    {loading ? '발송 중...' : '인증코드 받기'}
                  </Button>

                  <div className="text-center text-sm">
                    <Link href="/" className="text-primary hover:underline">
                      로그인으로 돌아가기
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">인증코드 (6자리)</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    SMS로 받은 6자리 인증코드를 입력하세요.
                  </p>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8자 이상, 영문+숫자 포함"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || code.length !== 6 || !newPassword || !confirmPassword}
                  >
                    {loading ? '변경 중...' : '비밀번호 변경'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep('phone')}
                    disabled={loading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    다시 시작
                  </Button>
                </div>
              </form>
            )}
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
