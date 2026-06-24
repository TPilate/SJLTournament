import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse, PaginatedResponse, Tournament } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'tournament:read')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const status = query.status as string
    const format = query.format as string
    const search = query.search as string
    
    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (format) {
      where.format = format
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Get tournaments
    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              teams: true,
              matches: true,
              stages: true,
            },
          },
        },
      }),
      prisma.tournament.count({ where }),
    ])
    
    // Prepare response
    const response: PaginatedResponse<Tournament & { _count: any }> = {
      data: tournaments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
    
    return response
  } catch (error) {
    console.error('Get tournaments error:', error)
    return createErrorResponse('Failed to get tournaments', 500)
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
