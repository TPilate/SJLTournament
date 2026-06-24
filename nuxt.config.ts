import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui',
  ],
  
  // TypeScript support
  typescript: {
    strict: true,
    typeCheck: true,
  },
  
  // Tailwind CSS
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
  },
  
  // Pinia
  pinia: {
    autoImports: [
      'defineStore',
      ['defineStore', 'definePiniaStore'],
    ],
  },
  
  // Runtime configuration
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/sjl_tournament',
    socketIoPort: process.env.SOCKET_IO_PORT || 3001,
  },
  
  // Server directory
  serverDir: 'server',
  
  // Build configuration
  build: {
    transpile: ['socket.io-client'],
  },
  
  // App configuration
  app: {
    head: {
      title: 'SJL Tournament',
      meta: [
        { name: 'description', content: 'Gestion de tournois multi-équipes' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      charset: 'utf-8',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  
  // CSS
  css: [
    '~/assets/css/main.css',
  ],
  
  // ESLint
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
