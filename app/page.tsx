import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">ISeeYou</h1>
        <p className="text-xl text-muted-foreground">강아지 훈련 수업 예약 시스템</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            관리자 페이지
          </Link>
          <Link
            href="/student"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition"
          >
            수강생 페이지
          </Link>
        </div>
      </div>
    </main>
  )
}
