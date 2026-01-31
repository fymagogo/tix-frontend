<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { Button, Card, Alert, DateRangePicker, Checkbox } from '@tix/ui'
import type { DateRange } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'

const EXPORT_CLOSED_TICKETS = gql`
  mutation ExportClosedTickets(
    $closedAfter: ISO8601DateTime
    $closedBefore: ISO8601DateTime
    $fields: [String!]
  ) {
    exportClosedTickets(
      closedAfter: $closedAfter
      closedBefore: $closedBefore
      fields: $fields
    ) {
      csv
      async
      filename
      errors {
        field
        message
        code
      }
    }
  }
`

// Available fields for export
const AVAILABLE_FIELDS = [
  { key: 'id', label: 'Ticket ID', default: true },
  { key: 'subject', label: 'Subject', default: true },
  { key: 'description', label: 'Description', default: false },
  { key: 'status', label: 'Status', default: true },
  { key: 'customer_name', label: 'Customer Name', default: true },
  { key: 'customer_email', label: 'Customer Email', default: false },
  { key: 'assigned_agent', label: 'Assigned Agent', default: true },
  { key: 'created_at', label: 'Created At', default: true },
  { key: 'closed_at', label: 'Closed At', default: true },
  { key: 'comments_count', label: 'Comments Count', default: false },
]

const toast = useToast()
const { mutate: exportTickets } = useMutation(EXPORT_CLOSED_TICKETS)

const exporting = ref(false)
const exportResult = ref<{
  async: boolean
  csv?: string
  filename?: string
} | null>(null)
const error = ref('')

// Date range state
const dateRange = ref<DateRange>({ startDate: null, endDate: null })

// Field selection state
const selectedFields = ref<Record<string, boolean>>(
  Object.fromEntries(AVAILABLE_FIELDS.map(f => [f.key, f.default]))
)

const selectedFieldsList = computed(() => 
  Object.entries(selectedFields.value)
    .filter(([, selected]) => selected)
    .map(([key]) => key)
)

const hasSelectedFields = computed(() => selectedFieldsList.value.length > 0)

function selectAllFields() {
  AVAILABLE_FIELDS.forEach(f => {
    selectedFields.value[f.key] = true
  })
}

function selectDefaultFields() {
  AVAILABLE_FIELDS.forEach(f => {
    selectedFields.value[f.key] = f.default
  })
}

async function handleExport() {
  if (!hasSelectedFields.value) {
    error.value = 'Please select at least one field to export'
    return
  }

  exporting.value = true
  error.value = ''
  exportResult.value = null

  try {
    const result = await exportTickets({
      closedAfter: dateRange.value.startDate,
      closedBefore: dateRange.value.endDate,
      fields: selectedFieldsList.value
    })
    const response = result?.data?.exportClosedTickets

    if (response?.errors?.length === 0 || (!response?.errors?.length && (response?.csv || response?.async))) {
      exportResult.value = { 
        async: response.async, 
        csv: response.csv,
        filename: response.filename
      }

      if (response.async) {
        toast.info('Export started! You\'ll receive an email when it\'s ready.')
      } else if (response.csv) {
        downloadCsv(response.csv, response.filename)
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

function downloadCsv(csvData: string, filename?: string) {
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `closed-tickets-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function downloadAgain() {
  if (exportResult.value?.csv) {
    downloadCsv(exportResult.value.csv, exportResult.value.filename)
  }
}
</script>

<template>
  <div class="max-w-3xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Export</h1>
      <p class="text-gray-600">Download closed tickets for reporting</p>
    </div>

    <!-- Export Card -->
    <Card>
      <div class="py-6">
        <div class="flex items-center gap-4 mb-6">
          <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h2 class="text-lg font-medium text-gray-900">Export Closed Tickets</h2>
            <p class="text-gray-600 text-sm">
              Filter by date range and select the fields to include.
            </p>
          </div>
        </div>

        <!-- Date Range Picker -->
        <div class="mb-6">
          <DateRangePicker v-model="dateRange" label="Closed Date Range" />
        </div>

        <!-- Field Selection -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700">
              Fields to Export
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="text-xs text-indigo-600 hover:text-indigo-800"
                @click="selectAllFields"
              >
                Select All
              </button>
              <span class="text-gray-300">|</span>
              <button
                type="button"
                class="text-xs text-indigo-600 hover:text-indigo-800"
                @click="selectDefaultFields"
              >
                Reset to Default
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              v-for="field in AVAILABLE_FIELDS"
              :key="field.key"
              v-model="selectedFields[field.key]"
              :label="field.label"
            />
          </div>
          <p v-if="!hasSelectedFields" class="text-sm text-red-600 mt-2">
            Please select at least one field
          </p>
        </div>

        <Alert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = ''">
          {{ error }}
        </Alert>

        <!-- Async result -->
        <Alert v-if="exportResult?.async" type="info" class="mb-6">
          <strong>Export in progress!</strong><br />
          You'll receive an email with the CSV file shortly.
        </Alert>

        <!-- Sync result -->
        <Alert v-if="exportResult?.csv" type="success" class="mb-6">
          <div class="flex items-center justify-between">
            <span>Export ready! ({{ exportResult.filename }})</span>
            <Button variant="secondary" size="sm" @click="downloadAgain">
              Download Again
            </Button>
          </div>
        </Alert>

        <div class="flex justify-center">
          <Button
            size="lg"
            :loading="exporting"
            :disabled="!hasSelectedFields"
            @click="handleExport"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Closed Tickets
          </Button>
        </div>

        <p class="text-xs text-gray-500 mt-4 text-center">
          For large exports, you'll receive the file via email.
        </p>
      </div>
    </Card>
  </div>
</template>
