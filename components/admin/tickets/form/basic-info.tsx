import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TicketFormData, ClassType } from './types'

interface BasicInfoProps {
  formData: TicketFormData
  setFormData: (data: TicketFormData) => void
  classTypes: ClassType[]
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
]

export function BasicInfo({ formData, setFormData, classTypes }: BasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* 01. 수업 종류 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">01. 수업 종류</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.classId}
            onValueChange={(value) =>
              setFormData({ ...formData, classId: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="수업 종류를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {classTypes.map((classType) => (
                <SelectItem key={classType.id} value={classType.id}>
                  {classType.name} ({classType.type === 'group' ? '그룹' : '프라이빗'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 02. 수강권 종류 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">02. 수강권 종류</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.ticketType}
            onValueChange={(value: 'count_based' | 'period_based') =>
              setFormData({ ...formData, ticketType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count_based">회수제 (횟수 기반)</SelectItem>
              <SelectItem value="period_based">기간제 (기간 기반)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 03. 수강권 명칭 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">03. 수강권 명칭</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="예: 캐니크로스 10회권"
            required
          />
        </CardContent>
      </Card>

      {/* 04. 수강권 색상 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">04. 수강권 색상 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setFormData({ ...formData, color: presetColor })}
                className={`w-7 h-7 rounded border-2 transition-all ${
                  formData.color === presetColor
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: presetColor }}
                title={presetColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
