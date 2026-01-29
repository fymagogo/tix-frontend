import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@tix/graphql'
import type { Agent } from '@tix/graphql'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<Agent | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)

  function setAuth(authToken: string, agent: Agent) {
    token.value = authToken
    user.value = agent
    localStorage.setItem('auth_token', authToken)
  }

  async function signOut() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    apolloClient.clearStore()
  }

  function hydrateUser(agent: Agent) {
    user.value = agent
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    setAuth,
    signOut,
    hydrateUser,
  }
})
