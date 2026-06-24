import { prisma } from '~/server/utils/prisma'
import { extractUserFromRequest, hasPermission } from '~/server/utils/auth'
import type { UpdateMatchScoreForm, ApiResponse, Match } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Extract user from request
    const user = extractUserFromRequest(event.node.req)
    
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    // Get match ID
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return createErrorResponse('Match ID is required', 400)
    }
    
    const body = await readBody<UpdateMatchScoreForm>(event)
    
    // Get match with relations
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        teamA: true,
        teamB: true,
        refereeTeam: true,
        tournament: true,
      },
    })
    
    if (!match) {
      return createErrorResponse('Match not found', 404)
    }
    
    // Check if user can edit this match
    const canEdit = await canUserEditMatch(user, match)
    
    if (!canEdit && !body.forceUnlock) {
      return createErrorResponse('You do not have permission to edit this match', 403)
    }
    
    // Check if match is locked and user is not admin
    if (match.locked && user.role !== 'ADMIN' && !body.forceUnlock) {
      return createErrorResponse('Match is locked and cannot be edited', 403)
    }
    
    // Store old scores for audit trail
    const oldScoreA = match.scoreA
    const oldScoreB = match.scoreB
    const newScoreA = body.scoreA !== undefined ? body.scoreA : match.scoreA
    const newScoreB = body.scoreB !== undefined ? body.scoreB : match.scoreB
    
    // Check if scores have changed
    const scoresChanged = newScoreA !== oldScoreA || newScoreB !== oldScoreB
    
    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        scoreA: newScoreA,
        scoreB: newScoreB,
        lastEditorId: user.id,
        updatedAt: new Date(),
      },
      include: {
        teamA: true,
        teamB: true,
        refereeTeam: true,
        tournament: true,
      },
    })
    
    // Check if match should be automatically locked
    let shouldLock = false
    let reason = ''
    
    if (match.mode === 'TIMED' && match.durationMinutes) {
      // For timed matches, check if duration has passed
      if (match.startTime) {
        const durationMs = match.durationMinutes * 60 * 1000
        const endTime = new Date(match.startTime.getTime() + durationMs)
        if (new Date() >= endTime) {
          shouldLock = true
          reason = 'Match duration expired'
        }
      }
    } else if (match.mode === 'SCORE_TARGET' && match.targetScore) {
      // For score target matches, check if target is reached
      if (newScoreA >= match.targetScore || newScoreB >= match.targetScore) {
        shouldLock = true
        reason = `Target score of ${match.targetScore} reached`
      }
    }
    
    // Admin can force unlock
    if (body.forceUnlock && user.role === 'ADMIN') {
      shouldLock = false
      reason = 'Admin forced unlock'
    }
    
    // Lock match if needed
    if (shouldLock && !match.locked) {
      await prisma.match.update({
        where: { id },
        data: {
          locked: true,
          status: 'COMPLETED',
          endTime: new Date(),
        },
      })
      
      // Update status in response
      updatedMatch.locked = true
      updatedMatch.status = 'COMPLETED'
      updatedMatch.endTime = new Date()
    }
    
    // Create audit trail if scores changed or lock status changed
    if (scoresChanged || (shouldLock && !match.locked)) {
      await prisma.matchEvent.create({
        data: {
          matchId: id,
          editorId: user.id,
          oldScoreA,
          oldScoreB,
          newScoreA,
          newScoreB,
          reason: reason || 'Score updated',
        },
      })
    }
    
    // Prepare response
    const response: ApiResponse<{ match: Match & { teamA: any; teamB: any; refereeTeam: any; tournament: any } }> = {
      data: { match: updatedMatch },
      success: true,
      message: 'Match score updated successfully',
    }
    
    return response
  } catch (error) {
    console.error('Update match score error:', error)
    return createErrorResponse('Failed to update match score', 500)
  }
})

async function canUserEditMatch(user: any, match: any): Promise<boolean> {
  // Admin can always edit
  if (user.role === 'ADMIN') return true
  
  // Check if user is in the referee team
  if (!match.refereeTeamId) return false
  
  // Find user's player record
  const player = await prisma.player.findFirst({
    where: {
      userId: user.id,
      teamId: match.refereeTeamId,
    },
  })
  
  return !!player
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
