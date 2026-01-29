<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@tix/ui'

const router = useRouter()
const auth = useAuthStore()

async function handleSignOut() {
  await auth.signOut()
  router.push({ name: 'signin' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center">
            <span class="text-2xl font-bold text-primary-600">Tix</span>
            <span class="ml-2 text-sm text-gray-500">Customer Portal</span>
          </router-link>

          <!-- Navigation -->
          <nav class="flex items-center space-x-4">
            <router-link
              to="/"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              active-class="text-primary-600"
            >
              My Tickets
            </router-link>
            <router-link
              to="/tickets/new"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              active-class="text-primary-600"
            >
              New Ticket
            </router-link>
          </nav>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <span v-if="auth.user" class="text-sm text-gray-700">
              {{ auth.user.name }}
            </span>
            <Button variant="secondary" size="sm" @click="handleSignOut">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
