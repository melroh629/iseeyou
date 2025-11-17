'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditClassTypeFormProps {
  classType: {
    id: string
    name: string
    description: string | null
    color: string | null
    type: string | null
    default_max_students: number
    default_cancel_hours: number
  }
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
]

export function EditClassTypeForm({ classType }: EditClassTypeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 수업 기본 정보
  const [name, setName] = useState(classType.name)
  const [description, setDescription] = useState(classType.description || '')
  const [color, setColor] = useState(classType.color || '#3b82f6')
  const [type, setType] = useState<'group' | 'private'>(
    (classType.type as 'group' | 'private') || 'group'
  )
  const [maxStudents, setMaxStudents] = useState(classType.default_max_students || 10)
  const [defaultCancelHours, setDefaultCancelHours] = useState(classType.default_cancel_hours)

  // 일정 정보 (기존 일정은 표시만, 수정은 별도)
  const [existingSchedules, setExistingSchedules] = useState<any[]>([])

  useEffect(() => {
    // 기존 일정 조회
    fetch(`/api/admin/class-types/${classType.id}/schedules`)
      .then((res) => res.json())
      .then((data) => setExistingSchedules(data.schedules || []))
      .catch((err) => console.error('일정 조회 실패:', err))
  }, [classType.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/class-types/${classType.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          color,
          type,
          defaultCancelHours,
          defaultMaxStudents: maxStudents,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '수업 수정에 실패했습니다.')
      }

      alert('수업이 수정되었습니다.')
      router.push(`/admin/classes/${classType.id}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/classes/${classType.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">수업 수정</h1>
          <p className="text-muted-foreground mt-1">
            수업 기본 정보를 수정합니다.
          </p>
        </div>
      </div>

      {/* 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 수업 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name">수업 이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 캐니크로스, 오비디언스"
                required
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="수업에 대한 간단한 설명"
                rows={3}
              />
            </div>

            {/* 색상 */}
            <div className="space-y-2">
              <Label>색상</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      color === presetColor
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>

            {/* 수업 형태 */}
            <div className="space-y-2">
              <Label htmlFor="type">수업 형태 *</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="수업 형태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">그룹 수업</SelectItem>
                  <SelectItem value="private">프라이빗 수업</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 최대 인원 (그룹 수업일 때만) */}
            {type === 'group' && (
              <div className="space-y-2">
                <Label htmlFor="maxStudents">최대 인원 *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(parseInt(e.target.value))}
                  required
                />
              </div>
            )}

            {/* 예약 취소 기한 */}
            <div className="space-y-2">
              <Label htmlFor="defaultCancelHours">예약 취소 기한 (시간) *</Label>
              <Input
                id="defaultCancelHours"
                type="number"
                min="0"
                value={defaultCancelHours}
                onChange={(e) => setDefaultCancelHours(parseInt(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground">
                수업 시작 몇 시간 전까지 취소 가능한지 설정합니다.
              </p>
            </div>

            {/* 기존 일정 정보 */}
            {existingSchedules.length > 0 && (
              <div className="space-y-2">
                <Label>현재 등록된 일정</Label>
                <div className="text-sm text-muted-foreground">
                  총 {existingSchedules.length}개의 일정이 등록되어 있습니다.
                  <br />
                  일정 수정은 상세 페이지에서 개별적으로 할 수 있습니다.
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 justify-end">
              <Link href={`/admin/classes/${classType.id}`}>
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
