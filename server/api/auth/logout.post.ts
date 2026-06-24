import { clearAuthCookie } from '~/server/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Clear auth cookie
    const cookie = clearAuthCookie()
    
    // Set cookie header
    setHeader(event, 'Set-Cookie', cookie)
    
    // Prepare response
    const response: ApiResponse<null> = {
      success: true,
      message: 'Logout successful',
    }
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    const response: ApiResponse<null> = {
      error: 'Logout failed',
      success: false,
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed',
      data: response,
    })
  }
})
