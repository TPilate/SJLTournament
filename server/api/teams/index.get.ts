import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse, PaginatedResponse, Team } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'team:read')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const tournamentId = query.tournamentId as string
    const search = query.search as string
    
    // Build where clause
    const where: any = {}
    
    if (tournamentId) {
      where.tournamentId = tournamentId
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    
    // Get teams
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          captain: true,
          players: {
            include: {
              user: true,
            },
          },
          tournament: true,
          _count: {
            select: {
              players: true,
              matchesAsTeamA: true,
              matchesAsTeamB: true,
              matchesAsReferee: true,
            },
          },
        },
      }),
      prisma.team.count({ where }),
    ])
    
    // Prepare response
    const response: PaginatedResponse<Team & { captain: any; players: any; tournament: any; _count: any }> = {
      data: teams,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
    
    return response
  } catch (error) {
    console.error('Get teams error:', error)
    return createErrorResponse('Failed to get teams', 500)
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
