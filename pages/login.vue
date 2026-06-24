<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Login
      </h1>
      <p class="text-gray-600">
        Sign in to your account
      </p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Email -->
      <div>
        <label for="email" class="label">
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="input-field"
          placeholder="Enter your email"
        />
      </div>
      
      <!-- Password -->
      <div>
        <label for="password" class="label">
          Password
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          class="input-field"
          placeholder="Enter your password"
        />
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {{ error }}
      </div>
      
      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full btn-primary"
      >
        <span v-if="isLoading">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
        <span v-else>
          Login
        </span>
      </button>
    </form>
    
    <!-- Footer Links -->
    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Don't have an account?
        <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
          Register
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const error = ref<string>('')
const isLoading = ref<boolean>(false)

const handleSubmit = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    await authStore.login(form.email, form.password)
    
    // Redirect to dashboard or home
    await navigateTo('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  }
})
</script>

<style scoped>
/* Add any custom styles here */
</style>
