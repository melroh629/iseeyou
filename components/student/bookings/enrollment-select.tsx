import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Enrollment } from './types'

interface EnrollmentSelectProps {
  enrollments: Enrollment[]
  selectedEnrollment: string
  onSelect: (value: string) => void
}

export function EnrollmentSelect({
  enrollments,
  selectedEnrollment,
  onSelect,
}: EnrollmentSelectProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">수강권 선택</label>
          <Select value={selectedEnrollment} onValueChange={onSelect}>
            <SelectTrigger>
              <SelectValue placeholder="수강권을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.map((enrollment) => (
                <SelectItem key={enrollment.id} value={enrollment.id}>
                  {enrollment.classes.name} ({enrollment.total_count - enrollment.used_count}/
                  {enrollment.total_count}회 남음)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEnrollment && (
            <p className="text-xs text-muted-foreground">
              선택한 수강권으로 예약 가능한 수업만 표시됩니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
