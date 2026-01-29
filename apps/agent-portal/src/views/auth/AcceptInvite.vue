<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Alert } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'

const ACCEPT_INVITE = gql`
  mutation AcceptInvite($invitationToken: String!, $password: String!, $passwordConfirmation: String!) {
    acceptInvite(invitationToken: $invitationToken, password: $password, passwordConfirmation: $passwordConfirmation) {
      agent {
        id
        email
        name
        isAdmin
      }
      token
      errors {
        field
        message
        code
      }
    }
  }
`

const router = useRouter()
const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const invitationToken = computed(() => route.query.token as string)

const schema = toTypedSchema(
  z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirmation: z.string(),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  })
)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: schema,
})

const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('passwordConfirmation')

const loading = ref(false)
const serverError = ref('')

const { mutate: acceptInvite } = useMutation(ACCEPT_INVITE)

const onSubmit = handleSubmit(async (values) => {
  if (!invitationToken.value) {
    serverError.value = 'Invalid invitation token'
    return
  }

  loading.value = true
  serverError.value = ''

  try {
    const result = await acceptInvite({
      invitationToken: invitationToken.value,
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
    })

    const response = result?.data?.acceptInvite

    if (response?.token && response?.agent) {
      auth.setAuth(response.token, response.agent)
      toast.success('Welcome to the team!')
      router.push('/')
    } else {
      const error = response?.errors?.[0]
      serverError.value = error?.message || 'Failed to accept invitation'
    }
  } catch (error) {
    serverError.value = extractErrorMessage(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary-600">Tix</h1>
        <p class="text-sm text-gray-500 mb-2">Agent Portal</p>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Complete your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          You've been invited to join as an agent
        </p>
      </div>

      <!-- Invalid token state -->
      <div v-if="!invitationToken" class="space-y-6">
        <Alert type="error">
          Invalid or missing invitation token.
        </Alert>
        <router-link
          to="/signin"
          class="block text-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Go to sign in
        </router-link>
      </div>

      <!-- Form -->
      <form v-else class="mt-8 space-y-6" @submit="onSubmit">
        <Alert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
          {{ serverError }}
        </Alert>

        <div class="space-y-4">
          <Input
            v-model="password"
            v-bind="passwordAttrs"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            required
          />

          <Input
            v-model="passwordConfirmation"
            v-bind="passwordConfirmationAttrs"
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            :error="errors.passwordConfirmation"
            required
          />
        </div>

        <Button type="submit" class="w-full" :loading="loading">
          Complete Setup
        </Button>
      </form>
    </div>
  </div>
</template>
