import { useState, ChangeEvent } from 'react'

interface UseFormStateOptions<T> {
  initialValues: T
}

export function useFormState<T>({ initialValues }: UseFormStateOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const setValue = (name: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const reset = () => {
    setFormData(initialValues)
  }

  return {
    formData,
    setFormData, // 필요한 경우 직접 상태 업데이트를 위해 노출
    handleChange,
    setValue,
    reset,
  }
}
