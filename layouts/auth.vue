<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
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
          
          <!-- Auth Links -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/login" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="btn-primary">
              Register
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <p class="text-gray-400 text-sm">
            &copy; {{ new Date().getFullYear() }} SJL Tournament. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Auth layout - used for login, register, etc.
</script>

<style scoped>
/* Add any custom styles here */
</style>
