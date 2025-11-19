import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { normalizePhoneNumber } from '@/lib/utils/phone'

interface UseLoginOptions {
  role?: 'admin' | 'student'
  redirectPath?: string
}

export function useLogin({ role, redirectPath }: UseLoginOptions = {}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const login = async (phoneNumber: string, password: string) => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhoneNumber(phoneNumber),
          password,
          ...(role && { role }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.')
      }

      toast({
        title: '로그인 성공',
        description: `${data.user.name}님, 환영합니다!`,
      })

      // 쿠키 저장 대기
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 리다이렉트
      if (redirectPath) {
        window.location.href = redirectPath
      } else if (data.user.role === 'admin') {
        // 프로덕션에서는 admin 서브도메인으로, 로컬에서는 /admin으로
        if (typeof window !== 'undefined') {
          const isLocal = window.location.hostname === 'localhost'
          if (isLocal) {
            window.location.href = '/admin'
          } else {
            window.location.href = `https://admin.${window.location.hostname}`
          }
        }
      } else {
        // student
        window.location.href = '/student'
      }

      return data
    } catch (err: any) {
      console.error('로그인 실패:', err)
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: err.message,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, loading }
}
