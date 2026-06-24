import { defineStore } from 'pinia'
import type { Tournament, ApiResponse, PaginatedResponse, TournamentStatus, TournamentFormat } from '~/types'

interface TournamentState {
  tournaments: Tournament[]
  currentTournament: Tournament | null
  isLoading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

export const useTournamentStore = defineStore('tournaments', {
  state: (): TournamentState => ({
    tournaments: [],
    currentTournament: null,
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 20,
  }),
  
  getters: {
    getTournaments: (state) => state.tournaments,
    getCurrentTournament: (state) => state.currentTournament,
    getLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getTotal: (state) => state.total,
    getPage: (state) => state.page,
    getPageSize: (state) => state.pageSize,
    getTotalPages: (state) => Math.ceil(state.total / state.pageSize),
    
    // Filtered getters
    getActiveTournaments: (state) => state.tournaments.filter(t => t.status === 'IN_PROGRESS'),
    getUpcomingTournaments: (state) => state.tournaments.filter(t => t.status === 'REGISTRATION_OPEN'),
    getCompletedTournaments: (state) => state.tournaments.filter(t => t.status === 'COMPLETED'),
    getDraftTournaments: (state) => state.tournaments.filter(t => t.status === 'DRAFT'),
  },
  
  actions: {
    async fetchTournaments(params: {
      page?: number
      pageSize?: number
      status?: TournamentStatus
      format?: TournamentFormat
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
        
        if (params.status) {
          queryParams.append('status', params.status)
        }
        
        if (params.format) {
          queryParams.append('format', params.format)
        }
        
        if (params.search) {
          queryParams.append('search', params.search)
        }
        
        const response = await $fetch<PaginatedResponse<Tournament>>(`/api/tournaments?${queryParams.toString()}`)
        
        this.tournaments = response.data
        this.total = response.total
        this.page = response.page
        this.pageSize = response.pageSize
        
        return this.tournaments
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tournaments'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchTournamentById(id: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<{ tournament: Tournament & { teams: any; stages: any; matches: any } }>>(`/api/tournaments/${id}`)
        
        if (response.success && response.data) {
          this.currentTournament = response.data.tournament
          return response.data.tournament
        } else {
          throw new Error(response.error || 'Tournament not found')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tournament'
        this.currentTournament = null
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async createTournament(data: {
      name: string
      description?: string
      format: TournamentFormat
      maxTeams?: number
      maxPlayersPerTeam?: number
      startDate?: Date
      endDate?: Date
      rules?: Record<string, unknown>
    }) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<{ tournament: Tournament }>>('/api/tournaments', {
          method: 'POST',
          body: data,
        })
        
        if (response.success && response.data) {
          this.tournaments.unshift(response.data.tournament)
          this.total++
          return response.data.tournament
        } else {
          throw new Error(response.error || 'Failed to create tournament')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create tournament'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async updateTournament(id: string, data: Partial<{
      name: string
      description: string
      format: TournamentFormat
      maxTeams: number
      maxPlayersPerTeam: number
      startDate: Date
      endDate: Date
      rules: Record<string, unknown>
      status: TournamentStatus
    }>) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<{ tournament: Tournament }>>(`/api/tournaments/${id}`, {
          method: 'PUT',
          body: data,
        })
        
        if (response.success && response.data) {
          // Update in local state
          const index = this.tournaments.findIndex(t => t.id === id)
          if (index !== -1) {
            this.tournaments[index] = response.data.tournament
          }
          
          if (this.currentTournament?.id === id) {
            this.currentTournament = response.data.tournament
          }
          
          return response.data.tournament
        } else {
          throw new Error(response.error || 'Failed to update tournament')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update tournament'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async deleteTournament(id: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<ApiResponse<null>>(`/api/tournaments/${id}`, {
          method: 'DELETE',
        })
        
        if (response.success) {
          // Remove from local state
          this.tournaments = this.tournaments.filter(t => t.id !== id)
          this.total--
          
          if (this.currentTournament?.id === id) {
            this.currentTournament = null
          }
          
          return true
        } else {
          throw new Error(response.error || 'Failed to delete tournament')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete tournament'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    clearCurrentTournament() {
      this.currentTournament = null
    },
    
    clearError() {
      this.error = null
    },
  },
})
