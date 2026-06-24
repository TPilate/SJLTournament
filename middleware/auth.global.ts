import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware for public routes
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/tournaments',
    '/tournaments/[id]',
    '/matches',
    '/matches/[id]',
    '/teams',
    '/teams/[id]',
  ]
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => {
    // Handle dynamic routes
    if (route.includes('[id]')) {
      const routePattern = route.replace('[id]', '.*')
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(to.path)
    }
    return to.path === route
  })
  
  if (isPublicRoute) {
    return
  }
  
  // Check authentication
  const authStore = useAuthStore()
  
  // Initialize auth store
  await authStore.init()
  
  if (!authStore.isAuthenticated) {
    // Redirect to login with return url
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // For admin-only routes
  const adminRoutes = [
    '/admin',
    '/admin/*',
    '/tournaments/create',
    '/tournaments/[id]/edit',
    '/teams/create',
    '/matches/create',
  ]
  
  const isAdminRoute = adminRoutes.some(route => {
    if (route.includes('*')) {
      const prefix = route.replace('*', '')
      return to.path.startsWith(prefix)
    }
    if (route.includes('[id]')) {
      const routePattern = route.replace('[id]', '.*')
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(to.path)
    }
    return to.path === route
  })
  
  if (isAdminRoute && !authStore.isAdmin) {
    // Redirect to dashboard or show error
    return navigateTo('/dashboard')
  }
})
