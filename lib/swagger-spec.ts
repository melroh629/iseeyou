export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ISeeYou API',
    version: '1.0.0',
    description: `
강아지 훈련 수업 관리 시스템 API

## 테스트

### E2E 테스트 (Playwright)

프로젝트에 Playwright E2E 테스트가 구축되어 있습니다.

**실행 방법:**
\`\`\`bash
# UI 모드 (추천)
npm run test:e2e:ui

# 일반 실행
npm run test:e2e

# 디버그 모드
npm run test:e2e:debug
\`\`\`

**테스트 파일 위치:** \`tests/\` 디렉토리

**주요 테스트:**
- 학생 로그인 및 예약 플로우
- 예약 취소 플로우
- 관리자 일정 관리

자세한 내용은 \`tests/README.md\` 참고

## 인증

모든 보호된 엔드포인트는 JWT 기반 쿠키 인증을 사용합니다.
- Access Token: 15분 유효
- Refresh Token: 30일 유효
`,
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      description: '개발 서버',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT Access Token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: '에러 메시지',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          phone: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['admin', 'student'],
          },
        },
      },
      Schedule: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          date: {
            type: 'string',
            format: 'date',
          },
          start_time: {
            type: 'string',
            example: '10:00',
          },
          end_time: {
            type: 'string',
            example: '11:00',
          },
          type: {
            type: 'string',
            enum: ['group', 'private'],
          },
          max_students: {
            type: 'number',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'completed', 'cancelled'],
          },
          classes: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              color: { type: 'string', nullable: true },
            },
          },
          _count: {
            type: 'object',
            properties: {
              bookings: { type: 'number' },
            },
          },
          isBooked: {
            type: 'boolean',
          },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          schedule_id: {
            type: 'string',
            format: 'uuid',
          },
          student_id: {
            type: 'string',
            format: 'uuid',
          },
          enrollment_id: {
            type: 'string',
            format: 'uuid',
          },
          status: {
            type: 'string',
            enum: ['confirmed', 'completed', 'cancelled'],
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['인증'],
        summary: '로그인',
        description: '전화번호와 비밀번호로 로그인',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'password'],
                properties: {
                  phone: {
                    type: 'string',
                    description: '전화번호',
                    example: '01012345678',
                  },
                  password: {
                    type: 'string',
                    description: '비밀번호',
                    example: 'password123',
                  },
                  role: {
                    type: 'string',
                    enum: ['admin', 'student'],
                    description: '역할 (선택)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['인증'],
        summary: 'Access Token 갱신',
        description: 'Refresh Token으로 새로운 Access Token 발급',
        responses: {
          '200': {
            description: 'Token 갱신 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Refresh Token 없거나 유효하지 않음',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/student/available-schedules': {
      get: {
        tags: ['일정'],
        summary: '예약 가능한 일정 조회',
        description: '학생이 예약 가능한 일정 목록 조회',
        parameters: [
          {
            in: 'query',
            name: 'year',
            required: true,
            schema: { type: 'string' },
            description: '년도',
            example: '2025',
          },
          {
            in: 'query',
            name: 'month',
            required: true,
            schema: { type: 'string' },
            description: '월',
            example: '01',
          },
          {
            in: 'query',
            name: 'classId',
            schema: { type: 'string', format: 'uuid' },
            description: '수업 종류 필터 (선택)',
          },
        ],
        responses: {
          '200': {
            description: '일정 목록 조회 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    schedules: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Schedule' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/student/create-booking': {
      post: {
        tags: ['예약'],
        summary: '수업 예약',
        description: '학생이 수강권을 사용하여 수업 예약',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['scheduleId', 'enrollmentId'],
                properties: {
                  scheduleId: {
                    type: 'string',
                    format: 'uuid',
                    description: '예약할 스케줄 ID',
                  },
                  enrollmentId: {
                    type: 'string',
                    format: 'uuid',
                    description: '사용할 수강권 ID',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: '예약 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    booking: { $ref: '#/components/schemas/Booking' },
                  },
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: '인증 필요',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/bookings/{id}/cancel': {
      post: {
        tags: ['예약'],
        summary: '예약 취소',
        description: '학생이 예약을 취소합니다. 취소 기한이 지난 경우 수강권이 차감됩니다.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: '취소할 예약 ID',
          },
        ],
        responses: {
          '200': {
            description: '예약 취소 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    late_cancellation: {
                      type: 'boolean',
                      description: '취소 기한 경과 여부',
                    },
                    deducted: {
                      type: 'boolean',
                      description: '수강권 차감 여부',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청 (이미 취소됨, 이미 완료됨)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: '예약을 찾을 수 없음',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/admin/schedules': {
      get: {
        tags: ['관리자', '일정'],
        summary: '일정 목록 조회 (관리자)',
        description: '관리자가 일정 목록 조회',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'classId',
            schema: { type: 'string', format: 'uuid' },
            description: '수업 종류 필터',
          },
          {
            in: 'query',
            name: 'year',
            schema: { type: 'string' },
            description: '년도',
          },
          {
            in: 'query',
            name: 'month',
            schema: { type: 'string' },
            description: '월',
          },
        ],
        responses: {
          '200': {
            description: '일정 목록 조회 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    schedules: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Schedule' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['관리자', '일정'],
        summary: '일정 생성 (관리자)',
        description: '관리자가 새로운 일정 생성',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['classId', 'date', 'startTime', 'endTime', 'type'],
                properties: {
                  classId: {
                    type: 'string',
                    format: 'uuid',
                    description: '수업 종류 ID',
                  },
                  date: {
                    type: 'string',
                    format: 'date',
                    description: '수업 날짜',
                  },
                  startTime: {
                    type: 'string',
                    description: '시작 시간',
                    example: '10:00',
                  },
                  endTime: {
                    type: 'string',
                    description: '종료 시간',
                    example: '11:00',
                  },
                  type: {
                    type: 'string',
                    enum: ['group', 'private'],
                    description: '수업 유형',
                  },
                  maxStudents: {
                    type: 'number',
                    description: '최대 인원 (그룹만)',
                  },
                  studentId: {
                    type: 'string',
                    format: 'uuid',
                    description: '학생 ID (프라이빗 자동 예약)',
                  },
                  notes: {
                    type: 'string',
                    description: '메모',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: '일정 생성 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    class: { $ref: '#/components/schemas/Schedule' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}
