import { defineStore } from 'pinia'
import type { AuthUser, ApiResponse, AuthTokens } from '~/types'

interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
  }),
  
  getters: {
    getUser: (state) => state.user,
    getTokens: (state) => state.tokens,
    isAuth: (state) => state.isAuthenticated,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isPlayer: (state) => state.user?.role === 'PLAYER',
  },
  
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      
      try {
        const response = await $fetch<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.tokens = response.data.tokens
          this.isAuthenticated = true
          
          // Store user in localStorage
          localStorage.setItem('auth-user', JSON.stringify(response.data.user))
          
          return { success: true, user: response.data.user }
        } else {
          throw new Error(response.error || 'Login failed')
        }
      } catch (error) {
        this.isAuthenticated = false
        this.user = null
        this.tokens = null
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async register(email: string, password: string, pseudo?: string, role?: string) {
      this.isLoading = true
      
      try {
        const response = await $fetch<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>('/api/auth/register', {
          method: 'POST',
          body: { email, password, pseudo, role },
        })
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.tokens = response.data.tokens
          this.isAuthenticated = true
          
          // Store user in localStorage
          localStorage.setItem('auth-user', JSON.stringify(response.data.user))
          
          return { success: true, user: response.data.user }
        } else {
          throw new Error(response.error || 'Registration failed')
        }
      } catch (error) {
        this.isAuthenticated = false
        this.user = null
        this.tokens = null
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async logout() {
      this.isLoading = true
      
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear state
        this.user = null
        this.tokens = null
        this.isAuthenticated = false
        
        // Clear localStorage
        localStorage.removeItem('auth-user')
        
        this.isLoading = false
      }
    },
    
    async fetchMe() {
      this.isLoading = true
      
      try {
        const response = await $fetch<ApiResponse<{ user: AuthUser & { teams?: any; player?: any } }>>('/api/auth/me')
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.isAuthenticated = true
          
          // Store user in localStorage
          localStorage.setItem('auth-user', JSON.stringify(response.data.user))
          
          return response.data.user
        } else {
          this.user = null
          this.isAuthenticated = false
          localStorage.removeItem('auth-user')
          throw new Error(response.error || 'Failed to fetch user')
        }
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('auth-user')
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async init() {
      // Try to restore session from localStorage
      const storedUser = localStorage.getItem('auth-user')
      
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser)
          this.isAuthenticated = true
          
          // Verify session is still valid
          await this.fetchMe()
        } catch (error) {
          this.clear()
        }
      }
    },
    
    clear() {
      this.user = null
      this.tokens = null
      this.isAuthenticated = false
      localStorage.removeItem('auth-user')
    },
  },
})
