import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { TicketFormData } from './types'

interface PriceSettingsProps {
  formData: TicketFormData
  setFormData: (data: TicketFormData) => void
}

export function PriceSettings({ formData, setFormData }: PriceSettingsProps) {
  return (
    <div className="space-y-6">
      {/* 08. 수강권 판매금액 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">08. 수강권 판매금액 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>판매 금액 (원)</Label>
            <Input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseInt(e.target.value) })
              }
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* 09. 주간/월간 이용 횟수 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">09. 주간/월간 이용 횟수 설정</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>주간 이용 제한</Label>
            <Input
              type="number"
              min="0"
              value={formData.weeklyLimit}
              onChange={(e) =>
                setFormData({ ...formData, weeklyLimit: parseInt(e.target.value) })
              }
              placeholder="0 (무제한)"
            />
            <p className="text-sm text-muted-foreground">
              0 입력 시 제한 없음
            </p>
          </div>
          <div className="space-y-2">
            <Label>월간 이용 제한</Label>
            <Input
              type="number"
              min="0"
              value={formData.monthlyLimit}
              onChange={(e) =>
                setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) })
              }
              placeholder="0 (무제한)"
            />
            <p className="text-sm text-muted-foreground">
              0 입력 시 제한 없음
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 10. 주간/월간 이용 횟수 자동 차감 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">10. 주간/월간 이용 횟수 자동 차감</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="autoDeductWeekly"
              checked={formData.autoDeductWeekly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, autoDeductWeekly: checked as boolean })
              }
            />
            <label htmlFor="autoDeductWeekly" className="cursor-pointer">
              <div className="font-medium">주간 이용 횟수 자동 차감</div>
              <div className="text-sm text-muted-foreground">
                매주 자동으로 이용 가능 횟수가 리셋됩니다
              </div>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="autoDeductMonthly"
              checked={formData.autoDeductMonthly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, autoDeductMonthly: checked as boolean })
              }
            />
            <label htmlFor="autoDeductMonthly" className="cursor-pointer">
              <div className="font-medium">월간 이용 횟수 자동 차감</div>
              <div className="text-sm text-muted-foreground">
                매월 자동으로 이용 가능 횟수가 리셋됩니다
              </div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
