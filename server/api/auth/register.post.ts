import { prisma } from '~/server/utils/prisma'
import { hashPassword, generateToken, setAuthCookie } from '~/server/utils/auth'
import type { RegisterForm, ApiResponse, AuthTokens } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RegisterForm>(event)
    
    // Validation
    if (!body.email || !body.password) {
      return createErrorResponse('Email and password are required', 400)
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })
    
    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409)
    }
    
    // Hash password
    const passwordHash = await hashPassword(body.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        role: body.role || 'PLAYER',
        pseudo: body.pseudo,
      },
      select: {
        id: true,
        email: true,
        role: true,
        pseudo: true,
        createdAt: true,
      },
    })
    
    // Generate token
    const token = generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      pseudo: user.pseudo,
    })
    
    // Set cookie
    const cookie = setAuthCookie(token)
    
    // Prepare response
    const response: ApiResponse<{ user: typeof user; tokens: AuthTokens }> = {
      data: {
        user,
        tokens: { accessToken: token },
      },
      success: true,
      message: 'User registered successfully',
    }
    
    // Set cookie header
    setHeader(event, 'Set-Cookie', cookie)
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return createErrorResponse('Registration failed', 500)
  }
})

function createErrorResponse(message: string, statusCode: number) {
  const response: ApiResponse<null> = {
    error: message,
    success: false,
  }
  
  throw createError({
    statusCode,
    statusMessage: message,
    data: response,
  })
}
