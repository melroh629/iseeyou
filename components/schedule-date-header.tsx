import { Calendar } from 'lucide-react'

interface ScheduleDateHeaderProps {
  date: string
}

export function ScheduleDateHeader({ date }: ScheduleDateHeaderProps) {
  const dateObj = new Date(date)

  return (
    <div className="pb-3 mb-2">
      <div className="flex items-center gap-2 pt-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-base font-medium text-muted-foreground">
          {dateObj.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </h3>
      </div>
    </div>
  )
}
