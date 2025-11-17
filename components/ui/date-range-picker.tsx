'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (date: string) => void
  onEndChange: (date: string) => void
  startLabel?: string
  endLabel?: string
  required?: boolean
  disabled?: boolean
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startLabel = '시작일',
  endLabel = '종료일',
  required = false,
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="startDate">
          {startLabel} {required && '*'}
        </Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="cursor-pointer"
          onClick={(e) => e.currentTarget.showPicker?.()}
          required={required}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">
          {endLabel} {required && '*'}
        </Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="cursor-pointer"
          onClick={(e) => e.currentTarget.showPicker?.()}
          required={required}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
