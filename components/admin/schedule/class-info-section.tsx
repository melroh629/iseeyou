'use client'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COLORS, ClassType } from '@/lib/types/schedule'

interface ClassInfoSectionProps {
  name: string
  description: string
  color: string
  type: ClassType
  maxStudents: number
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
  onColorChange: (color: string) => void
  onTypeChange: (type: ClassType) => void
  onMaxStudentsChange: (maxStudents: number) => void
}

export function ClassInfoSection({
  name,
  description,
  color,
  type,
  maxStudents,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  onTypeChange,
  onMaxStudentsChange,
}: ClassInfoSectionProps) {
  return (
    <>
      {/* 01. 수업 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>01. 수업 기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">수업 이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="예: 프라이빗 레슨"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">수업 설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="수업에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>수업 색상</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => onColorChange(c)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 03. 수업 형태 */}
      <Card>
        <CardHeader>
          <CardTitle>03. 수업 형태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">수업 타입 *</Label>
              <Select value={type} onValueChange={(v: ClassType) => onTypeChange(v)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">그룹 수업</SelectItem>
                  <SelectItem value="private">프라이빗 수업</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'group' && (
              <div className="space-y-2">
                <Label htmlFor="maxStudents">최대 인원 *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={maxStudents}
                  onChange={(e) => onMaxStudentsChange(parseInt(e.target.value))}
                  required
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
