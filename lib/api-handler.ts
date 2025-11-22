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

export async function handleApiError(
  errorOrHandler: unknown | (() => Promise<NextResponse>),
  context: string = 'API Error'
): Promise<NextResponse> {
  // 1. Wrapper로 사용된 경우 (함수가 전달됨)
  if (typeof errorOrHandler === 'function') {
    try {
      return await errorOrHandler()
    } catch (error) {
      // 에러 발생 시 재귀적으로 handleApiError 호출 (에러 객체 전달)
      return handleApiError(error, context)
    }
  }

  // 2. Formatter로 사용된 경우 (에러 객체가 전달됨)
  const error = errorOrHandler
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
