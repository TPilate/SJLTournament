<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global imports and setup
import { useAuthStore } from '~/stores/auth'
import { useSocket } from '~/composables/useSocket'

// Initialize stores
const authStore = useAuthStore()
const socketStore = useSocket()

// Initialize auth on app mount
onMounted(() => {
  authStore.init()
})
</script>

<style>
/* Global styles */
@import '~/assets/css/main.css';

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Button hover effects */
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(55, 85, 105, 0.3);
}

.btn-outline:hover {
  transform: translateY(-1px);
}

/* Card hover effects */
.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Link styles */
a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  color: inherit;
}

/* Input focus styles */
.input-field:focus {
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
</style>
