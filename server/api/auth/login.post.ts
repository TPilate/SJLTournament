import { prisma } from '~/server/utils/prisma'
import { verifyPassword, generateToken, setAuthCookie } from '~/server/utils/auth'
import type { LoginForm, ApiResponse, AuthTokens } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginForm>(event)
    
    // Validation
    if (!body.email || !body.password) {
      return createErrorResponse('Email and password are required', 400)
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    })
    
    if (!user) {
      return createErrorResponse('Invalid email or password', 401)
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(body.password, user.passwordHash)
    
    if (!isPasswordValid) {
      return createErrorResponse('Invalid email or password', 401)
    }
    
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
    const response: ApiResponse<{ user: any; tokens: AuthTokens }> = {
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          pseudo: user.pseudo,
          createdAt: user.createdAt,
        },
        tokens: { accessToken: token },
      },
      success: true,
      message: 'Login successful',
    }
    
    // Set cookie header
    setHeader(event, 'Set-Cookie', cookie)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse('Login failed', 500)
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
