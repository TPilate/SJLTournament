import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { CreateTournamentForm, ApiResponse, Tournament } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'tournament:update')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get tournament ID
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return createErrorResponse('Tournament ID is required', 400)
    }
    
    const body = await readBody<CreateTournamentForm>(event)
    
    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
    })
    
    if (!existingTournament) {
      return createErrorResponse('Tournament not found', 404)
    }
    
    // Update tournament
    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        name: body.name || existingTournament.name,
        description: body.description !== undefined ? body.description : existingTournament.description,
        format: body.format || existingTournament.format,
        maxTeams: body.maxTeams || existingTournament.maxTeams,
        maxPlayersPerTeam: body.maxPlayersPerTeam || existingTournament.maxPlayersPerTeam,
        startDate: body.startDate !== undefined ? body.startDate : existingTournament.startDate,
        endDate: body.endDate !== undefined ? body.endDate : existingTournament.endDate,
        rules: body.rules !== undefined ? body.rules : existingTournament.rules,
        status: body.status || existingTournament.status,
      },
    })
    
    // Prepare response
    const response: ApiResponse<{ tournament: Tournament }> = {
      data: { tournament },
      success: true,
      message: 'Tournament updated successfully',
    }
    
    return response
  } catch (error) {
    console.error('Update tournament error:', error)
    return createErrorResponse('Failed to update tournament', 500)
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
