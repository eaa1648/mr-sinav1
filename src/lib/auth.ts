import * as jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  tc_kimlik_no: string
  role: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string | undefined): JWTPayload | null {
  try {
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined
  }
  return authHeader.substring(7)
}