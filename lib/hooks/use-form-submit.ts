import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseFormSubmitOptions<T = any> {
  url: string
  method?: 'POST' | 'PATCH' | 'DELETE'
  onSuccess?: () => void
  onError?: (error: string) => void
  successMessage?: string
  transformData?: (data: T) => any
}

export function useFormSubmit<T = any>({
  url,
  method = 'POST',
  onSuccess,
  onError,
  successMessage,
  transformData,
}: UseFormSubmitOptions<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (data: T) => {
    setLoading(true)
    setError('')

    try {
      const body = transformData ? transformData(data) : data

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '요청 처리에 실패했습니다.')
      }

      // 성공 메시지
      if (successMessage) {
        alert(successMessage)
      }

      // 성공 콜백
      onSuccess?.()

      // 페이지 새로고침
      router.refresh()

      return result
    } catch (err: any) {
      const errorMessage = err.message || '오류가 발생했습니다.'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError('')
    setLoading(false)
  }

  return {
    loading,
    error,
    handleSubmit,
    reset,
  }
}
