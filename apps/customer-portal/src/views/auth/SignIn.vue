<script setup lang="ts">
import { ref } from 'vue'
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

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!, $userType: String!) {
    signIn(email: $email, password: $password, userType: $userType) {
      user {
        ... on Customer {
          id
          email
          name
        }
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

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  })
)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: schema,
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const loading = ref(false)
const serverError = ref('')

const { mutate: signIn } = useMutation(SIGN_IN)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  serverError.value = ''

  try {
    const result = await signIn({
      email: values.email,
      password: values.password,
      userType: 'customer',
    })

    const response = result?.data?.signIn

    if (response?.token && response?.user) {
      auth.setAuth(response.token, response.user)
      toast.success('Welcome back!')
      
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } else {
      const error = response?.errors?.[0]
      serverError.value = error?.message || 'Invalid credentials'
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
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <router-link to="/signup" class="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </router-link>
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit="onSubmit">
        <Alert v-if="serverError" type="error" dismissible @dismiss="serverError = ''">
          {{ serverError }}
        </Alert>

        <div class="space-y-4">
          <Input
            v-model="email"
            v-bind="emailAttrs"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            :error="errors.email"
            required
          />

          <Input
            v-model="password"
            v-bind="passwordAttrs"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            required
          />
        </div>

        <div class="flex items-center justify-end">
          <router-link
            to="/forgot-password"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </router-link>
        </div>

        <Button type="submit" class="w-full" :loading="loading">
          Sign in
        </Button>
      </form>
    </div>
  </div>
</template>
