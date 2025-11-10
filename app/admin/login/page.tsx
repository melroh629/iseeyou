'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '인증번호 발송에 실패했습니다.')
      }

      // 개발 모드에서는 OTP를 콘솔에 표시
      if (data.dev?.otp) {
        console.log('🔐 개발 모드 OTP:', data.dev.otp)
        alert(`개발 모드: OTP는 ${data.dev.otp} 입니다`)
      }

      setStep('otp')
    } catch (err: any) {
      console.error('OTP 발송 실패:', err)
      setError(err.message || '인증번호 발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '인증번호가 올바르지 않습니다.')
      }

      // 관리자 권한 확인
      if (data.role !== 'admin') {
        throw new Error('관리자 권한이 없습니다.')
      }

      console.log('✅ 로그인 성공! JWT 쿠키가 설정되었습니다.')

      // 약간의 딜레이 후 리다이렉트 (쿠키 저장 대기)
      await new Promise(resolve => setTimeout(resolve, 300))

      // 성공 시 대시보드로 이동
      window.location.href = '/admin'
    } catch (err: any) {
      console.error('OTP 검증 실패:', err)
      setError(err.message || '인증번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '')

    // 010-1234-5678 형식으로 포맷팅
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            관리자 로그인
          </CardTitle>
          <CardDescription className="text-center">
            ISeeYou 강아지 훈련 수업 관리
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
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
                <p className="text-xs text-muted-foreground">
                  관리자로 등록된 전화번호를 입력하세요
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || phoneNumber.length < 13}
              >
                {loading ? '발송 중...' : '인증번호 발송'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">인증번호</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="6자리 인증번호"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {phoneNumber}로 발송된 인증번호를 입력하세요
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? '확인 중...' : '로그인'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setError('')
                  }}
                  disabled={loading}
                >
                  다른 번호로 로그인
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
