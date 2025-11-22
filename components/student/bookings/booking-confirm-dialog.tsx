import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Schedule } from './types'

interface BookingConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  schedule: Schedule | null
  onConfirm: () => void
}

export function BookingConfirmDialog({
  isOpen,
  onOpenChange,
  schedule,
  onConfirm,
}: BookingConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>수업을 예약하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            {schedule && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{schedule.classes.name}</span>
                </div>
                <div className="text-sm">
                  {new Date(schedule.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </div>
                <div className="text-sm">
                  {schedule.start_time.slice(0, 5)} ~ {schedule.end_time.slice(0, 5)}
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>예약하기</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
