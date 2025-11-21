'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import {
  ScheduleMode,
  ClassType,
  WeeklyPattern,
  SpecificDate,
  COLORS,
} from '@/lib/types/schedule'
import { BasicScheduleMode } from '@/components/admin/schedule/basic-schedule-mode'
import { AdvancedScheduleMode } from '@/components/admin/schedule/advanced-schedule-mode'
import { ClassInfoSection } from '@/components/admin/schedule/class-info-section'

export default function NewClassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 수업 기본 정보
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [type, setType] = useState<ClassType>('group')
  const [maxStudents, setMaxStudents] = useState(10)

  // 수업 일정 정보
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 일정 모드: basic (매주 반복) vs advanced (날짜별 선택)
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('basic')

  // 기본 모드: 반복 패턴
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [weeklyPattern, setWeeklyPattern] = useState<WeeklyPattern>({})

  // 고급 모드: 특정 날짜 선택
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([])

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
        templateResponse = await fetch('/api/admin/recurring-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classTypeData.classType.id,
            startDate,
            endDate,
            weeklyPattern,
            type,
            maxStudents: type === 'group' ? maxStudents : null,
          }),
        })
      } else {
        // 고급 모드: 특정 날짜
        templateResponse = await fetch('/api/admin/recurring-schedules/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classTypeData.classType.id,
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
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        {/* 1. 수업 기본 정보 & 3. 수업 형태 */}
        <ClassInfoSection
          name={name}
          description={description}
          color={color}
          type={type}
          maxStudents={maxStudents}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onColorChange={setColor}
          onTypeChange={setType}
          onMaxStudentsChange={setMaxStudents}
        />

        {/* 2. 수업 기간 */}
        <Card>
          <CardHeader>
            <CardTitle>02. 수업 기간</CardTitle>
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

        {/* 4. 일정 설정 모드 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>04. 일정 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 모드 선택 */}
            <div className="flex flex-col gap-2 sm:flex-row">
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
              <BasicScheduleMode
                selectedDays={selectedDays}
                weeklyPattern={weeklyPattern}
                onSelectedDaysChange={setSelectedDays}
                onWeeklyPatternChange={setWeeklyPattern}
              />
            )}

            {/* 고급 모드 - 캘린더 */}
            {scheduleMode === 'advanced' && (
              <AdvancedScheduleMode
                startDate={startDate}
                endDate={endDate}
                specificDates={specificDates}
                onSpecificDatesChange={setSpecificDates}
              />
            )}
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link href="/admin/classes">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? '생성 중...' : '수업 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
