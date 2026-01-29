<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { usePagination } from '@tix/graphql'
import { useAuthStore } from '@/stores/auth'
import { Button, Card, Badge, Pagination, Select, Spinner, EmptyState, Input } from '@tix/ui'

const TICKETS_QUERY = gql`
  query AgentTickets($filter: TicketFilterInput, $pagination: PaginationInput, $orderBy: TicketOrderByInput) {
    tickets(filter: $filter, pagination: $pagination, orderBy: $orderBy) {
      items {
        id
        ticketNumber
        subject
        status
        createdAt
        updatedAt
        customer {
          id
          name
          email
        }
        assignedAgent {
          id
          name
        }
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        hasNextPage
        hasPreviousPage
        perPage
      }
    }
  }
`

const ASSIGN_TICKET_MUTATION = gql`
  mutation ClaimTicket($ticketId: ID!, $agentId: ID!) {
    assignTicket(input: { ticketId: $ticketId, agentId: $agentId }) {
      ticket {
        id
        status
        assignedAgent {
          id
          name
        }
      }
      errors
    }
  }
`

const router = useRouter()
const auth = useAuthStore()

const statusFilter = ref('')
const assignedToMeFilter = ref(true)  // Default to showing only my tickets
const unassignedFilter = ref(false)
const searchQuery = ref('')
const sortField = ref('CREATED_AT')
const sortDirection = ref('DESC')

const { currentPage, paginationInput, totalPages, totalCount, setPageInfo, goToPage } = usePagination(20)

const variables = computed(() => ({
  filter: {
    status: unassignedFilter.value ? 'NEW' : (statusFilter.value || undefined),
    assignedToMe: assignedToMeFilter.value || undefined,
    search: searchQuery.value || undefined,
  },
  pagination: paginationInput.value,
  orderBy: {
    field: sortField.value,
    direction: sortDirection.value,
  },
}))

const { result, loading, refetch } = useQuery(TICKETS_QUERY, variables)
const { mutate: assignTicket, loading: claiming } = useMutation(ASSIGN_TICKET_MUTATION)

const tickets = computed(() => result.value?.tickets?.items ?? [])
const pageInfo = computed(() => result.value?.tickets?.pageInfo)

watch(pageInfo, (info) => {
  if (info) setPageInfo(info)
})

watch([statusFilter, assignedToMeFilter, unassignedFilter, searchQuery, sortField, sortDirection], () => {
  goToPage(1)
})

// Clear status filter when unassigned is selected
watch(unassignedFilter, (val) => {
  if (val) {
    statusFilter.value = ''
    assignedToMeFilter.value = false
  }
})

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'AGENT_ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
]

const sortOptions = [
  { value: 'CREATED_AT:DESC', label: 'Newest First' },
  { value: 'CREATED_AT:ASC', label: 'Oldest First' },
  { value: 'UPDATED_AT:DESC', label: 'Recently Updated' },
  { value: 'STATUS:ASC', label: 'Status' },
]

const selectedSort = computed({
  get: () => `${sortField.value}:${sortDirection.value}`,
  set: (value: string) => {
    const [field, direction] = value.split(':')
    sortField.value = field
    sortDirection.value = direction
  },
})

async function claimTicket(ticketId: string, event: Event) {
  event.stopPropagation()
  
  if (!auth.user?.id) return
  
  try {
    await assignTicket({
      ticketId,
      agentId: auth.user.id,
    })
    await refetch()
  } catch (error) {
    console.error('Failed to claim ticket:', error)
  }
}

function viewTicket(id: string) {
  router.push(`/tickets/${id}`)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Tickets</h1>
      <p class="text-gray-600">Manage and respond to support requests</p>
    </div>

    <!-- Filters -->
    <Card :padding="false" class="p-4">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <Input
            v-model="searchQuery"
            placeholder="Search tickets..."
            type="search"
          />
        </div>
        <div class="w-40">
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            :disabled="unassignedFilter"
          />
        </div>
        <div class="w-48">
          <Select
            v-model="selectedSort"
            :options="sortOptions"
          />
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="unassignedFilter"
            type="checkbox"
            class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span class="text-sm text-gray-700">Unassigned only</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="assignedToMeFilter"
            type="checkbox"
            :disabled="unassignedFilter"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-gray-700">My tickets only</span>
        </label>
      </div>
    </Card>

    <!-- Stats bar -->
    <div class="text-sm text-gray-600">
      {{ totalCount }} ticket{{ totalCount !== 1 ? 's' : '' }} found
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12">
      <Spinner size="lg" />
    </div>

    <!-- Empty state -->
    <EmptyState
      v-else-if="tickets.length === 0"
      title="No tickets found"
      description="Try adjusting your filters"
    />

    <!-- Ticket list -->
    <div v-else class="space-y-4">
      <Card
        v-for="ticket in tickets"
        :key="ticket.id"
        clickable
        @click="viewTicket(ticket.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-medium text-gray-500">
                #{{ ticket.ticketNumber }}
              </span>
              <Badge :variant="ticket.status" />
              <span
                v-if="ticket.assignedAgent?.id === auth.user?.id"
                class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full"
              >
                Assigned to you
              </span>
              <span
                v-else-if="!ticket.assignedAgent"
                class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
              >
                Unassigned
              </span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ ticket.subject }}
            </h3>
            <div class="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4">
              <span>{{ ticket.customer.name }} ({{ ticket.customer.email }})</span>
              <span>Created {{ formatDate(ticket.createdAt) }}</span>
              <span v-if="ticket.assignedAgent">
                Agent: {{ ticket.assignedAgent.name }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              v-if="!ticket.assignedAgent"
              size="sm"
              variant="primary"
              :loading="claiming"
              @click="claimTicket(ticket.id, $event)"
            >
              Claim
            </Button>
            <svg class="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pt-4">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change="goToPage"
        />
      </div>
    </div>
  </div>
</template>
