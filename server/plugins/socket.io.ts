import { Server } from 'socket.io'
import { prisma } from '~/server/utils/prisma'
import { verifyToken } from '~/server/utils/auth'
import type { SocketMatchUpdate, SocketMessage } from '~/types'

interface SocketUser {
  id: string
  role: string
  socketId: string
}

const users = new Map<string, SocketUser>()
const matchRooms = new Map<string, Set<string>>() // matchId -> Set of socketIds

export default defineNitroPlugin((nitroApp) => {
  const io = new Server(nitroApp.server, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })
  
  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)
    
    // Handle authentication
    socket.on('authenticate', async (token: string) => {
      try {
        const decoded = verifyToken(token)
        
        if (!decoded) {
          socket.disconnect(true)
          return
        }
        
        // Store user
        users.set(socket.id, {
          id: decoded.sub,
          role: decoded.role,
          socketId: socket.id,
        })
        
        // Join user's personal room
        socket.join(`user:${decoded.sub}`)
        console.log(`User authenticated: ${decoded.sub} (${decoded.role})`)
        
        // Send authentication success
        socket.emit('authenticated', {
          success: true,
          userId: decoded.sub,
          role: decoded.role,
        })
        
        // Join tournament rooms for this user
        await joinUserTournaments(socket, decoded.sub)
      } catch (error) {
        console.error('Authentication error:', error)
        socket.disconnect(true)
      }
    })
    
    // Handle joining a match room
    socket.on('join:match', (matchId: string) => {
      socket.join(`match:${matchId}`)
      
      // Track which sockets are in which match rooms
      if (!matchRooms.has(matchId)) {
        matchRooms.set(matchId, new Set())
      }
      matchRooms.get(matchId)?.add(socket.id)
      
      console.log(`Socket ${socket.id} joined match ${matchId}`)
    })
    
    // Handle leaving a match room
    socket.on('leave:match', (matchId: string) => {
      socket.leave(`match:${matchId}`)
      matchRooms.get(matchId)?.delete(socket.id)
      console.log(`Socket ${socket.id} left match ${matchId}`)
    })
    
    // Handle joining a tournament room
    socket.on('join:tournament', (tournamentId: string) => {
      socket.join(`tournament:${tournamentId}`)
      console.log(`Socket ${socket.id} joined tournament ${tournamentId}`)
    })
    
    // Handle score update from client
    socket.on('match:updateScore', async (data: { matchId: string; scoreA: number; scoreB: number }) => {
      try {
        const user = users.get(socket.id)
        
        if (!user) {
          socket.emit('error', { message: 'Unauthorized' })
          return
        }
        
        // Verify user can edit this match
        const match = await prisma.match.findUnique({
          where: { id: data.matchId },
          include: { refereeTeam: true },
        })
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' })
          return
        }
        
        // Check if user is in referee team or is admin
        const canEdit = user.role === 'ADMIN' || 
          (match.refereeTeamId && await isUserInTeam(user.id, match.refereeTeamId))
        
        if (!canEdit) {
          socket.emit('error', { message: 'You cannot edit this match' })
          return
        }
        
        // Check if match is locked
        if (match.locked && user.role !== 'ADMIN') {
          socket.emit('error', { message: 'Match is locked' })
          return
        }
        
        // Update match in database
        const updatedMatch = await prisma.match.update({
          where: { id: data.matchId },
          data: {
            scoreA: data.scoreA,
            scoreB: data.scoreB,
            lastEditorId: user.id,
            updatedAt: new Date(),
          },
          include: {
            teamA: true,
            teamB: true,
            refereeTeam: true,
          },
        })
        
        // Check if match should be locked
        let shouldLock = false
        let lockReason = ''
        
        if (match.mode === 'TIMED' && match.durationMinutes && match.startTime) {
          const durationMs = match.durationMinutes * 60 * 1000
          const endTime = new Date(match.startTime.getTime() + durationMs)
          if (new Date() >= endTime) {
            shouldLock = true
            lockReason = 'Match duration expired'
          }
        } else if (match.mode === 'SCORE_TARGET' && match.targetScore) {
          if (data.scoreA >= match.targetScore || data.scoreB >= match.targetScore) {
            shouldLock = true
            lockReason = `Target score of ${match.targetScore} reached`
          }
        }
        
        // Lock match if needed
        if (shouldLock && !match.locked) {
          await prisma.match.update({
            where: { id: data.matchId },
            data: {
              locked: true,
              status: 'COMPLETED',
              endTime: new Date(),
            },
          })
          
          updatedMatch.locked = true
          updatedMatch.status = 'COMPLETED'
          updatedMatch.endTime = new Date()
          
          // Create audit trail
          await prisma.matchEvent.create({
            data: {
              matchId: data.matchId,
              editorId: user.id,
              oldScoreA: match.scoreA,
              oldScoreB: match.scoreB,
              newScoreA: data.scoreA,
              newScoreB: data.scoreB,
              reason: lockReason,
            },
          })
        }
        
        // Broadcast update to all clients in match room
        const updateData: SocketMatchUpdate = {
          matchId: data.matchId,
          scoreA: data.scoreA,
          scoreB: data.scoreB,
          status: updatedMatch.status as any,
          locked: updatedMatch.locked,
          updatedAt: new Date(),
        }
        
        const message: SocketMessage<SocketMatchUpdate> = {
          event: shouldLock ? 'match:locked' : 'match:scoreUpdated',
          data: updateData,
          timestamp: new Date(),
        }
        
        // Broadcast to match room
        io.to(`match:${data.matchId}`).emit('match:update', message)
        
        // Also broadcast to tournament room
        io.to(`tournament:${updatedMatch.tournamentId}`).emit('match:update', message)
        
        // Acknowledge to sender
        socket.emit('match:update:success', {
          success: true,
          match: updatedMatch,
        })
      } catch (error) {
        console.error('Score update error:', error)
        socket.emit('error', { message: 'Failed to update score' })
      }
    })
    
    // Handle match status changes (start, etc.)
    socket.on('match:start', async (matchId: string) => {
      try {
        const user = users.get(socket.id)
        
        if (!user || user.role !== 'ADMIN') {
          socket.emit('error', { message: 'Only admin can start matches' })
          return
        }
        
        const updatedMatch = await prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'IN_PROGRESS',
            startTime: new Date(),
            lastEditorId: user.id,
          },
          include: {
            teamA: true,
            teamB: true,
            refereeTeam: true,
          },
        })
        
        const message: SocketMessage<SocketMatchUpdate> = {
          event: 'match:statusChanged',
          data: {
            matchId,
            scoreA: updatedMatch.scoreA,
            scoreB: updatedMatch.scoreB,
            status: updatedMatch.status as any,
            locked: updatedMatch.locked,
            updatedAt: new Date(),
          },
          timestamp: new Date(),
        }
        
        io.to(`match:${matchId}`).emit('match:update', message)
        io.to(`tournament:${updatedMatch.tournamentId}`).emit('match:update', message)
        
        socket.emit('match:start:success', { success: true, match: updatedMatch })
      } catch (error) {
        console.error('Match start error:', error)
        socket.emit('error', { message: 'Failed to start match' })
      }
    })
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const user = users.get(socket.id)
      
      if (user) {
        console.log(`User disconnected: ${user.id}`)
        users.delete(socket.id)
      } else {
        console.log(`Socket disconnected: ${socket.id}`)
      }
      
      // Clean up match rooms
      for (const [matchId, sockets] of matchRooms.entries()) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          matchRooms.delete(matchId)
        }
      }
    })
  })
  
  // Store io instance for potential use elsewhere
  nitroApp.hooks.hook('close', () => {
    io.close()
  })
})

async function joinUserTournaments(socket: any, userId: string) {
  try {
    // Find all tournaments where user is a captain or player
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { captainId: userId },
          { players: { some: { userId } } },
        ],
      },
      select: { tournamentId: true },
    })
    
    // Join tournament rooms
    for (const team of teams) {
      socket.join(`tournament:${team.tournamentId}`)
      console.log(`Socket ${socket.id} joined tournament ${team.tournamentId}`)
    }
  } catch (error) {
    console.error('Error joining user tournaments:', error)
  }
}

async function isUserInTeam(userId: string, teamId: string): Promise<boolean> {
  const player = await prisma.player.findFirst({
    where: {
      userId,
      teamId,
    },
  })
  
  return !!player
}
