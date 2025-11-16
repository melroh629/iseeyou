'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Copy, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

interface TimeSlot {
  start_time: string
  end_time: string
}

interface WeeklyPattern {
  [key: string]: TimeSlot[]
}

interface SpecificDate {
  date: string
  times: TimeSlot[]
}

const DAYS = [
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
  { key: 'sunday', label: '일' },
]

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
]

export default function NewClassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 수업 기본 정보
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])

  // 수업 일정 정보
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState<'group' | 'private'>('group')
  const [maxStudents, setMaxStudents] = useState(10)

  // 일정 모드: basic (매주 반복) vs advanced (날짜별 선택)
  const [scheduleMode, setScheduleMode] = useState<'basic' | 'advanced'>('basic')

  // 기본 모드: 반복 패턴
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [weeklyPattern, setWeeklyPattern] = useState<WeeklyPattern>({})

  // 고급 모드: 특정 날짜 선택
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([])

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

  // 날짜 클릭 (고급 모드)
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

  // 특정 날짜의 시간 추가 (고급 모드)
  const addTimeToDate = (dateStr: string) => {
    setSpecificDates(
      specificDates.map((d) =>
        d.date === dateStr
          ? { ...d, times: [...d.times, { start_time: '09:00', end_time: '10:00' }] }
          : d
      )
    )
  }

  // 특정 날짜의 시간 삭제 (고급 모드)
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

  // 특정 날짜의 시간 수정 (고급 모드)
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

  // === 기본 모드 함수들 ===

  // 요일 선택/해제
  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayKey))
      const newPattern = { ...weeklyPattern }
      delete newPattern[dayKey]
      setWeeklyPattern(newPattern)
    } else {
      setSelectedDays([...selectedDays, dayKey])
      setWeeklyPattern({
        ...weeklyPattern,
        [dayKey]: [{ start_time: '09:00', end_time: '10:00' }],
      })
    }
  }

  // 시간대 추가
  const addTimeSlot = (dayKey: string) => {
    const slots = weeklyPattern[dayKey] || []
    setWeeklyPattern({
      ...weeklyPattern,
      [dayKey]: [...slots, { start_time: '09:00', end_time: '10:00' }],
    })
  }

  // 시간대 삭제
  const removeTimeSlot = (dayKey: string, index: number) => {
    const slots = weeklyPattern[dayKey] || []
    const newSlots = slots.filter((_, i) => i !== index)

    if (newSlots.length === 0) {
      const newPattern = { ...weeklyPattern }
      delete newPattern[dayKey]
      setWeeklyPattern(newPattern)
      setSelectedDays(selectedDays.filter((d) => d !== dayKey))
    } else {
      setWeeklyPattern({
        ...weeklyPattern,
        [dayKey]: newSlots,
      })
    }
  }

  // 시간 변경
  const updateTimeSlot = (
    dayKey: string,
    index: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    const slots = weeklyPattern[dayKey] || []
    const newSlots = [...slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setWeeklyPattern({
      ...weeklyPattern,
      [dayKey]: newSlots,
    })
  }

  // 모든 요일에 첫 번째 시간대 복사
  const copyToAllDays = () => {
    if (selectedDays.length === 0) return

    const firstDay = selectedDays[0]
    const firstSlot = weeklyPattern[firstDay]?.[0]

    if (!firstSlot) return

    const newPattern: WeeklyPattern = {}
    selectedDays.forEach((day) => {
      newPattern[day] = [{ ...firstSlot }]
    })

    setWeeklyPattern(newPattern)
  }

  // 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !startDate || !endDate) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    if (scheduleMode === 'basic' && selectedDays.length === 0) {
      alert('반복 요일을 선택해주세요.')
      return
    }

    if (scheduleMode === 'advanced' && specificDates.length === 0) {
      alert('수업 날짜를 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      // 1. class_type 생성
      const classTypeResponse = await fetch('/api/admin/class-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          color,
        }),
      })

      const classTypeData = await classTypeResponse.json()

      if (!classTypeResponse.ok) {
        throw new Error(classTypeData.error || '수업 타입 생성에 실패했습니다.')
      }

      // 2. 일정 생성
      let templateResponse

      if (scheduleMode === 'basic') {
        // 기본 모드: 반복 패턴
        templateResponse = await fetch('/api/admin/class-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classTypeId: classTypeData.classType.id,
            startDate,
            endDate,
            weeklyPattern,
            type,
            maxStudents: type === 'group' ? maxStudents : null,
          }),
        })
      } else {
        // 고급 모드: 특정 날짜
        templateResponse = await fetch('/api/admin/class-templates/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classTypeId: classTypeData.classType.id,
            specificDates,
            type,
            maxStudents: type === 'group' ? maxStudents : null,
          }),
        })
      }

      const templateData = await templateResponse.json()

      if (!templateResponse.ok) {
        throw new Error(templateData.error || '일정 생성에 실패했습니다.')
      }

      alert(
        `수업이 생성되었습니다!\n총 ${templateData.summary?.totalClasses || specificDates.length}개의 일정이 생성되었습니다.`
      )
      router.push('/admin/classes')
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
        <Link href="/admin/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">새 수업 만들기</h1>
          <p className="text-muted-foreground mt-1">
            수업 정보와 반복 일정을 한번에 설정하세요
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 수업 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>01. 수업 기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">수업 이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 프라이빗 레슨"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">수업 설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="수업에 대한 간단한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>수업 색상</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. 수업 기간 */}
        <Card>
          <CardHeader>
            <CardTitle>02. 수업 기간</CardTitle>
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

        {/* 3. 수업 형태 */}
        <Card>
          <CardHeader>
            <CardTitle>03. 수업 형태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">수업 타입 *</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">그룹 수업</SelectItem>
                    <SelectItem value="private">프라이빗 수업</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {type === 'group' && (
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
            </div>
          </CardContent>
        </Card>

        {/* 4. 일정 설정 모드 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>04. 일정 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 모드 선택 */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={scheduleMode === 'basic' ? 'default' : 'outline'}
                onClick={() => setScheduleMode('basic')}
                className="flex-1"
              >
                기본 모드 (매주 반복)
              </Button>
              <Button
                type="button"
                variant={scheduleMode === 'advanced' ? 'default' : 'outline'}
                onClick={() => setScheduleMode('advanced')}
                className="flex-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                고급 모드 (날짜 직접 선택)
              </Button>
            </div>

            {/* 기본 모드 */}
            {scheduleMode === 'basic' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>반복 요일 선택 *</Label>
                  {selectedDays.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={copyToAllDays}>
                      <Copy className="mr-2 h-3 w-3" />
                      모든 요일에 일괄 적용
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day.key}
                      type="button"
                      variant={selectedDays.includes(day.key) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.key)}
                      className="flex-1"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>

                {/* 요일별 시간 설정 */}
                {selectedDays.length > 0 && (
                  <div className="space-y-4 border rounded-lg p-4">
                    {selectedDays.map((dayKey) => {
                      const day = DAYS.find((d) => d.key === dayKey)
                      const slots = weeklyPattern[dayKey] || []

                      return (
                        <div key={dayKey} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{day?.label}요일</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(dayKey)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              시간 추가
                            </Button>
                          </div>

                          {slots.map((slot, index) => (
                            <div key={index} className="flex gap-2 items-center ml-4">
                              <Input
                                type="time"
                                value={slot.start_time}
                                onChange={(e) =>
                                  updateTimeSlot(dayKey, index, 'start_time', e.target.value)
                                }
                                className="w-36"
                                required
                              />
                              <span>~</span>
                              <Input
                                type="time"
                                value={slot.end_time}
                                onChange={(e) =>
                                  updateTimeSlot(dayKey, index, 'end_time', e.target.value)
                                }
                                className="w-36"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeSlot(dayKey, index)}
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
              </div>
            )}

            {/* 고급 모드 - 캘린더 */}
            {scheduleMode === 'advanced' && (
              <div className="space-y-4">
                {!startDate || !endDate ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    먼저 수업 기간을 설정해주세요
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex gap-2 justify-end">
          <Link href="/admin/classes">
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? '생성 중...' : '수업 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
