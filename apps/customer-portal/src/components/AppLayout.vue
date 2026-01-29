<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@tix/ui'

const router = useRouter()
const auth = useAuthStore()
const mobileMenuOpen = ref(false)

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
            <span class="ml-2 text-sm text-gray-500 hidden sm:inline">Customer Portal</span>
          </router-link>

          <!-- Desktop Navigation -->
          <nav class="hidden sm:flex items-center space-x-4">
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

          <!-- Desktop User menu -->
          <div class="hidden sm:flex items-center space-x-4">
            <span v-if="auth.user" class="text-sm text-gray-700">
              {{ auth.user.name }}
            </span>
            <Button variant="secondary" size="sm" @click="handleSignOut">
              Sign Out
            </Button>
          </div>

          <!-- Mobile menu button -->
          <button
            type="button"
            class="sm:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="sr-only">Toggle menu</span>
            <svg v-if="!mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="mobileMenuOpen" class="sm:hidden border-t border-gray-200 bg-white">
          <div class="space-y-1 px-4 py-3">
            <router-link
              to="/"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              @click="mobileMenuOpen = false"
            >
              My Tickets
            </router-link>
            <router-link
              to="/tickets/new"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              @click="mobileMenuOpen = false"
            >
              New Ticket
            </router-link>
          </div>
          <div class="border-t border-gray-200 px-4 py-3">
            <div class="flex items-center justify-between">
              <span v-if="auth.user" class="text-sm font-medium text-gray-700">
                {{ auth.user.name }}
              </span>
              <Button variant="secondary" size="sm" @click="handleSignOut">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <slot />
    </main>
  </div>
</template>
