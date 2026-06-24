import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Initialize auth store on app startup
  const authStore = useAuthStore()
  
  // Try to restore session
  await authStore.init()
  
  // Add auth store to nuxtApp context for middleware
  nuxtApp.provide('auth', authStore)
})
