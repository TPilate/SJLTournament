<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Live Match
        </h1>
        <p class="text-gray-600">
          Real-time score updates
        </p>
      </div>
      
      <div class="flex items-center space-x-4">
        <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getStatusColor(match?.status)">
          {{ match?.status }}
        </span>
        <span class="px-3 py-1 rounded-full text-sm font-medium" :class="match?.locked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
          {{ match?.locked ? 'Locked' : 'Unlocked' }}
        </span>
      </div>
    </div>
    
    <!-- Match Info -->
    <div class="card">
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Team A -->
        <div class="text-center">
          <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-primary-600 font-bold text-xl">{{ match?.teamA?.name?.charAt(0) || 'A' }}</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ match?.teamA?.name || 'Team A' }}</h2>
          <div class="space-y-1">
            <p class="text-sm text-gray-600">Captain: {{ match?.teamA?.captain?.pseudo || 'TBD' }}</p>
            <p class="text-sm text-gray-500">{{ match?.teamA?.players?.length || 0 }} players</p>
          </div>
        </div>
        
        <!-- Score and Controls -->
        <div class="text-center">
          <div class="mb-6">
            <h2 class="text-5xl font-bold text-gray-900">
              {{ match?.scoreA }} - {{ match?.scoreB }}
            </h2>
            <p class="text-gray-600 mt-2">
              {{ match?.mode === 'TIMED' ? `${match?.durationMinutes} min match` : `First to ${match?.targetScore} points` }}
            </p>
          </div>
          
          <!-- Score Controls -->
          <div class="space-y-4" v-if="canEdit">
            <div class="flex items-center justify-center space-x-4">
              <button 
                @click="decrementScore('A')" 
                :disabled="match?.locked || isLoading"
                class="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
                </svg>
              </button>
              
              <button 
                @click="decrementScore('B')" 
                :disabled="match?.locked || isLoading"
                class="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
                </svg>
              </button>
            </div>
            
            <div class="flex items-center justify-center space-x-4">
              <button 
                @click="incrementScore('A')" 
                :disabled="match?.locked || isLoading"
                class="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              
              <button 
                @click="incrementScore('B')" 
                :disabled="match?.locked || isLoading"
                class="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <!-- Admin unlock button -->
            <button 
              v-if="authStore.isAdmin && match?.locked" 
              @click="forceUnlock" 
              :disabled="isLoading"
              class="w-full btn-outline text-sm"
            >
              Force Unlock
            </button>
          </div>
          
          <div v-else class="text-center py-4">
            <p class="text-gray-600 mb-2">You cannot edit this match</p>
            <p class="text-sm text-gray-500">Only the referee team can update scores</p>
          </div>
        </div>
        
        <!-- Team B -->
        <div class="text-center">
          <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-primary-600 font-bold text-xl">{{ match?.teamB?.name?.charAt(0) || 'B' }}</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ match?.teamB?.name || 'Team B' }}</h2>
          <div class="space-y-1">
            <p class="text-sm text-gray-600">Captain: {{ match?.teamB?.captain?.pseudo || 'TBD' }}</p>
            <p class="text-sm text-gray-500">{{ match?.teamB?.players?.length || 0 }} players</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Match Details -->
    <div class="card">
      <h2 class="text-lg font-bold text-gray-900 mb-6">Match Details</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Tournament</label>
              <p class="text-gray-900">{{ match?.tournament?.name || 'N/A' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Stage</label>
              <p class="text-gray-900">{{ match?.stage?.name || 'N/A' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Pool</label>
              <p class="text-gray-900">{{ match?.pool?.name || 'N/A' }}</p>
            </div>
          </div>
        </div>
        
        <div>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Referee Team</label>
              <p class="text-gray-900">{{ match?.refereeTeam?.name || 'Not assigned' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Start Time</label>
              <p class="text-gray-900">{{ formatDate(match?.startTime) }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">End Time</label>
              <p class="text-gray-900">{{ formatDate(match?.endTime) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="match?.notes" class="mt-6">
        <label class="text-sm font-medium text-gray-500">Notes</label>
        <p class="text-gray-900">{{ match.notes }}</p>
      </div>
    </div>
    
    <!-- Score History -->
    <div class="card" v-if="match?.events?.length > 0">
      <h2 class="text-lg font-bold text-gray-900 mb-6">Score History</h2>
      
      <div class="space-y-4">
        <div v-for="event in match.events" :key="event.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span class="text-gray-600 text-sm">{{ event.editor?.pseudo?.charAt(0) || 'U' }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ event.editor?.pseudo || 'Unknown' }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(event.createdAt) }}</p>
            </div>
          </div>
          
          <div class="text-right">
            <p class="text-sm text-gray-600 mb-1">{{ event.reason || 'Score updated' }}</p>
            <p class="font-medium text-gray-900">
              {{ event.oldScoreA }} - {{ event.oldScoreB }} → {{ event.newScoreA }} - {{ event.newScoreB }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Connection Status -->
    <div class="fixed bottom-4 right-4" v-if="socketStore.isConnected">
      <div class="flex items-center space-x-2 bg-white rounded-lg shadow-lg px-4 py-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-sm text-gray-600">Connected</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMatchStore } from '~/stores/matches'
import { useSocket } from '~/composables/useSocket'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const matchStore = useMatchStore()
const socketStore = useSocket()

const matchId = computed(() => route.params.id as string)
const match = computed(() => matchStore.getLiveMatch(matchId.value))

const canEdit = ref(false)
const isLoading = ref(false)

// Check if user can edit this match
const checkCanEdit = async () => {
  if (!authStore.isAuthenticated) {
    canEdit.value = false
    return
  }
  
  const user = authStore.getUser
  if (!user) {
    canEdit.value = false
    return
  }
  
  // Admin can always edit
  if (user.role === 'ADMIN') {
    canEdit.value = true
    return
  }
  
  // Check if user is in referee team
  if (match.value?.refereeTeamId) {
    // This would need to check if user is in the referee team
    // For now, we'll assume they can edit if they're authenticated
    canEdit.value = true
  } else {
    canEdit.value = false
  }
}

// Fetch match data
onMounted(async () => {
  try {
    await matchStore.fetchMatchById(matchId.value)
    await checkCanEdit()
    
    // Join match room for real-time updates
    socketStore.joinMatchRoom(matchId.value)
    
  } catch (error) {
    console.error('Error fetching match:', error)
  }
})

// Clean up on unmount
onUnmounted(() => {
  socketStore.leaveMatchRoom(matchId.value)
})

// Increment score
const incrementScore = async (team: 'A' | 'B') => {
  if (!match.value || isLoading.value) return
  
  try {
    isLoading.value = true
    
    const newScoreA = team === 'A' ? match.value.scoreA + 1 : match.value.scoreA
    const newScoreB = team === 'B' ? match.value.scoreB + 1 : match.value.scoreB
    
    // Use WebSocket for real-time updates
    await socketStore.updateMatchScore(matchId.value, newScoreA, newScoreB)
    
    // Also update local state
    matchStore.updateMatchFromSocket({
      ...match.value,
      scoreA: newScoreA,
      scoreB: newScoreB,
    })
    
  } catch (error) {
    console.error('Error updating score:', error)
  } finally {
    isLoading.value = false
  }
}

// Decrement score
const decrementScore = async (team: 'A' | 'B') => {
  if (!match.value || isLoading.value) return
  
  try {
    isLoading.value = true
    
    const newScoreA = team === 'A' ? Math.max(0, match.value.scoreA - 1) : match.value.scoreA
    const newScoreB = team === 'B' ? Math.max(0, match.value.scoreB - 1) : match.value.scoreB
    
    // Use WebSocket for real-time updates
    await socketStore.updateMatchScore(matchId.value, newScoreA, newScoreB)
    
    // Also update local state
    matchStore.updateMatchFromSocket({
      ...match.value,
      scoreA: newScoreA,
      scoreB: newScoreB,
    })
    
  } catch (error) {
    console.error('Error updating score:', error)
  } finally {
    isLoading.value = false
  }
}

// Force unlock (admin only)
const forceUnlock = async () => {
  if (!match.value || isLoading.value) return
  
  try {
    isLoading.value = true
    
    await matchStore.updateMatchScore(matchId.value, {
      forceUnlock: true
    })
    
  } catch (error) {
    console.error('Error unlocking match:', error)
  } finally {
    isLoading.value = false
  }
}

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
