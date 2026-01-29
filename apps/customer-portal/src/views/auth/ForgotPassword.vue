<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import gql from 'graphql-tag'
import { Button, Input, Alert } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'

const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!, $userType: String!) {
    requestPasswordReset(email: $email, userType: $userType) {
      success
      errors {
        field
        message
        code
      }
    }
  }
`

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Please enter a valid email'),
  })
)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: schema,
})

const [email, emailAttrs] = defineField('email')

const loading = ref(false)
const serverError = ref('')
const success = ref(false)

const { mutate: requestReset } = useMutation(REQUEST_PASSWORD_RESET)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  serverError.value = ''

  try {
    const result = await requestReset({ email: values.email, userType: 'customer' })
    const response = result?.data?.requestPasswordReset

    if (response?.success) {
      success.value = true
    } else {
      const error = response?.errors?.[0]
      serverError.value = error?.message || 'Failed to send reset email'
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
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Reset your password</h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <!-- Success state -->
      <div v-if="success" class="space-y-6">
        <Alert type="success">
          If an account with that email exists, we've sent password reset instructions.
          Please check your inbox.
        </Alert>
        <router-link
          to="/signin"
          class="block text-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to sign in
        </router-link>
      </div>

      <!-- Form -->
      <form v-else class="mt-8 space-y-6" @submit="onSubmit">
        <Alert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
          {{ serverError }}
        </Alert>

        <Input
          v-model="email"
          v-bind="emailAttrs"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          :error="errors.email"
          required
        />

        <Button type="submit" class="w-full" :loading="loading">
          Send reset link
        </Button>

        <router-link
          to="/signin"
          class="block text-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to sign in
        </router-link>
      </form>
    </div>
  </div>
</template>
