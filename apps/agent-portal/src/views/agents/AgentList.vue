<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { Button, Card, Modal, Input, Spinner, EmptyState, Badge } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'
import { useAuthStore } from '@/stores/auth'

const AGENTS_QUERY = gql`
  query Agents {
    agents {
      id
      email
      name
      isAdmin
      invitationPending
      createdAt
    }
  }
`

const INVITE_AGENT = gql`
  mutation InviteAgent($email: String!, $name: String!, $isAdmin: Boolean) {
    inviteAgent(email: $email, name: $name, isAdmin: $isAdmin) {
      agent {
        id
        email
        name
        isAdmin
      }
      errors {
        field
        message
        code
      }
    }
  }
`

const toast = useToast()
const auth = useAuthStore()

const { result, loading, refetch } = useQuery(AGENTS_QUERY)
const { mutate: inviteAgent } = useMutation(INVITE_AGENT)

const agents = computed(() => result.value?.agents ?? [])

const showInviteModal = ref(false)
const inviting = ref(false)

const schema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
  })
)

const { handleSubmit, defineField, errors, resetForm } = useForm({
  validationSchema: schema,
})

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')

const onSubmit = handleSubmit(async (values) => {
  inviting.value = true

  try {
    const result = await inviteAgent({ email: values.email, name: values.name, isAdmin: false })
    const response = result?.data?.inviteAgent

    if (response?.agent) {
      toast.success('Invitation sent!')
      showInviteModal.value = false
      resetForm()
      refetch()
    } else {
      const error = response?.errors?.[0]
      toast.error(error?.message || 'Failed to send invitation')
    }
  } catch (error) {
    toast.error(extractErrorMessage(error))
  } finally {
    inviting.value = false
  }
})

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
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Agents</h1>
        <p class="text-gray-600">Manage your support team</p>
      </div>
      <Button v-if="auth.user?.isAdmin" @click="showInviteModal = true">
        Invite Agent
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12">
      <Spinner size="lg" />
    </div>

    <!-- Empty state -->
    <EmptyState
      v-else-if="agents.length === 0"
      title="No agents yet"
      description="Invite your first team member to get started"
    >
      <template v-if="auth.user?.isAdmin" #action>
        <Button @click="showInviteModal = true">
          Invite Agent
        </Button>
      </template>
    </EmptyState>

    <!-- Agent list -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="agent in agents"
        :key="agent.id"
        :to="`/agents/${agent.id}`"
        class="block"
      >
        <Card class="hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-lg">
              {{ agent.name?.charAt(0)?.toUpperCase() || agent.email.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-gray-900 truncate">
                  {{ agent.name || agent.email }}
                </h3>
                <Badge v-if="agent.isAdmin" variant="default">Admin</Badge>
                <Badge v-if="agent.invitationPending" variant="secondary">Pending</Badge>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ agent.email }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ agent.invitationPending ? 'Invited' : 'Joined' }} {{ formatDate(agent.createdAt) }}
              </p>
            </div>
          </div>
        </Card>
      </router-link>
    </div>

    <!-- Invite Modal -->
    <Modal :open="showInviteModal" title="Invite Agent" @close="showInviteModal = false">
      <form class="space-y-4" @submit="onSubmit">
        <p class="text-sm text-gray-600">
          Enter the details of the person you'd like to invite. They'll receive an email with instructions to set up their account.
        </p>

        <Input
          v-model="name"
          v-bind="nameAttrs"
          label="Full name"
          type="text"
          placeholder="John Doe"
          :error="errors.name"
          required
        />

        <Input
          v-model="email"
          v-bind="emailAttrs"
          label="Email address"
          type="email"
          placeholder="colleague@company.com"
          :error="errors.email"
          required
        />
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showInviteModal = false">
            Cancel
          </Button>
          <Button :loading="inviting" @click="onSubmit">
            Send Invitation
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
