'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { SpecificDate } from '@/lib/types/schedule'
import { AdvancedScheduleMode } from '@/components/admin/schedule/advanced-schedule-mode'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'

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

  // 간단 모드 상태
  const [simpleDate, setSimpleDate] = useState<Date>()
  const [simpleStartTime, setSimpleStartTime] = useState('')
  const [simpleEndTime, setSimpleEndTime] = useState('')

  // 고급 모드 상태
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([])

  // 공통 상태
  const [maxStudents, setMaxStudents] = useState(classType.default_max_students || 6)
  const [notes, setNotes] = useState('')

  const type = classType.type || 'group'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'simple') {
        // 간단 모드: 단일 일정 생성
        if (!simpleDate || !simpleStartTime || !simpleEndTime) {
          alert('날짜와 시간을 모두 입력해주세요.')
          setLoading(false)
          return
        }

        const response = await fetch('/api/admin/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classType.id,
            date: format(simpleDate, 'yyyy-MM-dd'),
            startTime: simpleStartTime,
            endTime: simpleEndTime,
            type: type,
            maxStudents: type === 'group' ? maxStudents : null,
            notes: notes || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '일정 추가에 실패했습니다.')
        }

        alert('일정이 추가되었습니다.')
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
      setSimpleDate(undefined)
      setSimpleStartTime('')
      setSimpleEndTime('')
      setStartDate('')
      setEndDate('')
      setSpecificDates([])
      setNotes('')

      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
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
                하나의 일정을 빠르게 추가합니다.
              </p>

              <div className="space-y-2">
                <Label>날짜 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !simpleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {simpleDate ? format(simpleDate, "PPP", { locale: ko }) : "날짜를 선택하세요"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={simpleDate}
                      onSelect={setSimpleDate}
                      locale={ko}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="simpleStartTime">시작 시간 *</Label>
                  <Input
                    id="simpleStartTime"
                    type="time"
                    value={simpleStartTime}
                    onChange={(e) => setSimpleStartTime(e.target.value)}
                    required={mode === 'simple'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simpleEndTime">종료 시간 *</Label>
                  <Input
                    id="simpleEndTime"
                    type="time"
                    value={simpleEndTime}
                    onChange={(e) => setSimpleEndTime(e.target.value)}
                    required={mode === 'simple'}
                  />
                </div>
              </div>
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
  )
}
