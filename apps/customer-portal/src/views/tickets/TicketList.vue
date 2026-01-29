<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { usePagination } from '@tix/graphql'
import { Button, Card, Badge, Pagination, Select, Spinner, EmptyState } from '@tix/ui'

const TICKETS_QUERY = gql`
  query CustomerTickets($filter: TicketFilterInput, $pagination: PaginationInput) {
    tickets(filter: $filter, pagination: $pagination) {
      items {
        id
        ticketNumber
        subject
        status
        createdAt
        updatedAt
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

const router = useRouter()
const statusFilter = ref('')

const { currentPage, paginationInput, totalPages, setPageInfo, goToPage } = usePagination(10)

const variables = computed(() => ({
  filter: statusFilter.value ? { status: statusFilter.value } : undefined,
  pagination: paginationInput.value,
}))

const { result, loading, refetch } = useQuery(TICKETS_QUERY, variables)

const tickets = computed(() => result.value?.tickets?.items ?? [])
const pageInfo = computed(() => result.value?.tickets?.pageInfo)

watch(pageInfo, (info) => {
  if (info) setPageInfo(info)
})

watch(statusFilter, () => {
  goToPage(1)
  refetch()
})

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'AGENT_ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
]

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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Tickets</h1>
        <p class="text-gray-600">View and manage your support requests</p>
      </div>
      <router-link to="/tickets/new">
        <Button>New Ticket</Button>
      </router-link>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="w-48">
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Filter by status"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12">
      <Spinner size="lg" />
    </div>

    <!-- Empty state -->
    <EmptyState
      v-else-if="tickets.length === 0"
      title="No tickets found"
      :description="statusFilter ? 'Try changing your filters' : 'Create your first ticket to get started'"
    >
      <template #action>
        <router-link to="/tickets/new">
          <Button>Create Ticket</Button>
        </router-link>
      </template>
    </EmptyState>

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
            </div>
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ ticket.subject }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              Created {{ formatDate(ticket.createdAt) }}
              <span v-if="ticket.updatedAt !== ticket.createdAt">
                · Updated {{ formatDate(ticket.updatedAt) }}
              </span>
            </p>
          </div>
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
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
