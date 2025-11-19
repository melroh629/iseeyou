'use client'

import { RedocStandalone } from 'redoc'
import { swaggerSpec } from '@/lib/swagger-spec'
import { notFound } from 'next/navigation'

export default function ApiDocsPage() {
  // 프로덕션 환경에서는 접근 차단
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <RedocStandalone
      spec={swaggerSpec}
      options={{
        nativeScrollbars: true,
        theme: {
          colors: {
            primary: {
              main: '#9333ea',
            },
          },
          typography: {
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
        },
      }}
    />
  )
}
