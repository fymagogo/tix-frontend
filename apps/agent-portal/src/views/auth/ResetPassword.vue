<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { Button, Input, Alert } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'

const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!, $passwordConfirmation: String!, $userType: String!) {
    resetPassword(token: $token, password: $password, passwordConfirmation: $passwordConfirmation, userType: $userType) {
      success
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

const token = computed(() => route.query.token as string)

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

const { mutate: resetPassword } = useMutation(RESET_PASSWORD)

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    serverError.value = 'Invalid reset token'
    return
  }

  loading.value = true
  serverError.value = ''

  try {
    const result = await resetPassword({
      token: token.value,
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
      userType: 'agent',
    })

    const response = result?.data?.resetPassword

    if (response?.success) {
      toast.success('Password reset successfully!')
      router.push('/signin')
    } else {
      const error = response?.errors?.[0]
      serverError.value = error?.message || 'Failed to reset password'
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
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Set new password</h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <!-- Invalid token state -->
      <div v-if="!token" class="space-y-6">
        <Alert type="error">
          Invalid or missing reset token. Please request a new password reset.
        </Alert>
        <router-link
          to="/forgot-password"
          class="block text-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Request new reset link
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
            label="New password"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            required
          />

          <Input
            v-model="passwordConfirmation"
            v-bind="passwordConfirmationAttrs"
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            :error="errors.passwordConfirmation"
            required
          />
        </div>

        <Button type="submit" class="w-full" :loading="loading">
          Reset password
        </Button>
      </form>
    </div>
  </div>
</template>
