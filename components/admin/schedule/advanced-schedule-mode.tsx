'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { TimeSlotInput } from '@/components/ui/time-slot-input'
import { Plus } from 'lucide-react'
import { SpecificDate } from '@/lib/types/schedule'
import {
  toggleDate,
  addTimeToDate,
  removeTimeFromDate,
  updateTimeForDate,
} from '@/lib/utils/time-slot'

interface AdvancedScheduleModeProps {
  startDate: string
  endDate: string
  specificDates: SpecificDate[]
  onSpecificDatesChange: (dates: SpecificDate[]) => void
}

export function AdvancedScheduleMode({
  startDate,
  endDate,
  specificDates,
  onSpecificDatesChange,
}: AdvancedScheduleModeProps) {
  const handleToggleDate = (dateStr: string) => {
    const newDates = toggleDate(specificDates, dateStr)
    onSpecificDatesChange(newDates)
  }

  const handleAddTime = (dateStr: string) => {
    const newDates = addTimeToDate(specificDates, dateStr)
    onSpecificDatesChange(newDates)
  }

  const handleRemoveTime = (dateStr: string, timeIndex: number) => {
    const newDates = removeTimeFromDate(specificDates, dateStr, timeIndex)
    onSpecificDatesChange(newDates)
  }

  const handleUpdateTime = (
    dateStr: string,
    timeIndex: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    const newDates = updateTimeForDate(
      specificDates,
      dateStr,
      timeIndex,
      field,
      value
    )
    onSpecificDatesChange(newDates)
  }

  if (!startDate || !endDate) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        먼저 수업 기간을 설정해주세요
      </p>
    )
  }

  // 유효성 검사: 종료일이 시작일보다 빠른지 확인
  if (new Date(endDate) < new Date(startDate)) {
    return (
      <p className="text-sm text-destructive text-center py-8">
        종료일은 시작일보다 늦어야 합니다
      </p>
    )
  }

  // 선택된 날짜들을 Date 객체 배열로 변환
  const selectedDates = specificDates.map((d) => new Date(d.date))

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        날짜를 클릭하여 수업을 추가하세요 (선택: {specificDates.length}개)
      </div>

      {/* Calendar 컴포넌트 사용 */}
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={(dates) => {
          if (!dates) return
          // 새로 선택된 날짜들
          const newDateStrs = dates.map((d) => d.toISOString().split('T')[0])
          const currentDateStrs = specificDates.map((d) => d.date)

          // 추가된 날짜 찾기
          const added = newDateStrs.find((d) => !currentDateStrs.includes(d))
          // 제거된 날짜 찾기
          const removed = currentDateStrs.find((d) => !newDateStrs.includes(d))

          if (added) {
            handleToggleDate(added)
          } else if (removed) {
            handleToggleDate(removed)
          }
        }}
        disabled={{ before: new Date(startDate), after: new Date(endDate) }}
        className="rounded-md border"
      />

      {/* 선택된 날짜별 시간 설정 */}
      {specificDates.length > 0 && (
        <div className="space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
          {specificDates
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((dateObj) => {
              const date = new Date(dateObj.date)
              return (
                <div key={dateObj.date} className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                      onClick={() => handleAddTime(dateObj.date)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      시간 추가
                    </Button>
                  </div>

                  {dateObj.times.map((time, index) => (
                    <div key={index} className="ml-4">
                      <TimeSlotInput
                        startTime={time.start_time}
                        endTime={time.end_time}
                        onStartChange={(value) =>
                          handleUpdateTime(dateObj.date, index, 'start_time', value)
                        }
                        onEndChange={(value) =>
                          handleUpdateTime(dateObj.date, index, 'end_time', value)
                        }
                        onRemove={() => handleRemoveTime(dateObj.date, index)}
                        required
                      />
                    </div>
                  ))}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
