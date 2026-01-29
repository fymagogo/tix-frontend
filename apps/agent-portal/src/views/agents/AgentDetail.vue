<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { Card, Badge, Spinner, Alert } from '@tix/ui'

const AGENT_QUERY = gql`
  query Agent($id: ID!) {
    agent(id: $id) {
      id
      email
      name
      isAdmin
      createdAt
      updatedAt
      invitedBy {
        id
        name
      }
      activeTickets {
        id
        ticketNumber
        subject
        status
        createdAt
      }
      history {
        id
        event
        occurredAt
        actor {
          ... on Customer {
            id
            name
            __typename
          }
          ... on Agent {
            id
            name
            __typename
          }
        }
      }
    }
  }
`

const route = useRoute()

const agentId = computed(() => route.params.id as string)

const { result, loading } = useQuery(AGENT_QUERY, { id: agentId })

const agent = computed(() => result.value?.agent)
const activeTickets = computed(() => agent.value?.activeTickets ?? [])
const history = computed(() => agent.value?.history ?? [])

const showHistory = ref(false)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-4xl">
    <!-- Back link -->
    <router-link to="/agents" class="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">
      ← Back to agents
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="py-12">
      <Spinner size="lg" />
    </div>

    <!-- Agent details -->
    <div v-else-if="agent" class="space-y-6">
      <!-- Header -->
      <Card>
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <h1 class="text-2xl font-bold text-gray-900">{{ agent.name }}</h1>
              <Badge v-if="agent.isAdmin" variant="hold">Admin</Badge>
            </div>
            <p class="text-gray-500">{{ agent.email }}</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Role:</span>
              <span class="ml-2 text-gray-900">{{ agent.isAdmin ? 'Administrator' : 'Agent' }}</span>
            </div>
            <div>
              <span class="text-gray-500">Joined:</span>
              <span class="ml-2 text-gray-900">{{ formatDate(agent.createdAt) }}</span>
            </div>
            <div v-if="agent.invitedBy">
              <span class="text-gray-500">Invited by:</span>
              <span class="ml-2 text-gray-900">{{ agent.invitedBy.name }}</span>
            </div>
            <div>
              <span class="text-gray-500">Active Tickets:</span>
              <span class="ml-2 text-gray-900">{{ activeTickets.length }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Active Tickets -->
      <Card v-if="activeTickets.length > 0">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Active Tickets ({{ activeTickets.length }})
        </h2>

        <div class="divide-y divide-gray-200">
          <router-link
            v-for="ticket in activeTickets"
            :key="ticket.id"
            :to="`/tickets/${ticket.id}`"
            class="block py-3 hover:bg-gray-50 -mx-4 px-4 transition"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-medium text-gray-500">#{{ ticket.ticketNumber }}</span>
                <span class="ml-2 text-gray-900">{{ ticket.subject }}</span>
              </div>
              <Badge :variant="ticket.status" />
            </div>
          </router-link>
        </div>
      </Card>

      <!-- History -->
      <Card>
        <button
          class="w-full flex items-center justify-between text-left"
          @click="showHistory = !showHistory"
        >
          <h2 class="text-lg font-medium text-gray-900">
            History ({{ history.length }})
          </h2>
          <span class="text-gray-500 text-xl">{{ showHistory ? '−' : '+' }}</span>
        </button>

        <div v-if="showHistory" class="mt-4 space-y-3">
          <div v-if="history.length === 0" class="text-gray-500 italic">
            No history available.
          </div>

          <div
            v-for="entry in history"
            :key="entry.id"
            class="border-l-2 border-gray-200 pl-4 py-2"
          >
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-900">{{ entry.event }}</span>
              <span class="text-gray-500">•</span>
              <span class="text-gray-500">{{ formatDate(entry.occurredAt) }}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Not found -->
    <Alert v-else type="error">
      Agent not found
    </Alert>
  </div>
</template>
