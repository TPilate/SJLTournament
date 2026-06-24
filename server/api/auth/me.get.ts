import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest } from '~/server/utils/auth'
import type { ApiResponse, AuthUser } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        pseudo: true,
        createdAt: true,
        updatedAt: true,
        player: {
          include: {
            team: {
              include: {
                tournament: true,
                captain: true,
              },
            },
          },
        },
        teamsAsCaptain: {
          include: {
            tournament: true,
            players: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })
    
    if (!dbUser) {
      return createErrorResponse('User not found', 404)
    }
    
    // Prepare response
    const response: ApiResponse<{ user: AuthUser & { teams?: any; player?: any } }> = {
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          pseudo: dbUser.pseudo,
          createdAt: dbUser.createdAt,
          teams: dbUser.teamsAsCaptain,
          player: dbUser.player,
        },
      },
      success: true,
    }
    
    return response
  } catch (error) {
    console.error('Get me error:', error)
    return createErrorResponse('Failed to get user data', 500)
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
