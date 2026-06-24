import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { AuthUser } from '~/types'

export default defineEventHandler((event) => {
  // Skip auth for public routes
  const path = event.node.req.url
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/tournaments', // Public read access for tournaments
    '/api/matches', // Public read access for matches
  ]
  
  const isPublicRoute = publicRoutes.some(route => path?.includes(route))
  
  if (isPublicRoute) {
    return
  }
  
  // Extract user from request
  const user = extractUserFromRequest(event.node.req)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: {
        error: 'Authentication required',
        success: false,
      },
    })
  }
  
  // Store user in event context for later use
  event.context.auth = user
})

// Helper to get authenticated user from event
export function getAuthUser(event: any): AuthUser | null {
  return event.context?.auth || null
}

// Middleware to check specific permissions
export function requirePermission(permission: string) {
  return defineEventHandler((event) => {
    const user = getAuthUser(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: {
          error: 'Authentication required',
          success: false,
        },
      })
    }
    
    if (!hasPermission(user, permission)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        data: {
          error: 'Insufficient permissions',
          success: false,
        },
      })
    }
  })
}
