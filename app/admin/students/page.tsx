export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">수강생 관리</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          수강생 추가
        </button>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        수강생이 없습니다
      </div>
    </div>
  )
}
