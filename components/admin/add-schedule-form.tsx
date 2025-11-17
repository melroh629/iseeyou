'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SpecificDate } from '@/lib/types/schedule'
import { AdvancedScheduleMode } from '@/components/admin/schedule/advanced-schedule-mode'

interface AddScheduleFormProps {
  classType: {
    id: string
    name: string
    type: string
    default_max_students: number
  }
}

export function AddScheduleForm({ classType }: AddScheduleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([])
  const [maxStudents, setMaxStudents] = useState(classType.default_max_students || 6)
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (specificDates.length === 0) {
      alert('최소 하나의 일정을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      // API 호출 - 고급 모드 사용
      const response = await fetch('/api/admin/recurring-schedules/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classTypeId: classType.id,
          specificDates,
          type: classType.type,
          maxStudents: classType.type === 'group' ? maxStudents : null,
          notes: notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '일정 추가에 실패했습니다.')
      }

      alert(`${specificDates.length}개의 일정이 추가되었습니다.`)
      router.push(`/admin/classes/${classType.id}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/classes/${classType.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">일정 추가</h1>
          <p className="text-muted-foreground mt-1">
            {classType.name} 수업에 새로운 일정을 추가합니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 기간 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>01. 일정 기간</CardTitle>
          </CardHeader>
          <CardContent>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              required
            />
          </CardContent>
        </Card>

        {/* 2. 날짜 선택 (캘린더) */}
        <Card>
          <CardHeader>
            <CardTitle>02. 날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedScheduleMode
              startDate={startDate}
              endDate={endDate}
              specificDates={specificDates}
              onSpecificDatesChange={setSpecificDates}
            />
          </CardContent>
        </Card>

        {/* 3. 수업 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>03. 수업 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classType.type === 'group' && (
              <div className="space-y-2">
                <Label htmlFor="maxStudents">최대 인원 *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(parseInt(e.target.value))}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="수업에 대한 메모나 특이사항을 입력하세요"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex gap-3 justify-end">
          <Link href={`/admin/classes/${classType.id}`}>
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? '추가 중...' : '일정 추가'}
          </Button>
        </div>
      </form>
    </div>
  )
}
