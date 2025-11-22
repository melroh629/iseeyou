import { NextResponse } from 'next/server'

type ApiHandler = (request: Request, ...args: any[]) => Promise<NextResponse>

export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown, context: string = 'API Error'): NextResponse {
  console.error(`${context}:`, error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: '알 수 없는 오류가 발생했습니다.' },
    { status: 500 }
  )
}
