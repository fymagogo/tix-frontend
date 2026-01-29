<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const ME_QUERY = gql`
  query Me {
    me {
      ... on Customer {
        id
        email
        name
      }
    }
  }
`

const auth = useAuthStore()

// Fetch current user if we have a token but no user data
const { result, onResult } = useQuery(ME_QUERY, null, {
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
