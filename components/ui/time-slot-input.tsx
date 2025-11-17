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
}: TimeSlotInputProps) {
  return (
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
  )
}
