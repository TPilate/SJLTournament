import { useAuthStore } from '~/stores/auth'
import type { Permission, UserRole } from '~/types'

export const usePermissions = () => {
  const authStore = useAuthStore()
  
  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!authStore.isAuthenticated) {
      return false
    }
    
    const user = authStore.getUser
    if (!user) return false
    
    // Import permissions from types
    const { ROLE_PERMISSIONS } = useTypes()
    
    const permissions = ROLE_PERMISSIONS[user.role as UserRole] || []
    return permissions.includes(permission)
  }
  
  // Check multiple permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p))
  }
  
  // Check all permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p))
  }
  
  // Check if user is admin
  const isAdmin = (): boolean => {
    return authStore.isAdmin
  }
  
  // Check if user is player
  const isPlayer = (): boolean => {
    return authStore.isPlayer
  }
  
  // Check if user can edit a specific match
  const canEditMatch = (match: any): boolean => {
    if (!authStore.isAuthenticated) {
      return false
    }
    
    const user = authStore.getUser
    if (!user) return false
    
    // Admin can edit any match
    if (user.role === 'ADMIN') return true
    
    // Player can only edit matches where their team is the referee
    if (!match.refereeTeamId) return false
    
    // Check if user is in the referee team
    // This would need to check the user's teams
    // For now, we'll assume the match object has the referee team info
    return false
  }
  
  // Check if user can view a specific tournament
  const canViewTournament = (tournament: any): boolean => {
    // Public read access for tournaments
    return true
  }
  
  // Check if user can manage a specific tournament
  const canManageTournament = (tournament: any): boolean => {
    if (!authStore.isAuthenticated) {
      return false
    }
    
    const user = authStore.getUser
    if (!user) return false
    
    // Admin can manage any tournament
    if (user.role === 'ADMIN') return true
    
    // For now, only admin can manage tournaments
    return false
  }
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isPlayer,
    canEditMatch,
    canViewTournament,
    canManageTournament,
  }
}

// Helper to import types
export const useTypes = () => {
  const { ROLE_PERMISSIONS } = require('~/types')
  return { ROLE_PERMISSIONS }
}
