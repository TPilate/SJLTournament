<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p class="text-gray-600 mt-1">
          Welcome back, {{ authStore.getUser?.pseudo || authStore.getUser?.email }}
        </p>
      </div>
      
      <div class="flex items-center space-x-4">
        <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getRoleColor(authStore.getUser?.role)">
          {{ authStore.getUser?.role }}
        </span>
      </div>
    </div>
    
    <!-- Admin Dashboard -->
    <div v-if="authStore.isAdmin">
      <AdminDashboard />
    </div>
    
    <!-- Player Dashboard -->
    <div v-else>
      <PlayerDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()

// Redirect if not authenticated
onMounted(() => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
  }
})

// Get role color
const getRoleColor = (role: string | undefined) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-600'
    case 'PLAYER':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
