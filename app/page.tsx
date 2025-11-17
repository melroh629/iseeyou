import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center sm:px-12 lg:px-24">
      <div className="space-y-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">ISeeYou</h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          아이씨유 독 트레이닝
        </p>

        <div className="flex flex-col gap-3 justify-center sm:flex-row">
          <Link
            href="/admin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition w-full sm:w-auto"
          >
            관리자 페이지
          </Link>
          <Link
            href="/student"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition w-full sm:w-auto"
          >
            수강생 페이지
          </Link>
        </div>
      </div>
    </main>
  );
}
