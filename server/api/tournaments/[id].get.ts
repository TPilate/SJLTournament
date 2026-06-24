import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse, Tournament } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'tournament:read')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get tournament ID
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return createErrorResponse('Tournament ID is required', 400)
    }
    
    // Get tournament with relations
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            captain: true,
            players: {
              include: {
                user: true,
              },
            },
          },
        },
        stages: {
          orderBy: { order: 'asc' },
          include: {
            pools: {
              include: {
                teams: true,
                matches: {
                  include: {
                    teamA: true,
                    teamB: true,
                    refereeTeam: true,
                  },
                  orderBy: { startTime: 'asc' },
                },
              },
            },
            matches: {
              include: {
                teamA: true,
                teamB: true,
                refereeTeam: true,
              },
              orderBy: { startTime: 'asc' },
            },
          },
        },
        matches: {
          include: {
            teamA: true,
            teamB: true,
            refereeTeam: true,
            stage: true,
            pool: true,
          },
          orderBy: { startTime: 'asc' },
        },
      },
    })
    
    if (!tournament) {
      return createErrorResponse('Tournament not found', 404)
    }
    
    // Prepare response
    const response: ApiResponse<{ tournament: Tournament & { teams: any; stages: any; matches: any } }> = {
      data: { tournament },
      success: true,
    }
    
    return response
  } catch (error) {
    console.error('Get tournament error:', error)
    return createErrorResponse('Failed to get tournament', 500)
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
