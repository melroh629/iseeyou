'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TimeSlotInputProps {
  startTime: string
  endTime: string
  onStartChange: (time: string) => void
  onEndChange: (time: string) => void
  onRemove?: () => void
  required?: boolean
  disabled?: boolean
  showRemove?: boolean
  showQuickDuration?: boolean
  quickDurations?: number[]
}

// 시작 시간에 분 추가하여 종료 시간 계산
function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return ''

  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

export function TimeSlotInput({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  onRemove,
  required = false,
  disabled = false,
  showRemove = true,
  showQuickDuration = true,
  quickDurations = [30, 50, 60],
}: TimeSlotInputProps) {
  const handleQuickDuration = (minutes: number) => {
    if (!startTime) return
    const newEndTime = calculateEndTime(startTime, minutes)
    onEndChange(newEndTime)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <Input
          type="time"
          value={startTime}
          onChange={(e) => onStartChange(e.target.value)}
          className="flex-1 min-w-[120px] sm:w-36"
          required={required}
          disabled={disabled}
        />
        <span className="text-muted-foreground">~</span>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => onEndChange(e.target.value)}
          className="flex-1 min-w-[120px] sm:w-36"
          required={required}
          disabled={disabled}
        />
        {showRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showQuickDuration && startTime && (
        <div className="flex gap-2">
          {quickDurations.map((duration) => (
            <Button
              key={duration}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDuration(duration)}
              disabled={disabled}
              className="text-xs"
            >
              {duration}분
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
