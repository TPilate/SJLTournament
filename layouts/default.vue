<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-lg">SJL</span>
              </div>
              <span class="text-xl font-bold text-gray-900">Tournament</span>
            </NuxtLink>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Home
            </NuxtLink>
            <NuxtLink to="/tournaments" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Tournaments
            </NuxtLink>
            <NuxtLink to="/teams" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Teams
            </NuxtLink>
            <NuxtLink to="/matches" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Matches
            </NuxtLink>
          </div>
          
          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <NuxtLink to="/dashboard" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Dashboard
              </NuxtLink>
              <button @click="handleLogout" class="btn-outline">
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn-outline">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="btn-primary">
                Register
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p class="text-gray-400">
            &copy; {{ new Date().getFullYear() }} SJL Tournament. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    await navigateTo('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
