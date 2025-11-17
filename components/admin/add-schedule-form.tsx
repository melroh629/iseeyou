'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface AddScheduleFormProps {
  classType: {
    id: string
    name: string
    type: string
    default_max_students: number
  }
}

interface TimeSlot {
  start_time: string
  end_time: string
}

interface SpecificDate {
  date: string
  times: TimeSlot[]
}

export function AddScheduleForm({ classType }: AddScheduleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([])
  const [maxStudents, setMaxStudents] = useState(classType.default_max_students || 6)
  const [notes, setNotes] = useState('')

  // 캘린더 생성 (startDate ~ endDate)
  const calendarDates = useMemo(() => {
    if (!startDate || !endDate) return []

    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0])
    }

    return dates
  }, [startDate, endDate])

  // 날짜 클릭
  const toggleDate = (dateStr: string) => {
    const existing = specificDates.find((d) => d.date === dateStr)

    if (existing) {
      // 이미 선택된 날짜면 제거
      setSpecificDates(specificDates.filter((d) => d.date !== dateStr))
    } else {
      // 새로운 날짜 추가
      setSpecificDates([
        ...specificDates,
        { date: dateStr, times: [{ start_time: '09:00', end_time: '10:00' }] },
      ])
    }
  }

  // 특정 날짜의 시간 추가
  const addTimeToDate = (dateStr: string) => {
    setSpecificDates(
      specificDates.map((d) =>
        d.date === dateStr
          ? { ...d, times: [...d.times, { start_time: '09:00', end_time: '10:00' }] }
          : d
      )
    )
  }

  // 특정 날짜의 시간 삭제
  const removeTimeFromDate = (dateStr: string, timeIndex: number) => {
    setSpecificDates(
      specificDates
        .map((d) => {
          if (d.date === dateStr) {
            const newTimes = d.times.filter((_, i) => i !== timeIndex)
            return newTimes.length === 0 ? null : { ...d, times: newTimes }
          }
          return d
        })
        .filter((d) => d !== null) as SpecificDate[]
    )
  }

  // 특정 날짜의 시간 수정
  const updateTimeForDate = (
    dateStr: string,
    timeIndex: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setSpecificDates(
      specificDates.map((d) => {
        if (d.date === dateStr) {
          const newTimes = [...d.times]
          newTimes[timeIndex] = { ...newTimes[timeIndex], [field]: value }
          return { ...d, times: newTimes }
        }
        return d
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (specificDates.length === 0) {
      alert('최소 하나의 일정을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      // API 호출 - 고급 모드 사용
      const response = await fetch('/api/admin/class-templates/advanced', {
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일 *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. 날짜 선택 (캘린더) */}
        <Card>
          <CardHeader>
            <CardTitle>02. 날짜 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!startDate || !endDate ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                먼저 일정 기간을 설정해주세요
              </p>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  날짜를 클릭하여 수업을 추가하세요 (선택: {specificDates.length}개)
                </div>

                {/* 간단한 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDates.map((dateStr) => {
                    const date = new Date(dateStr)
                    const isSelected = specificDates.some((d) => d.date === dateStr)

                    return (
                      <Button
                        key={dateStr}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDate(dateStr)}
                        className="h-16 flex flex-col items-center justify-center"
                      >
                        <div className="text-xs opacity-70">
                          {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">{date.getDate()}</div>
                      </Button>
                    )
                  })}
                </div>

                {/* 선택된 날짜별 시간 설정 */}
                {specificDates.length > 0 && (
                  <div className="space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {specificDates
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((dateObj) => {
                        const date = new Date(dateObj.date)
                        return (
                          <div key={dateObj.date} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {date.toLocaleDateString('ko-KR', {
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short',
                                })}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTimeToDate(dateObj.date)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                시간 추가
                              </Button>
                            </div>

                            {dateObj.times.map((time, index) => (
                              <div key={index} className="flex gap-2 items-center ml-4">
                                <Input
                                  type="time"
                                  value={time.start_time}
                                  onChange={(e) =>
                                    updateTimeForDate(
                                      dateObj.date,
                                      index,
                                      'start_time',
                                      e.target.value
                                    )
                                  }
                                  className="w-36"
                                  required
                                />
                                <span>~</span>
                                <Input
                                  type="time"
                                  value={time.end_time}
                                  onChange={(e) =>
                                    updateTimeForDate(
                                      dateObj.date,
                                      index,
                                      'end_time',
                                      e.target.value
                                    )
                                  }
                                  className="w-36"
                                  required
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeFromDate(dateObj.date, index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                  </div>
                )}
              </>
            )}
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
