import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { CreateTeamForm, ApiResponse, Team } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'team:create')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    const body = await readBody<CreateTeamForm>(event)
    
    // Validation
    if (!body.name || !body.tournamentId || !body.captainId) {
      return createErrorResponse('Name, tournamentId, and captainId are required', 400)
    }
    
    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: body.tournamentId },
    })
    
    if (!tournament) {
      return createErrorResponse('Tournament not found', 404)
    }
    
    // Check if captain exists
    const captain = await prisma.user.findUnique({
      where: { id: body.captainId },
    })
    
    if (!captain) {
      return createErrorResponse('Captain not found', 404)
    }
    
    // Check if team name already exists in this tournament
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: body.name,
        tournamentId: body.tournamentId,
      },
    })
    
    if (existingTeam) {
      return createErrorResponse('Team with this name already exists in this tournament', 409)
    }
    
    // Check if captain already has a team in this tournament
    const captainTeam = await prisma.team.findFirst({
      where: {
        captainId: body.captainId,
        tournamentId: body.tournamentId,
      },
    })
    
    if (captainTeam) {
      return createErrorResponse('Captain already has a team in this tournament', 409)
    }
    
    // Create team
    const team = await prisma.team.create({
      data: {
        name: body.name,
        tournamentId: body.tournamentId,
        captainId: body.captainId,
      },
      include: {
        captain: true,
        tournament: true,
      },
    })
    
    // Create player entry for captain
    await prisma.player.create({
      data: {
        userId: body.captainId,
        teamId: team.id,
        pseudo: captain.pseudo,
      },
    })
    
    // Prepare response
    const response: ApiResponse<{ team: Team & { captain: any; tournament: any } }> = {
      data: { team },
      success: true,
      message: 'Team created successfully',
    }
    
    return response
  } catch (error) {
    console.error('Create team error:', error)
    return createErrorResponse('Failed to create team', 500)
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
