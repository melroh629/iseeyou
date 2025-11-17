'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TimeSlotInput } from '@/components/ui/time-slot-input'
import { Plus, Copy } from 'lucide-react'
import { DAYS, WeeklyPattern } from '@/lib/types/schedule'
import {
  addWeeklyPatternTime,
  removeWeeklyPatternTime,
  updateWeeklyPatternTime,
} from '@/lib/utils/time-slot'

interface BasicScheduleModeProps {
  selectedDays: string[]
  weeklyPattern: WeeklyPattern
  onSelectedDaysChange: (days: string[]) => void
  onWeeklyPatternChange: (pattern: WeeklyPattern) => void
}

export function BasicScheduleMode({
  selectedDays,
  weeklyPattern,
  onSelectedDaysChange,
  onWeeklyPatternChange,
}: BasicScheduleModeProps) {
  // 요일 선택/해제
  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      onSelectedDaysChange(selectedDays.filter((d) => d !== dayKey))
      const newPattern = { ...weeklyPattern }
      delete newPattern[dayKey]
      onWeeklyPatternChange(newPattern)
    } else {
      onSelectedDaysChange([...selectedDays, dayKey])
      onWeeklyPatternChange({
        ...weeklyPattern,
        [dayKey]: [{ start_time: '09:00', end_time: '10:00' }],
      })
    }
  }

  // 시간대 추가
  const addTime = (dayKey: string) => {
    const newPattern = addWeeklyPatternTime(weeklyPattern, dayKey)
    onWeeklyPatternChange(newPattern)
  }

  // 시간대 삭제
  const removeTime = (dayKey: string, index: number) => {
    const { pattern, shouldRemoveDay } = removeWeeklyPatternTime(
      weeklyPattern,
      dayKey,
      index
    )
    onWeeklyPatternChange(pattern)
    if (shouldRemoveDay) {
      onSelectedDaysChange(selectedDays.filter((d) => d !== dayKey))
    }
  }

  // 시간 변경
  const updateTime = (
    dayKey: string,
    index: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    const newPattern = updateWeeklyPatternTime(
      weeklyPattern,
      dayKey,
      index,
      field,
      value
    )
    onWeeklyPatternChange(newPattern)
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

    onWeeklyPatternChange(newPattern)
  }

  return (
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
                    onClick={() => addTime(dayKey)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    시간 추가
                  </Button>
                </div>

                {slots.map((slot, index) => (
                  <div key={index} className="ml-4">
                    <TimeSlotInput
                      startTime={slot.start_time}
                      endTime={slot.end_time}
                      onStartChange={(value) => updateTime(dayKey, index, 'start_time', value)}
                      onEndChange={(value) => updateTime(dayKey, index, 'end_time', value)}
                      onRemove={() => removeTime(dayKey, index)}
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
