import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@tix/graphql'
import type { Agent } from '@tix/graphql'
import gql from 'graphql-tag'

const ME_QUERY = gql`
  query Me {
    me {
      ... on Agent {
        id
        name
        email
        isAdmin
        __typename
      }
    }
  }
`

const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut {
      success
      errors {
        field
        message
        code
      }
    }
  }
`

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Agent | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)

  // Check authentication state by calling the me query
  async function checkAuth(): Promise<boolean> {
    isLoading.value = true
    try {
      const result = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })
      
      const meUser = result.data?.me
      if (meUser && meUser.__typename === 'Agent') {
        user.value = meUser as Agent
        return true
      }
      user.value = null
      return false
    } catch {
      user.value = null
      return false
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  // Set user after successful sign-in (user data comes from mutation response)
  function setUser(agent: Agent) {
    user.value = agent
    isInitialized.value = true
  }

  async function signOut() {
    try {
      await apolloClient.mutate({ mutation: SIGN_OUT_MUTATION })
    } catch {
      // Continue with local cleanup even if mutation fails
    }
    user.value = null
    await apolloClient.clearStore()
  }

  function hydrateUser(agent: Agent) {
    user.value = agent
  }

  // Listen for session expired events from Apollo error link
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:session-expired', () => {
      user.value = null
      apolloClient.clearStore()
    })
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    isInitialized,
    checkAuth,
    setUser,
    signOut,
    hydrateUser,
  }
})
