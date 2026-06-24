import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { CreateTournamentForm, ApiResponse, Tournament } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'tournament:create')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    const body = await readBody<CreateTournamentForm>(event)
    
    // Validation
    if (!body.name) {
      return createErrorResponse('Name is required', 400)
    }
    
    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        description: body.description,
        format: body.format,
        maxTeams: body.maxTeams || 16,
        maxPlayersPerTeam: body.maxPlayersPerTeam || 6,
        startDate: body.startDate,
        endDate: body.endDate,
        rules: body.rules,
        status: 'DRAFT',
      },
    })
    
    // Create default stages based on format
    await createDefaultStages(tournament.id, tournament.format)
    
    // Prepare response
    const response: ApiResponse<{ tournament: Tournament }> = {
      data: { tournament },
      success: true,
      message: 'Tournament created successfully',
    }
    
    return response
  } catch (error) {
    console.error('Create tournament error:', error)
    return createErrorResponse('Failed to create tournament', 500)
  }
})

async function createDefaultStages(tournamentId: string, format: string) {
  const stages = []
  
  switch (format) {
    case 'GROUP_STAGE_THEN_KNOCKOUT':
      stages.push(
        { name: 'Phase de poules', type: 'GROUP' as const, order: 1 },
        { name: 'Quarts de finale', type: 'BRACKET' as const, order: 2 },
        { name: 'Demi-finales', type: 'BRACKET' as const, order: 3 },
        { name: 'Finale', type: 'FINAL' as const, order: 4 },
        { name: 'Petite finale', type: 'THIRD_PLACE' as const, order: 5 },
      )
      break
    case 'SINGLE_ELIMINATION':
      stages.push(
        { name: 'Tableau principal', type: 'BRACKET' as const, order: 1 },
        { name: 'Finale', type: 'FINAL' as const, order: 2 },
        { name: 'Petite finale', type: 'THIRD_PLACE' as const, order: 3 },
      )
      break
    case 'DOUBLE_ELIMINATION':
      stages.push(
        { name: 'Winners Bracket', type: 'BRACKET' as const, order: 1 },
        { name: 'Losers Bracket', type: 'BRACKET' as const, order: 2 },
        { name: 'Grande finale', type: 'FINAL' as const, order: 3 },
      )
      break
    case 'ROUND_ROBIN':
      stages.push(
        { name: 'Round Robin', type: 'GROUP' as const, order: 1 },
      )
      break
    case 'HYBRID':
      stages.push(
        { name: 'Phase 1', type: 'GROUP' as const, order: 1 },
        { name: 'Phase 2', type: 'BRACKET' as const, order: 2 },
      )
      break
  }
  
  for (const stage of stages) {
    await prisma.stage.create({
      data: {
        tournamentId,
        type: stage.type,
        name: stage.name,
        order: stage.order,
      },
    })
  }
}

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
