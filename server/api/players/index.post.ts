import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'team:update')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    const body = await readBody<{ teamId: string; userId: string; pseudo?: string }>(event)
    
    // Validation
    if (!body.teamId || !body.userId) {
      return createErrorResponse('teamId and userId are required', 400)
    }
    
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: body.teamId },
      include: {
        players: true,
        tournament: true,
      },
    })
    
    if (!team) {
      return createErrorResponse('Team not found', 404)
    }
    
    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: body.userId },
    })
    
    if (!userToAdd) {
      return createErrorResponse('User not found', 404)
    }
    
    // Check if user is already in this team
    const existingPlayer = await prisma.player.findFirst({
      where: {
        userId: body.userId,
        teamId: body.teamId,
      },
    })
    
    if (existingPlayer) {
      return createErrorResponse('User is already in this team', 409)
    }
    
    // Check if user is already in another team in the same tournament
    const playerInOtherTeam = await prisma.player.findFirst({
      where: {
        userId: body.userId,
        team: {
          tournamentId: team.tournamentId,
        },
      },
    })
    
    if (playerInOtherTeam) {
      return createErrorResponse('User is already in another team in this tournament', 409)
    }
    
    // Check team size limit
    if (team.players.length >= team.tournament.maxPlayersPerTeam) {
      return createErrorResponse(`Team has reached maximum size of ${team.tournament.maxPlayersPerTeam} players`, 400)
    }
    
    // Check if user is the captain (captain is automatically added as player)
    if (team.captainId === body.userId) {
      return createErrorResponse('Captain is already in the team', 409)
    }
    
    // Create player
    const player = await prisma.player.create({
      data: {
        userId: body.userId,
        teamId: body.teamId,
        pseudo: body.pseudo,
      },
      include: {
        user: true,
        team: true,
      },
    })
    
    // Prepare response
    const response: ApiResponse<{ player: any }> = {
      data: { player },
      success: true,
      message: 'Player added to team successfully',
    }
    
    return response
  } catch (error) {
    console.error('Add player error:', error)
    return createErrorResponse('Failed to add player to team', 500)
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
