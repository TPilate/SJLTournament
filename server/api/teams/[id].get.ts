import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse, Team } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'team:read')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get team ID
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return createErrorResponse('Team ID is required', 400)
    }
    
    // Get team with relations
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        captain: true,
        tournament: true,
        players: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        pools: true,
        matchesAsTeamA: {
          include: {
            teamB: true,
            refereeTeam: true,
            stage: true,
            pool: true,
          },
          orderBy: { startTime: 'asc' },
        },
        matchesAsTeamB: {
          include: {
            teamA: true,
            refereeTeam: true,
            stage: true,
            pool: true,
          },
          orderBy: { startTime: 'asc' },
        },
        matchesAsReferee: {
          include: {
            teamA: true,
            teamB: true,
            stage: true,
            pool: true,
          },
          orderBy: { startTime: 'asc' },
        },
      },
    })
    
    if (!team) {
      return createErrorResponse('Team not found', 404)
    }
    
    // Prepare response
    const response: ApiResponse<{ team: Team & { captain: any; tournament: any; players: any; pools: any; matchesAsTeamA: any; matchesAsTeamB: any; matchesAsReferee: any } }> = {
      data: { team },
      success: true,
    }
    
    return response
  } catch (error) {
    console.error('Get team error:', error)
    return createErrorResponse('Failed to get team', 500)
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
