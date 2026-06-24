import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse, PaginatedResponse, Match } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'match:read')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const tournamentId = query.tournamentId as string
    const stageId = query.stageId as string
    const poolId = query.poolId as string
    const status = query.status as string
    const teamId = query.teamId as string
    const refereeTeamId = query.refereeTeamId as string
    const search = query.search as string
    
    // Build where clause
    const where: any = {}
    
    if (tournamentId) {
      where.tournamentId = tournamentId
    }
    
    if (stageId) {
      where.stageId = stageId
    }
    
    if (poolId) {
      where.poolId = poolId
    }
    
    if (status) {
      where.status = status
    }
    
    if (teamId) {
      where.OR = [
        { teamAId: teamId },
        { teamBId: teamId },
      ]
    }
    
    if (refereeTeamId) {
      where.refereeTeamId = refereeTeamId
    }
    
    if (search) {
      where.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
        { teamA: { name: { contains: search, mode: 'insensitive' } } },
        { teamB: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    
    // Get matches
    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startTime: 'asc' },
        include: {
          tournament: true,
          stage: true,
          pool: true,
          teamA: true,
          teamB: true,
          refereeTeam: true,
          lastEditor: true,
          events: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              editor: true,
            },
          },
        },
      }),
      prisma.match.count({ where }),
    ])
    
    // Prepare response
    const response: PaginatedResponse<Match & { tournament: any; stage: any; pool: any; teamA: any; teamB: any; refereeTeam: any; lastEditor: any; events: any }> = {
      data: matches,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
    
    return response
  } catch (error) {
    console.error('Get matches error:', error)
    return createErrorResponse('Failed to get matches', 500)
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
