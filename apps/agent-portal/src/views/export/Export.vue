<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { Button, Card, Alert, Spinner } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'

const EXPORT_CLOSED_TICKETS = gql`
  mutation ExportClosedTickets {
    exportClosedTickets {
      csv
      async
      errors {
        field
        message
        code
      }
    }
  }
`

const toast = useToast()
const { mutate: exportTickets } = useMutation(EXPORT_CLOSED_TICKETS)

const exporting = ref(false)
const exportResult = ref<{
  async: boolean
  csv?: string
} | null>(null)
const error = ref('')

async function handleExport() {
  exporting.value = true
  error.value = ''
  exportResult.value = null

  try {
    const result = await exportTickets()
    const response = result?.data?.exportClosedTickets

    if (response?.errors?.length === 0 || (!response?.errors?.length && (response?.csv || response?.async))) {
      exportResult.value = { async: response.async, csv: response.csv }

      if (response.async) {
        toast.info('Export started! You\'ll receive an email when it\'s ready.')
      } else if (response.csv) {
        downloadCsv(response.csv)
        toast.success('Export downloaded!')
      }
    } else {
      const err = response?.errors?.[0]
      error.value = err?.message || 'Failed to export tickets'
    }
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    exporting.value = false
  }
}

function downloadCsv(csvData: string) {
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `closed-tickets-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function downloadAgain() {
  if (exportResult.value?.csv) {
    downloadCsv(exportResult.value.csv)
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Export</h1>
      <p class="text-gray-600">Download closed tickets for reporting</p>
    </div>

    <!-- Export Card -->
    <Card>
      <div class="text-center py-8">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>

        <h2 class="text-lg font-medium text-gray-900 mb-2">Export Closed Tickets</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          Download a CSV file containing all tickets closed in the last month. 
          For large exports, you'll receive the file via email.
        </p>

        <Alert v-if="error" type="error" class="mb-6 text-left" dismissible @dismiss="error = ''">
          {{ error }}
        </Alert>

        <!-- Async result -->
        <Alert v-if="exportResult?.async" type="info" class="mb-6 text-left">
          <strong>Export in progress!</strong><br />
          You'll receive an email with the CSV file shortly.
        </Alert>

        <!-- Sync result -->
        <Alert v-if="exportResult?.csv" type="success" class="mb-6 text-left">
          <div class="flex items-center justify-between">
            <span>Export ready!</span>
            <Button variant="secondary" size="sm" @click="downloadAgain">
              Download Again
            </Button>
          </div>
        </Alert>

        <Button
          size="lg"
          :loading="exporting"
          @click="handleExport"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Closed Tickets
        </Button>

        <p class="text-xs text-gray-500 mt-4">
          Includes: Ticket ID, Subject, Customer, Agent, Created/Closed dates, Comment count
        </p>
      </div>
    </Card>
  </div>
</template>
