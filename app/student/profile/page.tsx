'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Dog, Phone, Calendar, Camera, Edit2, Check, X, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

interface Profile {
  id: string
  dog_name: string | null
  notes: string | null
  created_at: string
  users: {
    id: string
    name: string
    phone: string
  }
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [dogPhoto, setDogPhoto] = useState<string>('')

  // 편집 폼 데이터
  const [editForm, setEditForm] = useState({
    dogName: '',
    notes: '',
  })

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/student/profile')
      const data = await res.json()

      if (data.profile) {
        setProfile(data.profile)
        setEditForm({
          dogName: data.profile.dog_name || '',
          notes: data.profile.notes || '',
        })
      }
    } catch (error) {
      console.error('프로필 조회 실패:', error)
      toast({
        variant: 'destructive',
        title: '프로필 조회 실패',
        description: '프로필 정보를 불러올 수 없습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogName: editForm.dogName,
          notes: editForm.notes,
          dogPhoto: dogPhoto,
        }),
      })

      if (!res.ok) {
        throw new Error('프로필 업데이트 실패')
      }

      toast({
        title: '저장 완료',
        description: '프로필이 성공적으로 업데이트되었습니다.',
      })

      setEditing(false)
      fetchProfile()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '저장 실패',
        description: '프로필 업데이트에 실패했습니다.',
      })
    }
  }

  const handleCancel = () => {
    setEditForm({
      dogName: profile?.dog_name || '',
      notes: profile?.notes || '',
    })
    setEditing(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Supabase Storage에 업로드
      const reader = new FileReader()
      reader.onloadend = () => {
        setDogPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePassword = async () => {
    // 비밀번호 확인
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: 'destructive',
        title: '비밀번호 불일치',
        description: '새 비밀번호가 일치하지 않습니다.',
      })
      return
    }

    setChangingPassword(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '비밀번호 변경에 실패했습니다.')
      }

      toast({
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다.',
      })

      // 폼 초기화
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '비밀번호 변경 실패',
        description: error.message,
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">프로필 정보를 찾을 수 없습니다</div>
      </div>
    )
  }

  const dogName = profile.dog_name || '반려견'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">마이페이지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          반려견 정보를 관리하세요
        </p>
      </div>

      {/* 반려견 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Dog className="h-5 w-5" />
              반려견 정보
            </CardTitle>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                수정
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 강아지 사진 */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={dogPhoto || undefined} alt={dogName} />
              <AvatarFallback className="text-4xl">
                {dogName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {editing && (
              <div>
                <label htmlFor="dog-photo" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      사진 변경
                    </span>
                  </Button>
                </label>
                <input
                  id="dog-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}
          </div>

          {/* 강아지 이름 */}
          <div className="space-y-2">
            <Label htmlFor="dogName">강아지 이름</Label>
            {editing ? (
              <Input
                id="dogName"
                value={editForm.dogName}
                onChange={(e) =>
                  setEditForm({ ...editForm, dogName: e.target.value })
                }
                placeholder="강아지 이름을 입력하세요"
              />
            ) : (
              <p className="font-medium">{profile.dog_name || '미등록'}</p>
            )}
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            {editing ? (
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="강아지에 대한 특이사항이나 메모를 입력하세요"
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.notes || '메모가 없습니다'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="현재 비밀번호를 입력하세요"
              disabled={changingPassword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="8자 이상, 영문+숫자 포함"
              disabled={changingPassword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="새 비밀번호를 다시 입력하세요"
              disabled={changingPassword}
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={
              changingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
            className="w-full"
          >
            {changingPassword ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
