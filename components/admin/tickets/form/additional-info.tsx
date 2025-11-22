import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TicketFormData } from './types'

interface AdditionalInfoProps {
  formData: TicketFormData
  setFormData: (data: TicketFormData) => void
}

export function AdditionalInfo({ formData, setFormData }: AdditionalInfoProps) {
  return (
    <div className="space-y-6">
      {/* 11. 수업 구분 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">11. 수업 구분</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.classCategory}
            onChange={(e) =>
              setFormData({ ...formData, classCategory: e.target.value })
            }
            placeholder="예: 초급, 중급, 고급"
          />
          <p className="text-sm text-muted-foreground mt-2">
            수업의 난이도나 카테고리를 입력하세요
          </p>
        </CardContent>
      </Card>

      {/* 12. 안내 메세지 문구 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">12. 안내 메세지 문구</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.noticeMessage}
            onChange={(e) =>
              setFormData({ ...formData, noticeMessage: e.target.value })
            }
            placeholder="수강생에게 전달할 안내 메세지를 입력하세요"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* 13. 예약 가능한 시간 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">13. 예약 가능한 시간 설정</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>예약 시작 가능 시간</Label>
            <Select
              value={formData.bookingStartHoursBefore.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, bookingStartHoursBefore: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="168">7일 전부터</SelectItem>
                <SelectItem value="336">14일 전부터</SelectItem>
                <SelectItem value="720">30일 전부터</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>예약 마감 시간</Label>
            <Select
              value={formData.bookingEndHoursBefore.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, bookingEndHoursBefore: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1시간 전까지</SelectItem>
                <SelectItem value="2">2시간 전까지</SelectItem>
                <SelectItem value="6">6시간 전까지</SelectItem>
                <SelectItem value="24">24시간 전까지</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
