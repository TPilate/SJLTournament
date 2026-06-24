import { io, type Socket } from 'socket.io-client'
import type { SocketMessage, SocketMatchUpdate, AuthUser } from '~/types'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  isAuthenticated: boolean
  error: string | null
}

export const useSocket = () => {
  const state = reactive<SocketState>({
    socket: null,
    isConnected: false,
    isAuthenticated: false,
    error: null,
  })
  
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const matchStore = useMatchStore()
  
  // Socket.io server URL
  const socketUrl = computed(() => {
    // In development, use the configured port
    if (process.dev) {
      return `http://localhost:${config.public.socketIoPort || 3001}`
    }
    // In production, use the same origin
    return window.location.origin
  })
  
  // Initialize socket connection
  const init = () => {
    if (state.socket) {
      return
    }
    
    try {
      state.socket = io(socketUrl.value, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      })
      
      // Connection events
      state.socket.on('connect', () => {
        state.isConnected = true
        state.error = null
        console.log('Socket.io connected')
        
        // Authenticate if user is logged in
        if (authStore.isAuthenticated) {
          authenticate()
        }
      })
      
      state.socket.on('disconnect', () => {
        state.isConnected = false
        state.isAuthenticated = false
        console.log('Socket.io disconnected')
      })
      
      state.socket.on('connect_error', (error) => {
        state.error = error.message || 'Connection error'
        console.error('Socket.io connection error:', error)
      })
      
      state.socket.on('error', (error: { message: string }) => {
        state.error = error.message
        console.error('Socket.io error:', error)
      })
      
      // Authentication response
      state.socket.on('authenticated', (data: { success: boolean; userId: string; role: string }) => {
        if (data.success) {
          state.isAuthenticated = true
          console.log('Socket.io authenticated')
        } else {
          state.isAuthenticated = false
          state.error = 'Authentication failed'
        }
      })
      
      // Match updates
      state.socket.on('match:update', (message: SocketMessage<SocketMatchUpdate>) => {
        console.log('Received match update:', message.event, message.data)
        
        // Update match in store
        matchStore.handleSocketMatchUpdate(message.data)
      })
      
      // Tournament updates
      state.socket.on('tournament:update', (data: any) => {
        console.log('Received tournament update:', data)
        // Could trigger tournament store refresh
      })
      
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Failed to initialize socket'
      console.error('Socket.io initialization error:', error)
    }
  }
  
  // Authenticate with socket
  const authenticate = () => {
    if (!state.socket || !authStore.isAuthenticated) {
      return
    }
    
    const tokens = authStore.getTokens
    if (tokens?.accessToken) {
      state.socket.emit('authenticate', tokens.accessToken)
    }
  }
  
  // Join a match room
  const joinMatchRoom = (matchId: string) => {
    if (!state.socket) {
      return
    }
    
    state.socket.emit('join:match', matchId)
  }
  
  // Leave a match room
  const leaveMatchRoom = (matchId: string) => {
    if (!state.socket) {
      return
    }
    
    state.socket.emit('leave:match', matchId)
  }
  
  // Join a tournament room
  const joinTournamentRoom = (tournamentId: string) => {
    if (!state.socket) {
      return
    }
    
    state.socket.emit('join:tournament', tournamentId)
  }
  
  // Update match score
  const updateMatchScore = (matchId: string, scoreA: number, scoreB: number) => {
    if (!state.socket) {
      return Promise.reject(new Error('Socket not initialized'))
    }
    
    return new Promise((resolve, reject) => {
      state.socket.emit('match:updateScore', { matchId, scoreA, scoreB }, (response: any) => {
        if (response?.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'Failed to update score'))
        }
      })
    })
  }
  
  // Start a match (admin only)
  const startMatch = (matchId: string) => {
    if (!state.socket) {
      return Promise.reject(new Error('Socket not initialized'))
    }
    
    return new Promise((resolve, reject) => {
      state.socket.emit('match:start', matchId, (response: any) => {
        if (response?.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'Failed to start match'))
        }
      })
    })
  }
  
  // Disconnect socket
  const disconnect = () => {
    if (state.socket) {
      state.socket.disconnect()
      state.socket = null
      state.isConnected = false
      state.isAuthenticated = false
    }
  }
  
  // Reconnect
  const reconnect = () => {
    disconnect()
    init()
  }
  
  // Watch for auth changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated && state.socket) {
      authenticate()
    }
  })
  
  // Auto-initialize on client side
  if (process.client) {
    onMounted(() => {
      init()
    })
    
    onUnmounted(() => {
      disconnect()
    })
  }
  
  return {
    state,
    socket: computed(() => state.socket),
    isConnected: computed(() => state.isConnected),
    isAuthenticated: computed(() => state.isAuthenticated),
    error: computed(() => state.error),
    init,
    authenticate,
    joinMatchRoom,
    leaveMatchRoom,
    joinTournamentRoom,
    updateMatchScore,
    startMatch,
    disconnect,
    reconnect,
  }
}
