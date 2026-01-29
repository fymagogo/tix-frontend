<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@tix/ui'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

async function handleSignOut() {
  await auth.signOut()
  router.push({ name: 'signin' })
}

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-gray-200">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <span class="text-2xl font-bold text-primary-600">Tix</span>
        <span class="ml-2 text-sm text-gray-500">Agent Portal</span>
      </div>

      <!-- Navigation -->
      <nav class="mt-6 px-3">
        <div class="space-y-1">
          <router-link
            to="/"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
              isActive('tickets')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tickets
          </router-link>

          <router-link
            to="/agents"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
              isActive('agents')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Agents
          </router-link>

          <router-link
            to="/export"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
              isActive('export')
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </router-link>
        </div>
      </nav>

      <!-- User menu at bottom -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-700">{{ auth.user?.name }}</p>
              <p v-if="auth.isAdmin" class="text-xs text-primary-600">Admin</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" @click="handleSignOut">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="ml-64 p-8">
      <slot />
    </main>
  </div>
</template>
