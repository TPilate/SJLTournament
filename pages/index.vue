<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="text-center py-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Welcome to SJL Tournament
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Manage and participate in multi-team tournaments with real-time scoring
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/tournaments" class="btn-primary inline-flex items-center justify-center">
          View Tournaments
        </NuxtLink>
        <NuxtLink to="/register" class="btn-outline inline-flex items-center justify-center" v-if="!authStore.isAuthenticated">
          Get Started
        </NuxtLink>
        <NuxtLink to="/dashboard" class="btn-outline inline-flex items-center justify-center" v-else>
          Go to Dashboard
        </NuxtLink>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
        Features
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="card text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Tournament Management</h3>
          <p class="text-gray-600">
            Create and manage tournaments with various formats: round robin, elimination, or hybrid
          </p>
        </div>
        
        <!-- Feature 2 -->
        <div class="card text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Team Management</h3>
          <p class="text-gray-600">
            Organize teams with up to 6 players each and manage team participation
          </p>
        </div>
        
        <!-- Feature 3 -->
        <div class="card text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Real-time Scoring</h3>
          <p class="text-gray-600">
            Live score updates with WebSocket technology for instant results
          </p>
        </div>
      </div>
    </section>
    
    <!-- Recent Tournaments Section -->
    <section class="py-16" v-if="tournamentStore.getTournaments.length > 0">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
        Recent Tournaments
      </h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="tournament in tournamentStore.getTournaments.slice(0, 6)" :key="tournament.id" class="card">
          <h3 class="text-lg font-bold text-gray-900 mb-2">
            {{ tournament.name }}
          </h3>
          <p class="text-gray-600 text-sm mb-4">
            {{ formatDate(tournament.createdAt) }}
          </p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">
              {{ tournament.format }}
            </span>
            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusColor(tournament.status)">
              {{ tournament.status }}
            </span>
          </div>
          <NuxtLink :to="`/tournaments/${tournament.id}`" class="mt-4 inline-block btn-outline text-sm">
            View Details
          </NuxtLink>
        </div>
      </div>
      
      <div class="text-center mt-8">
        <NuxtLink to="/tournaments" class="btn-secondary">
          View All Tournaments
        </NuxtLink>
      </div>
    </section>
    
    <!-- Stats Section -->
    <section class="py-16 bg-white rounded-xl shadow-sm" v-if="authStore.isAuthenticated">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">
          Your Tournament Stats
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-primary-600 mb-2">
              {{ tournamentStore.getTotal }}
            </div>
            <div class="text-gray-600">
              Total Tournaments
            </div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600 mb-2">
              {{ matchStore.getTotal }}
            </div>
            <div class="text-gray-600">
              Total Matches
            </div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600 mb-2">
              {{ matchStore.getInProgressMatches.length }}
            </div>
            <div class="text-gray-600">
              Live Matches
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTournamentStore } from '~/stores/tournaments'
import { useMatchStore } from '~/stores/matches'

const authStore = useAuthStore()
const tournamentStore = useTournamentStore()
const matchStore = useMatchStore()

// Fetch data on component mount
onMounted(async () => {
  try {
    await tournamentStore.fetchTournaments({ pageSize: 6 })
    await matchStore.fetchMatches({ pageSize: 100 })
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

// Format date
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-600'
    case 'REGISTRATION_OPEN':
      return 'bg-blue-100 text-blue-600'
    case 'IN_PROGRESS':
      return 'bg-green-100 text-green-600'
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-600'
    case 'CANCELLED':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
