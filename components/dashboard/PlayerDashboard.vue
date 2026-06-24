<template>
  <div class="space-y-8">
    <!-- My Teams Section -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-900">My Teams</h2>
        <NuxtLink to="/teams" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </NuxtLink>
      </div>
      
      <div v-if="teams.length > 0" class="space-y-4">
        <div v-for="team in teams" :key="team.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span class="text-primary-600 font-bold">{{ team.name.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ team.name }}</h3>
              <p class="text-sm text-gray-600">
                Captain: {{ team.captain?.pseudo || team.captain?.email }}
              </p>
              <p class="text-sm text-gray-500">
                {{ team.players?.length || 1 }} / {{ team.tournament?.maxPlayersPerTeam || 6 }} players
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">
              {{ team.tournament?.name || 'Unknown Tournament' }}
            </p>
            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusColor(team.tournament?.status)">
              {{ team.tournament?.status }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-600 mb-4">You are not in any teams yet.</p>
        <NuxtLink to="/teams" class="btn-primary">
          Join a Team
        </NuxtLink>
      </div>
    </div>
    
    <!-- My Matches Section -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Matches to Play -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-6">
          Matches to Play
        </h2>
        
        <div v-if="matchesToPlay.length > 0" class="space-y-4">
          <div v-for="match in matchesToPlay" :key="match.id" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                  PLAY
                </span>
                <span class="text-sm text-gray-600">
                  {{ formatDate(match.startTime) }}
                </span>
              </div>
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getMatchStatusColor(match.status)">
                {{ match.status }}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-center">
                  <div class="font-medium text-gray-900">{{ match.teamA?.name || 'TBD' }}</div>
                </div>
                <div class="text-gray-400">VS</div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">{{ match.teamB?.name || 'TBD' }}</div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="font-bold text-gray-900">
                  {{ match.scoreA }} - {{ match.scoreB }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ match.mode }} mode
                </div>
              </div>
            </div>
            
            <NuxtLink :to="`/matches/${match.id}`" class="mt-2 inline-block text-primary-600 hover:text-primary-700 text-sm">
              View Match
            </NuxtLink>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-600">No upcoming matches to play.</p>
        </div>
      </div>
      
      <!-- Matches to Referee -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-6">
          Matches to Referee
        </h2>
        
        <div v-if="matchesToReferee.length > 0" class="space-y-4">
          <div v-for="match in matchesToReferee" :key="match.id" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                  REFEREE
                </span>
                <span class="text-sm text-gray-600">
                  {{ formatDate(match.startTime) }}
                </span>
              </div>
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getMatchStatusColor(match.status)">
                {{ match.status }}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-center">
                  <div class="font-medium text-gray-900">{{ match.teamA?.name || 'TBD' }}</div>
                </div>
                <div class="text-gray-400">VS</div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">{{ match.teamB?.name || 'TBD' }}</div>
                </div>
              </div>
              
              <div class="text-right">
                <div class="font-bold text-gray-900">
                  {{ match.scoreA }} - {{ match.scoreB }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ match.mode }} mode
                </div>
              </div>
            </div>
            
            <div class="mt-2 flex space-x-2">
              <NuxtLink :to="`/matches/${match.id}/live`" class="btn-primary text-sm">
                Live Score
              </NuxtLink>
              <NuxtLink :to="`/matches/${match.id}`" class="btn-outline text-sm">
                Details
              </NuxtLink>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-600">No matches to referee.</p>
        </div>
      </div>
    </div>
    
    <!-- Past Matches -->
    <div class="card">
      <h2 class="text-lg font-bold text-gray-900 mb-6">
        Past Matches
      </h2>
      
      <div v-if="pastMatches.length > 0" class="space-y-4">
        <div v-for="match in pastMatches.slice(0, 5)" :key="match.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div class="text-center">
              <div class="font-medium text-gray-900">{{ match.teamA?.name || 'TBD' }}</div>
            </div>
            <div class="text-gray-400">VS</div>
            <div class="text-center">
              <div class="font-medium text-gray-900">{{ match.teamB?.name || 'TBD' }}</div>
            </div>
          </div>
          
          <div class="text-right">
            <div class="font-bold text-gray-900">
              {{ match.scoreA }} - {{ match.scoreB }}
            </div>
            <div class="text-sm text-gray-600">
              {{ formatDate(match.endTime || match.startTime) }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-600">No past matches.</p>
      </div>
    </div>
    
    <!-- Quick Stats -->
    <div class="grid md:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="text-3xl font-bold text-primary-600 mb-2">
          {{ stats.totalMatches }}
        </div>
        <div class="text-gray-600">
          Total Matches
        </div>
      </div>
      
      <div class="card text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">
          {{ stats.wins }}
        </div>
        <div class="text-gray-600">
          Wins
        </div>
      </div>
      
      <div class="card text-center">
        <div class="text-3xl font-bold text-red-600 mb-2">
          {{ stats.losses }}
        </div>
        <div class="text-gray-600">
          Losses
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTournamentStore } from '~/stores/tournaments'
import { useMatchStore } from '~/stores/matches'

const authStore = useAuthStore()
const tournamentStore = useTournamentStore()
const matchStore = useMatchStore()

const teams = ref<any[]>([])
const matchesToPlay = ref<any[]>([])
const matchesToReferee = ref<any[]>([])
const pastMatches = ref<any[]>([])

const stats = ref({
  totalMatches: 0,
  wins: 0,
  losses: 0,
})

// Fetch data
onMounted(async () => {
  try {
    // Fetch user data
    await authStore.fetchMe()
    
    // Fetch tournaments
    await tournamentStore.fetchTournaments({ pageSize: 50 })
    
    // Fetch matches
    await matchStore.fetchMatches({ pageSize: 100 })
    
    // Get user's teams
    const user = authStore.getUser
    if (user) {
      // This would normally come from the API
      // For now, we'll simulate it
      teams.value = []
      matchesToPlay.value = []
      matchesToReferee.value = []
      pastMatches.value = []
      
      // Update stats
      stats.value.totalMatches = matchStore.getTotal
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})

// Format date
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'TBD'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status color
const getStatusColor = (status: string | undefined) => {
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

// Get match status color
const getMatchStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-gray-100 text-gray-600'
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
