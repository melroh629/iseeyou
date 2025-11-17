'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SpecificDate } from '@/lib/types/schedule'
import { AdvancedScheduleMode } from '@/components/admin/schedule/advanced-schedule-mode'
import { SimpleScheduleMode } from '@/components/admin/schedule/simple-schedule-mode'

interface ScheduleManagementTabProps {
  classType: {
    id: string
    name: string
    type: string | null
    default_max_students: number
  }
}

export function ScheduleManagementTab({ classType }: ScheduleManagementTabProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

  // 간단 모드 상태 (스튜디오메이트 스타일)
  const [simpleStartDate, setSimpleStartDate] = useState('')
  const [simpleEndDate, setSimpleEndDate] = useState('')
  const [weeklySchedule, setWeeklySchedule] = useState<{
    [key: string]: Array<{ start_time: string; end_time: string }>
  }>({})

  // 고급 모드 상태
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([])

  // 공통 상태
  const [maxStudents, setMaxStudents] = useState(classType.default_max_students || 6)
  const [notes, setNotes] = useState('')

  const type = classType.type || 'group'

  // 기존 일정 조회
  const [existingSchedules, setExistingSchedules] = useState<any[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [classType.id])

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/admin/schedules?classId=${classType.id}`)
      const data = await response.json()
      setExistingSchedules(data.schedules || [])
    } catch (error) {
      console.error('일정 조회 실패:', error)
    } finally {
      setLoadingSchedules(false)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: scheduleId }),
      })

      if (!response.ok) {
        throw new Error('일정 삭제에 실패했습니다.')
      }

      alert('일정이 삭제되었습니다.')
      fetchSchedules()
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'simple') {
        // 간단 모드: 요일 기반 반복 일정 생성
        if (!simpleStartDate || !simpleEndDate) {
          alert('수업 기간을 입력해주세요.')
          setLoading(false)
          return
        }

        if (Object.keys(weeklySchedule).length === 0) {
          alert('최소 하나의 요일과 시간을 설정해주세요.')
          setLoading(false)
          return
        }

        const response = await fetch('/api/admin/recurring-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classType.id,
            startDate: simpleStartDate,
            endDate: simpleEndDate,
            weeklyPattern: weeklySchedule,
            type: type,
            maxStudents: type === 'group' ? maxStudents : null,
            notes: notes || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '일정 추가에 실패했습니다.')
        }

        alert(`${data.summary.totalClasses}개의 일정이 추가되었습니다.`)
      } else {
        // 고급 모드: 다중 일정 생성
        if (specificDates.length === 0) {
          alert('최소 하나의 일정을 선택해주세요.')
          return
        }

        const response = await fetch('/api/admin/recurring-schedules/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classType.id,
            specificDates,
            type: type,
            maxStudents: type === 'group' ? maxStudents : null,
            notes: notes || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '일정 추가에 실패했습니다.')
        }

        alert(`${data.summary.totalClasses}개의 일정이 추가되었습니다.`)
      }

      // 폼 초기화
      setSimpleStartDate('')
      setSimpleEndDate('')
      setWeeklySchedule({})
      setStartDate('')
      setEndDate('')
      setSpecificDates([])
      setNotes('')

      // 일정 목록 새로고침
      fetchSchedules()
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 등록된 일정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSchedules ? (
            <p className="text-sm text-muted-foreground text-center py-4">로딩 중...</p>
          ) : existingSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              등록된 일정이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {existingSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{schedule.date}</span>
                    <span className="text-sm text-muted-foreground">
                      {schedule.start_time.substring(0, 5)} ~ {schedule.end_time.substring(0, 5)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      schedule.type === 'group'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {schedule.type === 'group' ? '그룹' : '프라이빗'}
                    </span>
                    {schedule.type === 'group' && schedule.max_students && (
                      <span className="text-xs text-muted-foreground">
                        최대 {schedule.max_students}명
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 새 일정 추가 */}
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* 모드 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>일정 추가 방식</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'advanced')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">간단 모드</TabsTrigger>
              <TabsTrigger value="advanced">고급 모드</TabsTrigger>
            </TabsList>

            {/* 간단 모드 */}
            <TabsContent value="simple" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                요일별 반복 일정을 설정합니다.
              </p>

              <SimpleScheduleMode
                startDate={simpleStartDate}
                endDate={simpleEndDate}
                onStartDateChange={setSimpleStartDate}
                onEndDateChange={setSimpleEndDate}
                weeklySchedule={weeklySchedule}
                onWeeklyScheduleChange={setWeeklySchedule}
              />
            </TabsContent>

            {/* 고급 모드 */}
            <TabsContent value="advanced" className="space-y-6 mt-4">
              <p className="text-sm text-muted-foreground">
                여러 날짜와 시간대의 일정을 한 번에 추가합니다.
              </p>

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
                    required={mode === 'advanced'}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>02. 날짜 및 시간 선택</CardTitle>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 수업 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>수업 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? '추가 중...' : '일정 추가'}
        </Button>
      </div>
      </form>
    </div>
  )
}
