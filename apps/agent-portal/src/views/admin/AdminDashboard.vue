<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { Card, Spinner, EmptyState } from '@tix/ui'

const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalTickets
      openTickets
      closedTickets
      unassignedTickets
      ticketsByStatus {
        status
        count
      }
      averageResolutionTimeHours
      ticketsCreatedToday
      ticketsClosedToday
      ticketsCreatedThisWeek
      ticketsClosedThisWeek
    }
    allAgentsStats {
      agent {
        id
        name
        email
      }
      assignedTickets
      openTickets
      closedTickets
      closedThisWeek
      closedThisMonth
      averageResolutionTimeHours
    }
  }
`

const { result, loading, error } = useQuery(DASHBOARD_STATS_QUERY)

const stats = computed(() => result.value?.dashboardStats)
const agentStats = computed(() => result.value?.allAgentsStats ?? [])

function formatHours(hours: number | null): string {
  if (hours === null) return 'N/A'
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 24) return `${hours.toFixed(1)} hrs`
  return `${(hours / 24).toFixed(1)} days`
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'New',
    agent_assigned: 'Assigned',
    in_progress: 'In Progress',
    hold: 'On Hold',
    closed: 'Closed',
  }
  return labels[status] || status
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-500',
    agent_assigned: 'bg-yellow-500',
    in_progress: 'bg-green-500',
    hold: 'bg-orange-500',
    closed: 'bg-gray-500',
  }
  return colors[status] || 'bg-gray-400'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-gray-600">Overview of ticket statistics and agent performance</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 flex justify-center">
      <Spinner size="lg" />
    </div>

    <!-- Error -->
    <EmptyState
      v-else-if="error"
      title="Failed to load statistics"
      :description="error.message"
    />

    <!-- Stats -->
    <template v-else-if="stats">
      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div class="text-sm text-gray-500 mb-1">Total Tickets</div>
          <div class="text-3xl font-bold text-gray-900">{{ stats.totalTickets }}</div>
        </Card>
        <Card>
          <div class="text-sm text-gray-500 mb-1">Open Tickets</div>
          <div class="text-3xl font-bold text-primary-600">{{ stats.openTickets }}</div>
        </Card>
        <Card>
          <div class="text-sm text-gray-500 mb-1">Unassigned</div>
          <div class="text-3xl font-bold text-amber-600">{{ stats.unassignedTickets }}</div>
        </Card>
        <Card>
          <div class="text-sm text-gray-500 mb-1">Avg Resolution</div>
          <div class="text-3xl font-bold text-green-600">
            {{ formatHours(stats.averageResolutionTimeHours) }}
          </div>
        </Card>
      </div>

      <!-- Today/This Week Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 class="font-semibold text-gray-900 mb-4">Today</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Created</div>
              <div class="text-2xl font-bold text-gray-900">{{ stats.ticketsCreatedToday }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Closed</div>
              <div class="text-2xl font-bold text-green-600">{{ stats.ticketsClosedToday }}</div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 class="font-semibold text-gray-900 mb-4">This Week</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Created</div>
              <div class="text-2xl font-bold text-gray-900">{{ stats.ticketsCreatedThisWeek }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Closed</div>
              <div class="text-2xl font-bold text-green-600">{{ stats.ticketsClosedThisWeek }}</div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Tickets by Status -->
      <Card>
        <h3 class="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
        <div class="space-y-3">
          <div
            v-for="item in stats.ticketsByStatus"
            :key="item.status"
            class="flex items-center gap-3"
          >
            <div :class="[statusColor(item.status), 'w-3 h-3 rounded-full']" />
            <div class="flex-1 text-gray-700">{{ statusLabel(item.status) }}</div>
            <div class="font-semibold text-gray-900">{{ item.count }}</div>
            <div class="w-32 bg-gray-100 rounded-full h-2">
              <div
                :class="[statusColor(item.status), 'h-2 rounded-full']"
                :style="{ width: `${(item.count / stats.totalTickets) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </Card>

      <!-- Agent Performance Table -->
      <Card>
        <h3 class="font-semibold text-gray-900 mb-4">Agent Performance</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closed
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This Week
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="agentStat in agentStats" :key="agentStat.agent.id">
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ agentStat.agent.name }}</div>
                  <div class="text-sm text-gray-500">{{ agentStat.agent.email }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-gray-900">
                  {{ agentStat.assignedTickets }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-primary-600">
                  {{ agentStat.openTickets }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-green-600">
                  {{ agentStat.closedTickets }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-gray-900">
                  {{ agentStat.closedThisWeek }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-gray-900">
                  {{ formatHours(agentStat.averageResolutionTimeHours) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </template>
  </div>
</template>
