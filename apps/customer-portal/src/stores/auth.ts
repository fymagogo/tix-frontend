import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@tix/graphql'
import type { Customer } from '@tix/graphql'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<Customer | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(authToken: string, customer: Customer) {
    token.value = authToken
    user.value = customer
    localStorage.setItem('auth_token', authToken)
  }

  async function signOut() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    apolloClient.clearStore()
  }

  function hydrateUser(customer: Customer) {
    user.value = customer
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    signOut,
    hydrateUser,
  }
})
