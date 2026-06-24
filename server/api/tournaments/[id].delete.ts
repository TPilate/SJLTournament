import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    // Check permission
    if (!hasPermission(user, 'tournament:delete')) {
      return createErrorResponse('Unauthorized', 403)
    }
    
    // Get tournament ID
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return createErrorResponse('Tournament ID is required', 400)
    }
    
    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
    })
    
    if (!existingTournament) {
      return createErrorResponse('Tournament not found', 404)
    }
    
    // Delete tournament (cascade will delete related entities)
    await prisma.tournament.delete({
      where: { id },
    })
    
    // Prepare response
    const response: ApiResponse<null> = {
      success: true,
      message: 'Tournament deleted successfully',
    }
    
    return response
  } catch (error) {
    console.error('Delete tournament error:', error)
    return createErrorResponse('Failed to delete tournament', 500)
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
