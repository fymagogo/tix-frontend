<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const ME_QUERY = gql`
  query Me {
    me {
      ... on Agent {
        id
        email
        name
        isAdmin
      }
    }
  }
`

const auth = useAuthStore()
const toast = useToast()

// Check for welcome message from accept-invite flow
onMounted(() => {
  const welcomeMessage = sessionStorage.getItem('tix:welcomeMessage')
  if (welcomeMessage) {
    sessionStorage.removeItem('tix:welcomeMessage')
    toast.success(welcomeMessage)
  }
})

// Fetch current user if we have a token but no user data
const { onResult } = useQuery(ME_QUERY, null, {
  enabled: auth.isAuthenticated && !auth.user,
})

onResult((queryResult) => {
  if (queryResult.data?.me) {
    auth.hydrateUser(queryResult.data.me)
  }
})
</script>

<template>
  <AppLayout v-if="auth.isAuthenticated">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>
