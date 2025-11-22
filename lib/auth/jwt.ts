import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
)

export interface JWTPayload {
  userId: string
  phone: string
  role: 'admin' | 'student'
  studentId?: string | null
}

/**
 * JWT 토큰 생성 (Edge Runtime 호환)
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

/**
 * JWT 토큰 검증 (Edge Runtime 호환)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as string,
      phone: payload.phone as string,
      role: payload.role as 'admin' | 'student',
      studentId: payload.studentId as string | null,
    }
  } catch (error) {
    console.error('JWT 검증 실패:', error)
    return null
  }
}
