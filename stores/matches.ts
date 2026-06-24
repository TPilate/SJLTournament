import { defineStore } from 'pinia'
import type { Match, ApiResponse, PaginatedResponse, MatchStatus, MatchMode } from '~/types'

interface MatchState {
  matches: Match[]
  currentMatch: Match | null
  isLoading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  liveMatches: Map<string, Match> // For real-time updates
}

export const useMatchStore = defineStore('matches', {
  state: (): MatchState => ({
    matches: [],
    currentMatch: null,
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 20,
    liveMatches: new Map(),
  }),
  
  getters: {
    getMatches: (state) => state.matches,
    getCurrentMatch: (state) => state.currentMatch,
    getLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getPageSize: (state) => state.pageSize,
    getTotalPages: (state) => Math.ceil(state.total / state.pageSize),
    
    // Filtered getters
    getScheduledMatches: (state) => state.matches.filter(m => m.status === 'SCHEDULED'),
    getInProgressMatches: (state) => state.matches.filter(m => m.status === 'IN_PROGRESS'),
    getCompletedMatches: (state) => state.matches.filter(m => m.status === 'COMPLETED'),
    getLockedMatches: (state) => state.matches.filter(m => m.locked),
    getUnlockedMatches: (state) => state.matches.filter(m => !m.locked),
    
    // Get matches by tournament
    getMatchesByTournament: (state) => (tournamentId: string) => {
      return state.matches.filter(m => m.tournamentId === tournamentId)
    },
    
    // Get matches by team
    getMatchesByTeam: (state) => (teamId: string) => {
      return state.matches.filter(m => m.teamAId === teamId || m.teamBId === teamId)
    },
    
    // Get matches where team is referee
    getMatchesByRefereeTeam: (state) => (teamId: string) => {
      return state.matches.filter(m => m.refereeTeamId === teamId)
    },
    
    // Get live match by ID
    getLiveMatch: (state) => (matchId: string) => {
      return state.liveMatches.get(matchId) || null
    },
  },
  
  actions: {
    async fetchMatches(params: {
      page?: number
      pageSize?: number
      tournamentId?: string
      stageId?: string
      poolId?: string
      status?: MatchStatus
      teamId?: string
      refereeTeamId?: string
      search?: string
    } = {}) {
      this.isLoading = true
      this.error = null
      
      try {
        const queryParams = new URLSearchParams()
        
        if (params.page) {
          queryParams.append('page', params.page.toString())
          this.page = params.page
        }
        
        if (params.pageSize) {
          queryParams.append('pageSize', params.pageSize.toString())
          this.pageSize = params.pageSize
        }
        
        if (params.tournamentId) {
          queryParams.append('tournamentId', params.tournamentId)
        }
        
        if (params.stageId) {
          queryParams.append('stageId', params.stageId)
        }
        
        if (params.poolId) {
          queryParams.append('poolId', params.poolId)
        }
        
        if (params.status) {
          queryParams.append('status', params.status)
        }
        
        if (params.teamId) {
          queryParams.append('teamId', params.teamId)
        }
        
        if (params.refereeTeamId) {
          queryParams.append('refereeTeamId', params.refereeTeamId)
        }
        
        if (params.search) {
          queryParams.append('search', params.search)
        }
        
        const response = await $fetch<PaginatedResponse<Match>>(`/api/matches?${queryParams.toString()}`)
        
        this.matches = response.data
        this.total = response.total
        this.page = response.page
        this.pageSize = response.pageSize
        
        // Update live matches
        for (const match of response.data) {
          this.liveMatches.set(match.id, match)
        }
        
        return this.matches
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch matches'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchMatchById(id: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<{ match: Match & { tournament: any; stage: any; pool: any; teamA: any; teamB: any; refereeTeam: any; events: any } }>>(`/api/matches/${id}`)
        
        if (response.success && response.data) {
          this.currentMatch = response.data.match
          this.liveMatches.set(id, response.data.match)
          return response.data.match
        } else {
          throw new Error(response.error || 'Match not found')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch match'
        this.currentMatch = null
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async createMatch(data: {
      tournamentId: string
      stageId?: string
      poolId?: string
      teamAId: string
      teamBId: string
      refereeTeamId?: string
      mode: MatchMode
      durationMinutes?: number
      targetScore?: number
      startTime?: Date
      notes?: string
    }) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<{ match: Match }>>('/api/matches', {
          method: 'POST',
          body: data,
        })
        
        if (response.success && response.data) {
          this.matches.unshift(response.data.match)
          this.liveMatches.set(response.data.match.id, response.data.match)
          this.total++
          return response.data.match
        } else {
          throw new Error(response.error || 'Failed to create match')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create match'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async updateMatchScore(matchId: string, data: { scoreA?: number; scoreB?: number; forceUnlock?: boolean }) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<{ match: Match }>>(`/api/matches/${matchId}/score`, {
          method: 'PUT',
          body: data,
        })
        
        if (response.success && response.data) {
          const updatedMatch = response.data.match
          
          // Update in local state
          const index = this.matches.findIndex(m => m.id === matchId)
          if (index !== -1) {
            this.matches[index] = updatedMatch
          }
          
          // Update in live matches
          this.liveMatches.set(matchId, updatedMatch)
          
          if (this.currentMatch?.id === matchId) {
            this.currentMatch = updatedMatch
          }
          
          return updatedMatch
        } else {
          throw new Error(response.error || 'Failed to update match score')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update match score'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    // Update match from WebSocket
    updateMatchFromSocket(match: Match) {
      // Update in matches array
      const index = this.matches.findIndex(m => m.id === match.id)
      if (index !== -1) {
        this.matches[index] = match
      }
      
      // Update in live matches
      this.liveMatches.set(match.id, match)
      
      if (this.currentMatch?.id === match.id) {
        this.currentMatch = match
      }
    },
    
    // Handle WebSocket match update
    handleSocketMatchUpdate(data: {
      matchId: string
      scoreA: number
      scoreB: number
      status: MatchStatus
      locked: boolean
      updatedAt: Date
    }) {
      const match = this.liveMatches.get(data.matchId)
      
      if (match) {
        const updatedMatch = {
          ...match,
          scoreA: data.scoreA,
          scoreB: data.scoreB,
          status: data.status,
          locked: data.locked,
          updatedAt: data.updatedAt,
        }
        
        this.updateMatchFromSocket(updatedMatch)
      }
    },
    
    clearCurrentMatch() {
      this.currentMatch = null
    },
    
    clearError() {
      this.error = null
    },
    
    // Clear live match
    clearLiveMatch(matchId: string) {
      this.liveMatches.delete(matchId)
    },
  },
})
