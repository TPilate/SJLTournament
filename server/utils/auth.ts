import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import type { JwtPayload, AuthUser } from '~/types'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_EXPIRES_IN = '24h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Generate refresh token
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

// Extract user from request (for server middleware)
export function extractUserFromRequest(request: Request): AuthUser | null {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null
    
    const cookies = parseCookies(cookieHeader)
    const token = cookies['auth-token']
    
    if (!token) return null
    
    const decoded = verifyToken(token)
    if (!decoded) return null
    
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      pseudo: decoded.pseudo,
    }
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

// Parse cookies from header
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  const pairs = cookieHeader.split(';')
  
  for (const pair of pairs) {
    const [name, ...rest] = pair.trim().split('=')
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=')
    }
  }
  
  return cookies
}

// Set auth cookie
export function setAuthCookie(token: string, maxAge: number = 24 * 60 * 60): string {
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`
}

// Clear auth cookie
export function clearAuthCookie(): string {
  return 'auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
}

// Check if user has permission
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false
  
  // Import here to avoid circular dependency
  const { ROLE_PERMISSIONS } = require('~/types')
  
  const permissions = ROLE_PERMISSIONS[user.role] || []
  return permissions.includes(permission as any)
}

// Check if user can edit a specific match (for referee or admin)
export function canEditMatch(user: AuthUser | null, match: any): boolean {
  if (!user) return false
  
  // Admin can edit any match
  if (user.role === 'ADMIN') return true
  
  // Player can only edit matches where their team is the referee
  // This is a simplified check - in practice, we'd need to check if user's team is the referee
  return false
}
