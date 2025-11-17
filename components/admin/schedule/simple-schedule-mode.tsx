'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus } from 'lucide-react'
import { addOneHour } from '@/lib/utils/time-slot'

interface TimeSlot {
  start_time: string
  end_time: string
}

interface DaySchedule {
  [key: string]: TimeSlot[]
}

interface SimpleScheduleModeProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  weeklySchedule: DaySchedule
  onWeeklyScheduleChange: (schedule: DaySchedule) => void
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

export function SimpleScheduleMode({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  weeklySchedule,
  onWeeklyScheduleChange,
}: SimpleScheduleModeProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      // 요일 비활성화
      setSelectedDays(selectedDays.filter(d => d !== dayKey))
      const newSchedule = { ...weeklySchedule }
      delete newSchedule[dayKey]
      onWeeklyScheduleChange(newSchedule)
    } else {
      // 요일 활성화 - 기본 시간 슬롯 추가
      setSelectedDays([...selectedDays, dayKey])
      onWeeklyScheduleChange({
        ...weeklySchedule,
        [dayKey]: [{ start_time: '09:00', end_time: '10:00' }]
      })
    }
  }

  const addTimeSlot = (dayKey: string) => {
    const currentSlots = weeklySchedule[dayKey] || []
    onWeeklyScheduleChange({
      ...weeklySchedule,
      [dayKey]: [...currentSlots, { start_time: '09:00', end_time: '10:00' }]
    })
  }

  const removeTimeSlot = (dayKey: string, index: number) => {
    const currentSlots = weeklySchedule[dayKey] || []
    const newSlots = currentSlots.filter((_, i) => i !== index)

    if (newSlots.length === 0) {
      // 마지막 시간대 삭제 시 요일도 비활성화
      setSelectedDays(selectedDays.filter(d => d !== dayKey))
      const newSchedule = { ...weeklySchedule }
      delete newSchedule[dayKey]
      onWeeklyScheduleChange(newSchedule)
    } else {
      onWeeklyScheduleChange({
        ...weeklySchedule,
        [dayKey]: newSlots
      })
    }
  }

  const updateTimeSlot = (dayKey: string, index: number, field: 'start_time' | 'end_time', value: string) => {
    const currentSlots = weeklySchedule[dayKey] || []
    const newSlots = currentSlots.map((slot, i) => {
      if (i === index) {
        let updatedSlot = { ...slot, [field]: value }

        // 시작 시간 변경 시 자동으로 종료 시간 +1시간 설정
        if (field === 'start_time' && value) {
          updatedSlot.end_time = addOneHour(value)
        }

        // 시작 시간 >= 종료 시간 체크
        if (updatedSlot.start_time && updatedSlot.end_time && updatedSlot.start_time >= updatedSlot.end_time) {
          alert('종료 시간은 시작 시간보다 늦어야 합니다.')
          return slot // 변경 취소
        }

        return updatedSlot
      }
      return slot
    })
    onWeeklyScheduleChange({
      ...weeklySchedule,
      [dayKey]: newSlots
    })
  }

  return (
    <div className="space-y-6">
      {/* 수업 기간 */}
      <div>
        <Label className="text-base font-semibold mb-3 block">수업 기간</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
            className="w-full"
          />
          <span className="text-muted-foreground text-center">~</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            required
            className="w-full"
          />
        </div>
      </div>

      {/* 요일 선택 */}
      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS.map((day) => (
            <Button
              key={day.key}
              type="button"
              variant={selectedDays.includes(day.key) ? 'default' : 'outline'}
              className="w-12 h-12 rounded-full p-0"
              onClick={() => toggleDay(day.key)}
            >
              {day.label}
            </Button>
          ))}
        </div>

        {/* 선택된 요일별 시간 설정 */}
        <div className="space-y-6">
          {selectedDays.map((dayKey) => {
            const day = DAYS.find(d => d.key === dayKey)
            const timeSlots = weeklySchedule[dayKey] || []

            return (
              <div key={dayKey} className="space-y-3">
                <Label className="text-sm font-medium">{day?.label}요일</Label>

                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-2 sm:flex-1">
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateTimeSlot(dayKey, index, 'start_time', e.target.value)}
                        required
                        className="w-full"
                      />
                      <span className="text-muted-foreground text-center">~</span>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateTimeSlot(dayKey, index, 'end_time', e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>

                    {/* 50분, 삭제 버튼 */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        50분
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(dayKey, index)}
                        className="w-full sm:w-auto"
                        aria-label="시간 삭제"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* 수업시간 추가 버튼 */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(dayKey)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  수업시간 추가
                </Button>
              </div>
            )
          })}
        </div>

        {selectedDays.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            요일을 선택하여 수업 시간을 설정하세요
          </p>
        )}
      </div>
    </div>
  )
}
