import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TicketFormData } from './types'

interface UsageSettingsProps {
  formData: TicketFormData
  setFormData: (data: TicketFormData) => void
}

export function UsageSettings({ formData, setFormData }: UsageSettingsProps) {
  return (
    <div className="space-y-6">
      {/* 05. 이용횟수 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">05. 이용횟수 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>총 이용횟수 *</Label>
            <Input
              type="number"
              min="1"
              value={formData.totalCount}
              onChange={(e) =>
                setFormData({ ...formData, totalCount: parseInt(e.target.value) })
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              수강생이 사용할 수 있는 총 횟수를 입력하세요
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 06. 수강권 사용기간 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">06. 수강권 사용기간 설정</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>시작일 *</Label>
            <Input
              type="date"
              value={formData.validFrom}
              onChange={(e) =>
                setFormData({ ...formData, validFrom: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>종료일 *</Label>
            <Input
              type="date"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* 07. 수강인원 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">07. 수강인원 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>수업당 최대 인원</Label>
            <Input
              type="number"
              min="1"
              value={formData.maxStudentsPerClass}
              onChange={(e) =>
                setFormData({ ...formData, maxStudentsPerClass: parseInt(e.target.value) })
              }
            />
            <p className="text-sm text-muted-foreground">
              1회 수업에 참여 가능한 최대 인원 수
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
