<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Register
      </h1>
      <p class="text-gray-600">
        Create your account
      </p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Pseudo -->
      <div>
        <label for="pseudo" class="label">
          Username (Optional)
        </label>
        <input
          id="pseudo"
          v-model="form.pseudo"
          type="text"
          class="input-field"
          placeholder="Enter your username"
        />
      </div>
      
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
      
      <!-- Confirm Password -->
      <div>
        <label for="confirmPassword" class="label">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          required
          class="input-field"
          placeholder="Confirm your password"
        />
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {{ error }}
      </div>
      
      <!-- Success Message -->
      <div v-if="success" class="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
        {{ success }}
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
          Registering...
        </span>
        <span v-else>
          Register
        </span>
      </button>
    </form>
    
    <!-- Footer Links -->
    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
          Login
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
  pseudo: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const error = ref<string>('')
const success = ref<string>('')
const isLoading = ref<boolean>(false)

const handleSubmit = async () => {
  try {
    // Validate form
    if (form.password !== form.confirmPassword) {
      error.value = 'Passwords do not match'
      return
    }
    
    if (form.password.length < 6) {
      error.value = 'Password must be at least 6 characters'
      return
    }
    
    isLoading.value = true
    error.value = ''
    success.value = ''
    
    await authStore.register(form.email, form.password, form.pseudo)
    
    success.value = 'Registration successful! Redirecting...'
    
    // Redirect to dashboard
    setTimeout(async () => {
      await navigateTo('/dashboard')
    }, 1000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed. Please try again.'
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
