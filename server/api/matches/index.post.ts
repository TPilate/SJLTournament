import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { CreateMatchForm, ApiResponse, Match } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'match:create')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    const body = await readBody<CreateMatchForm>(event)
    
    // Validation
    if (!body.tournamentId || !body.teamAId || !body.teamBId) {
      return createErrorResponse('tournamentId, teamAId, and teamBId are required', 400)
    }
    
    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: body.tournamentId },
    })
    
    if (!tournament) {
      return createErrorResponse('Tournament not found', 404)
    }
    
    // Check if teams exist
    const [teamA, teamB] = await Promise.all([
      prisma.team.findUnique({ where: { id: body.teamAId } }),
      prisma.team.findUnique({ where: { id: body.teamBId } }),
    ])
    
    if (!teamA || !teamB) {
      return createErrorResponse('One or both teams not found', 404)
    }
    
    // Check if teams belong to the same tournament
    if (teamA.tournamentId !== tournament.id || teamB.tournamentId !== tournament.id) {
      return createErrorResponse('Teams must belong to the same tournament', 400)
    }
    
    // Check if referee team exists and belongs to the same tournament
    if (body.refereeTeamId) {
      const refereeTeam = await prisma.team.findUnique({
        where: { id: body.refereeTeamId },
      })
      
      if (!refereeTeam) {
        return createErrorResponse('Referee team not found', 404)
      }
      
      if (refereeTeam.tournamentId !== tournament.id) {
        return createErrorResponse('Referee team must belong to the same tournament', 400)
      }
      
      // Check if referee team is not one of the playing teams
      if (refereeTeam.id === teamA.id || refereeTeam.id === teamB.id) {
        return createErrorResponse('Referee team cannot be one of the playing teams', 400)
      }
    }
    
    // Check if stage exists
    if (body.stageId) {
      const stage = await prisma.stage.findUnique({
        where: { id: body.stageId },
      })
      
      if (!stage) {
        return createErrorResponse('Stage not found', 404)
      }
    }
    
    // Check if pool exists
    if (body.poolId) {
      const pool = await prisma.pool.findUnique({
        where: { id: body.poolId },
      })
      
      if (!pool) {
        return createErrorResponse('Pool not found', 404)
      }
    }
    
    // Create match
    const match = await prisma.match.create({
      data: {
        tournamentId: body.tournamentId,
        stageId: body.stageId,
        poolId: body.poolId,
        teamAId: body.teamAId,
        teamBId: body.teamBId,
        refereeTeamId: body.refereeTeamId,
        mode: body.mode,
        durationMinutes: body.durationMinutes,
        targetScore: body.targetScore,
        startTime: body.startTime,
        notes: body.notes,
        status: 'SCHEDULED',
        locked: false,
      },
      include: {
        tournament: true,
        stage: true,
        pool: true,
        teamA: true,
        teamB: true,
        refereeTeam: true,
      },
    })
    
    // Prepare response
    const response: ApiResponse<{ match: Match & { tournament: any; stage: any; pool: any; teamA: any; teamB: any; refereeTeam: any } }> = {
      data: { match },
      success: true,
      message: 'Match created successfully',
    }
    
    return response
  } catch (error) {
    console.error('Create match error:', error)
    return createErrorResponse('Failed to create match', 500)
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
