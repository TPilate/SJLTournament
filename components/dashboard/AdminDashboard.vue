<template>
  <div class="space-y-8">
    <!-- Stats Overview -->
    <div class="grid md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500">Total Tournaments</h3>
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats.totalTournaments }}</div>
        <div class="text-sm text-green-600 mt-2">
          {{ stats.activeTournaments }} active
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500">Total Teams</h3>
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats.totalTeams }}</div>
        <div class="text-sm text-blue-600 mt-2">
          {{ stats.totalPlayers }} players
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500">Total Matches</h3>
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats.totalMatches }}</div>
        <div class="text-sm text-purple-600 mt-2">
          {{ stats.completedMatches }} completed
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500">Total Users</h3>
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</div>
        <div class="text-sm text-orange-600 mt-2">
          {{ stats.adminUsers }} admins
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="card">
      <h2 class="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div class="grid md:grid-cols-3 gap-4">
        <NuxtLink to="/tournaments/create" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Create Tournament</h3>
            <p class="text-sm text-gray-600">Start a new tournament</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/teams/create" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Create Team</h3>
            <p class="text-sm text-gray-600">Add a new team</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/matches/create" class="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Create Match</h3>
            <p class="text-sm text-gray-600">Schedule a new match</p>
          </div>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-900">Recent Activity</h2>
        <NuxtLink to="/activity" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </NuxtLink>
      </div>
      
      <div class="space-y-4">
        <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">
              {{ activity.reason || 'Score updated' }}
            </p>
            <p class="text-sm text-gray-600">
              Match #{{ activity.matchId }} - {{ formatDate(activity.createdAt) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">
              {{ activity.newScoreA }} - {{ activity.newScoreB }}
            </p>
            <p class="text-xs text-gray-500">
              by {{ activity.editor?.pseudo || 'Admin' }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Tournaments -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-900">Recent Tournaments</h2>
        <NuxtLink to="/tournaments" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </NuxtLink>
      </div>
      
      <div class="space-y-4">
        <div v-for="tournament in recentTournaments" :key="tournament.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span class="text-primary-600 font-bold">{{ tournament.name.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ tournament.name }}</h3>
              <p class="text-sm text-gray-600">{{ tournament.format }} - {{ tournament.status }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">
              {{ tournament._count?.teams || 0 }} teams
            </p>
            <p class="text-sm text-gray-600">
              {{ tournament._count?.matches || 0 }} matches
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTournamentStore } from '~/stores/tournaments'
import { useMatchStore } from '~/stores/matches'

const tournamentStore = useTournamentStore()
const matchStore = useMatchStore()

const stats = ref({
  totalTournaments: 0,
  activeTournaments: 0,
  totalTeams: 0,
  totalPlayers: 0,
  totalMatches: 0,
  completedMatches: 0,
  totalUsers: 0,
  adminUsers: 0,
})

const recentActivity = ref<any[]>([])
const recentTournaments = ref<any[]>([])

// Fetch data
onMounted(async () => {
  try {
    // Fetch tournaments
    await tournamentStore.fetchTournaments({ pageSize: 10 })
    
    // Fetch matches
    await matchStore.fetchMatches({ pageSize: 50 })
    
    // Update stats
    stats.value.totalTournaments = tournamentStore.getTotal
    stats.value.activeTournaments = tournamentStore.getActiveTournaments.length
    stats.value.totalMatches = matchStore.getTotal
    stats.value.completedMatches = matchStore.getCompletedMatches.length
    
    // Get recent tournaments
    recentTournaments.value = tournamentStore.getTournaments.slice(0, 5)
    
    // For demo purposes, we'll use match events as activity
    // In a real app, you would fetch this from an API
    recentActivity.value = []
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})

// Format date
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
