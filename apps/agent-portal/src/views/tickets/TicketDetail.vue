<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { Button, Card, Badge, TextArea, Spinner, Alert, Select, Modal, FileUpload, type UploadFile } from '@tix/ui'
import { useDirectUpload } from '@tix/graphql'

const TICKET_QUERY = gql`
  query Ticket($id: ID!) {
    ticket(id: $id) {
      id
      ticketNumber
      subject
      description
      status
      canComment
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
        email
      }
      attachments {
        id
        filename
        contentType
        byteSize
        url
      }
      comments {
        id
        body
        createdAt
        author {
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
        attachments {
          id
          filename
          contentType
          byteSize
          url
        }
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

const AGENTS_QUERY = gql`
  query Agents {
    agents {
      id
      name
    }
  }
`

const ADD_COMMENT = gql`
  mutation AddComment($ticketId: ID!, $body: String!, $attachmentIds: [String!]) {
    addComment(ticketId: $ticketId, body: $body, attachmentIds: $attachmentIds) {
      comment {
        id
        body
        createdAt
        author {
          ... on Agent {
            id
            name
            __typename
          }
        }
        attachments {
          id
          filename
          contentType
          byteSize
          url
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`

const TRANSITION_TICKET = gql`
  mutation TransitionTicket($ticketId: ID!, $event: String!) {
    transitionTicket(ticketId: $ticketId, event: $event) {
      ticket {
        id
        status
      }
      errors {
        field
        message
        code
      }
    }
  }
`

const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: ID!, $agentId: ID!) {
    assignTicket(ticketId: $ticketId, agentId: $agentId) {
      ticket {
        id
        assignedAgent {
          id
          name
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()
const { uploadFile } = useDirectUpload()

const ticketId = computed(() => route.params.id as string)

// Poll every 10 seconds for new comments
const { result, loading, refetch } = useQuery(TICKET_QUERY, { id: ticketId }, {
  pollInterval: 10000,
})
const { result: agentsResult } = useQuery(AGENTS_QUERY)
const { mutate: addComment } = useMutation(ADD_COMMENT)
const { mutate: transitionTicket } = useMutation(TRANSITION_TICKET)
const { mutate: assignTicket } = useMutation(ASSIGN_TICKET)

const ticket = computed(() => result.value?.ticket)
const comments = computed(() => ticket.value?.comments ?? [])
const history = computed(() => ticket.value?.history ?? [])
const agents = computed(() => agentsResult.value?.agents ?? [])
const ticketAttachments = computed(() => ticket.value?.attachments ?? [])

const agentOptions = computed(() => 
  agents.value.map((a: { id: string; name: string }) => ({ value: a.id, label: a.name }))
)

// Available transitions based on current status
const availableTransitions = computed(() => {
  const status = ticket.value?.status
  switch (status) {
    case 'agent_assigned':
      return [{ event: 'start_progress', label: 'Start Progress', variant: 'primary' as const }]
    case 'in_progress':
      return [
        { event: 'put_on_hold', label: 'Put On Hold', variant: 'secondary' as const },
        { event: 'close', label: 'Close Ticket', variant: 'danger' as const },
      ]
    case 'hold':
      return [
        { event: 'start_progress', label: 'Resume Progress', variant: 'primary' as const },
        { event: 'close', label: 'Close Ticket', variant: 'danger' as const },
      ]
    default:
      return []
  }
})

const newComment = ref('')
const commentFiles = ref<UploadFile[]>([])
const submitting = ref(false)
const commentError = ref('')
const transitioning = ref(false)
const showAssignModal = ref(false)
const selectedAgentId = ref('')
const assigning = ref(false)
const showHistory = ref(false)

// Check if all files are ready
const filesReady = computed(() => 
  commentFiles.value.every(f => f.status === 'completed' || f.status === 'error')
)

async function handleFileUpload(file: File) {
  const uploadFile_ = commentFiles.value.find(f => f.file === file)
  if (!uploadFile_) return

  updateFileStatus(uploadFile_.id, { status: 'uploading', progress: 0 })

  const result = await uploadFile(file, (progress) => {
    updateFileStatus(uploadFile_.id, { progress })
  })

  if ('error' in result) {
    updateFileStatus(uploadFile_.id, { status: 'error', error: result.error })
  } else {
    updateFileStatus(uploadFile_.id, { status: 'completed', progress: 100, signedId: result.signedId })
  }
}

function updateFileStatus(id: string, updates: Partial<UploadFile>) {
  commentFiles.value = commentFiles.value.map(f => 
    f.id === id ? { ...f, ...updates } : f
  )
}

async function submitComment() {
  if (!newComment.value.trim()) return
  if (!filesReady.value) {
    commentError.value = 'Please wait for file uploads to complete'
    return
  }

  submitting.value = true
  commentError.value = ''

  try {
    const attachmentIds = commentFiles.value
      .filter(f => f.status === 'completed' && f.signedId)
      .map(f => f.signedId!)

    const result = await addComment({
      ticketId: ticketId.value,
      body: newComment.value,
      attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
    })

    const response = result?.data?.addComment

    if (response?.comment) {
      newComment.value = ''
      commentFiles.value = []
      toast.success('Comment added')
      refetch()
    } else {
      const error = response?.errors?.[0]
      commentError.value = error?.message || 'Failed to add comment'
    }
  } catch (error: unknown) {
    const err = error as { graphQLErrors?: Array<{ message: string }>; message?: string }
    const message = err?.graphQLErrors?.[0]?.message || err?.message || 'An unexpected error occurred'
    commentError.value = message
  } finally {
    submitting.value = false
  }
}

async function handleTransition(event: string) {
  transitioning.value = true

  try {
    const result = await transitionTicket({
      ticketId: ticketId.value,
      event,
    })

    const response = result?.data?.transitionTicket

    if (response?.ticket) {
      toast.success('Ticket updated')
      refetch()
    } else {
      const error = response?.errors?.[0]
      toast.error(error?.message || 'Failed to update ticket')
    }
  } catch (error: unknown) {
    const err = error as { graphQLErrors?: Array<{ message: string }>; message?: string }
    const message = err?.graphQLErrors?.[0]?.message || err?.message || 'An unexpected error occurred'
    toast.error(message)
  } finally {
    transitioning.value = false
  }
}

async function handleAssign() {
  if (!selectedAgentId.value) return

  assigning.value = true

  try {
    const result = await assignTicket({
      ticketId: ticketId.value,
      agentId: selectedAgentId.value,
    })

    const response = result?.data?.assignTicket

    if (response?.ticket) {
      toast.success('Ticket reassigned')
      showAssignModal.value = false
      selectedAgentId.value = ''
      refetch()
    } else {
      const error = response?.errors?.[0]
      toast.error(error?.message || 'Failed to reassign ticket')
    }
  } catch (error: unknown) {
    const err = error as { graphQLErrors?: Array<{ message: string }>; message?: string }
    const message = err?.graphQLErrors?.[0]?.message || err?.message || 'An unexpected error occurred'
    toast.error(message)
  } finally {
    assigning.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function isImage(contentType: string): boolean {
  return contentType.startsWith('image/')
}
</script>

<template>
  <div class="max-w-4xl">
    <!-- Back link -->
    <router-link to="/" class="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">
      ← Back to tickets
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="py-12">
      <Spinner size="lg" />
    </div>

    <!-- Ticket details -->
    <div v-else-if="ticket" class="space-y-6">
      <!-- Header -->
      <Card>
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-gray-500">#{{ ticket.ticketNumber }}</span>
              <Badge :variant="ticket.status" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900">{{ ticket.subject }}</h1>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <Button
              v-for="transition in availableTransitions"
              :key="transition.event"
              :variant="transition.variant"
              size="sm"
              :loading="transitioning"
              @click="handleTransition(transition.event)"
            >
              {{ transition.label }}
            </Button>
          </div>
        </div>

        <div class="prose max-w-none text-gray-700">
          <p class="whitespace-pre-wrap">{{ ticket.description }}</p>
        </div>

        <!-- Ticket attachments -->
        <div v-if="ticketAttachments.length > 0" class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="attachment in ticketAttachments"
              :key="attachment.id"
              :href="attachment.url"
              target="_blank"
              class="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span v-if="isImage(attachment.contentType)">🖼️</span>
              <span v-else>📄</span>
              <span class="text-sm text-gray-700">{{ attachment.filename }}</span>
              <span class="text-xs text-gray-500">({{ formatFileSize(attachment.byteSize) }})</span>
            </a>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Customer:</span>
              <span class="ml-2 text-gray-900">{{ ticket.customer.name }}</span>
              <span class="text-gray-500">({{ ticket.customer.email }})</span>
            </div>
            <div>
              <span class="text-gray-500">Created:</span>
              <span class="ml-2 text-gray-900">{{ formatDate(ticket.createdAt) }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500">Assigned to:</span>
              <span class="ml-2 text-gray-900">
                {{ ticket.assignedAgent?.name || 'Unassigned' }}
              </span>
              <Button
                v-if="auth.user?.isAdmin && ticket.status !== 'closed'"
                variant="secondary"
                size="sm"
                class="ml-2"
                @click="showAssignModal = true"
              >
                Reassign
              </Button>
            </div>
            <div>
              <span class="text-gray-500">Updated:</span>
              <span class="ml-2 text-gray-900">{{ formatDate(ticket.updatedAt) }}</span>
            </div>
          </div>
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
              <span v-if="entry.actor" class="text-gray-500">
                by {{ entry.actor.name }}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Comments -->
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Comments ({{ comments.length }})
        </h2>

        <div v-if="comments.length === 0" class="text-gray-500 italic mb-6">
          No comments yet. Be the first to respond!
        </div>

        <div v-else class="space-y-4 mb-6">
          <Card v-for="comment in comments" :key="comment.id">
            <div class="flex items-start gap-4">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                  comment.author.__typename === 'Agent' ? 'bg-primary-600' : 'bg-gray-400'
                ]"
              >
                {{ comment.author.name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">{{ comment.author.name }}</span>
                  <span v-if="comment.author.__typename === 'Agent'" class="text-xs text-primary-600 font-medium">
                    Agent
                  </span>
                  <span v-else class="text-xs text-gray-500 font-medium">
                    Customer
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>
                <p class="text-gray-700 whitespace-pre-wrap">{{ comment.body }}</p>

                <!-- Comment attachments -->
                <div v-if="comment.attachments?.length > 0" class="mt-3 flex flex-wrap gap-2">
                  <a
                    v-for="attachment in comment.attachments"
                    :key="attachment.id"
                    :href="attachment.url"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm"
                  >
                    <span v-if="isImage(attachment.contentType)">🖼️</span>
                    <span v-else>📄</span>
                    <span class="text-gray-700">{{ attachment.filename }}</span>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Add comment -->
        <Card v-if="ticket.canComment">
          <h3 class="font-medium text-gray-900 mb-4">Add a Comment</h3>

          <Alert v-if="commentError" type="error" class="mb-4" dismissible @dismiss="commentError = ''">
            {{ commentError }}
          </Alert>

          <form @submit.prevent="submitComment">
            <TextArea
              v-model="newComment"
              placeholder="Write your response..."
              :rows="4"
              :disabled="submitting"
            />

            <FileUpload
              v-model="commentFiles"
              class="mt-4"
              @upload="handleFileUpload"
            />

            <div class="mt-4 flex justify-end">
              <Button type="submit" :loading="submitting" :disabled="!newComment.trim() || !filesReady">
                Send Response
              </Button>
            </div>
          </form>
        </Card>

        <Alert v-else-if="ticket.status === 'closed'" type="info">
          This ticket is closed.
        </Alert>
      </div>
    </div>

    <!-- Not found -->
    <Alert v-else type="error">
      Ticket not found
    </Alert>

    <!-- Assign Modal -->
    <Modal :open="showAssignModal" title="Reassign Ticket" @close="showAssignModal = false">
      <div class="space-y-4">
        <Select
          v-model="selectedAgentId"
          :options="agentOptions"
          label="Select Agent"
          placeholder="Choose an agent..."
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showAssignModal = false">
            Cancel
          </Button>
          <Button :loading="assigning" :disabled="!selectedAgentId" @click="handleAssign">
            Reassign
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
