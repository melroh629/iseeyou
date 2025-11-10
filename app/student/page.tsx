export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">내 대시보드</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">남은 수강권</h3>
          <p className="text-3xl font-bold mt-2">0회</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">예정된 수업</h3>
          <p className="text-3xl font-bold mt-2">0건</p>
        </div>
      </div>
    </div>
  )
}
