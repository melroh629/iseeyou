import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BookingCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  datesWithSchedules: Date[]
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  datesWithSchedules,
}: BookingCalendarProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setMonth(newDate.getMonth() - 1)
                onSelectDate(newDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold">
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setMonth(newDate.getMonth() + 1)
                onSelectDate(newDate)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onSelectDate(date)}
            modifiers={{
              hasSchedule: datesWithSchedules,
            }}
            modifiersClassNames={{
              hasSchedule:
                'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
            }}
            className="rounded-md border"
          />
        </div>
      </CardContent>
    </Card>
  )
}
