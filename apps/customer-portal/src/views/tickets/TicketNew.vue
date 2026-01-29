<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { Button, Input, TextArea, Alert, Card, FileUpload, type UploadFile } from '@tix/ui'
import { extractErrorMessage, useDirectUpload } from '@tix/graphql'

const CREATE_TICKET = gql`
  mutation CreateTicket($subject: String!, $description: String!, $attachmentIds: [String!]) {
    createTicket(subject: $subject, description: $description, attachmentIds: $attachmentIds) {
      ticket {
        id
        ticketNumber
        subject
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

const router = useRouter()
const toast = useToast()
const { uploadFile } = useDirectUpload()

const schema = toTypedSchema(
  z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject is too long'),
    description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
  })
)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: schema,
})

const [subject, subjectAttrs] = defineField('subject')
const [description, descriptionAttrs] = defineField('description')

const files = ref<UploadFile[]>([])
const loading = ref(false)
const serverError = ref('')

const { mutate: createTicket } = useMutation(CREATE_TICKET)

// Check if all files are ready (uploaded or no files)
const filesReady = computed(() => 
  files.value.every(f => f.status === 'completed' || f.status === 'error')
)

async function handleFileUpload(file: File) {
  const uploadFile_ = files.value.find(f => f.file === file)
  if (!uploadFile_) return

  // Update status to uploading
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
  files.value = files.value.map(f => 
    f.id === id ? { ...f, ...updates } : f
  )
}

const onSubmit = handleSubmit(async (values) => {
  // Wait for uploads to complete
  if (!filesReady.value) {
    serverError.value = 'Please wait for file uploads to complete'
    return
  }

  loading.value = true
  serverError.value = ''

  try {
    // Collect signed IDs from completed uploads
    const attachmentIds = files.value
      .filter(f => f.status === 'completed' && f.signedId)
      .map(f => f.signedId!)

    const result = await createTicket({
      subject: values.subject,
      description: values.description,
      attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
    })

    const response = result?.data?.createTicket

    if (response?.ticket) {
      toast.success(`Ticket #${response.ticket.ticketNumber} created successfully!`)
      router.push(`/tickets/${response.ticket.id}`)
    } else {
      const error = response?.errors?.[0]
      serverError.value = error?.message || 'Failed to create ticket'
    }
  } catch (error) {
    serverError.value = extractErrorMessage(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <router-link to="/" class="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">
        ← Back to tickets
      </router-link>
      <h1 class="text-2xl font-bold text-gray-900">Create New Ticket</h1>
      <p class="text-gray-600 mt-1">Describe your issue and we'll help you as soon as possible</p>
    </div>

    <!-- Form -->
    <Card>
      <form @submit="onSubmit" class="space-y-6">
        <Alert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
          {{ serverError }}
        </Alert>

        <Input
          v-model="subject"
          v-bind="subjectAttrs"
          label="Subject"
          placeholder="Brief summary of your issue"
          :error="errors.subject"
          required
        />

        <TextArea
          v-model="description"
          v-bind="descriptionAttrs"
          label="Description"
          placeholder="Please describe your issue in detail. Include any relevant information like error messages, steps to reproduce, etc."
          :rows="8"
          :error="errors.description"
          required
        />

        <FileUpload
          v-model="files"
          label="Attachments (optional)"
          @upload="handleFileUpload"
        />

        <div class="flex justify-end gap-4">
          <router-link to="/">
            <Button variant="secondary" type="button">Cancel</Button>
          </router-link>
          <Button type="submit" :loading="loading">
            Create Ticket
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>
