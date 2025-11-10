import { createClient } from '@/lib/supabase/server'
import type { ClassTypeRow } from '@/types/database'

export default async function TestPage() {
  const supabase = await createClient()

  // class_types 데이터 조회
  const { data: classTypes, error } = await supabase
    .from('class_types')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supabase 연동 테스트</h1>
          <p className="text-muted-foreground mt-2">
            class_types 테이블 데이터 조회
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>에러 발생:</strong> {error.message}
          </div>
        )}

        {!error && classTypes && classTypes.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            class_types 테이블에 데이터가 없습니다.
          </div>
        )}

        {!error && classTypes && classTypes.length > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <strong>성공!</strong> {classTypes.length}개의 수업 타입을 불러왔습니다.
          </div>
        )}

        {classTypes && classTypes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">수업 타입 목록</h2>
            <div className="grid gap-4">
              {classTypes.map((classType: ClassTypeRow) => (
                <div
                  key={classType.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{classType.name}</h3>
                      {classType.description && (
                        <p className="text-sm text-muted-foreground">
                          {classType.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        classType.type === 'group'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {classType.type === 'group' ? '그룹' : '개인'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">기본 최대 인원:</span>{' '}
                      <strong>{classType.default_max_students}명</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">취소 가능 시간:</span>{' '}
                      <strong>{classType.default_cancel_hours}시간 전</strong>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    생성일: {new Date(classType.created_at).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 원본 JSON 데이터 */}
        {classTypes && classTypes.length > 0 && (
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              원본 JSON 데이터 보기
            </summary>
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm">
              {JSON.stringify(classTypes, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
