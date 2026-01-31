<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import gql from 'graphql-tag'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Alert } from '@tix/ui'
import { extractErrorMessage } from '@tix/graphql'

const SIGN_UP = gql`
  mutation SignUp($email: String!, $name: String!, $password: String!, $passwordConfirmation: String!) {
    signUp(email: $email, name: $name, password: $password, passwordConfirmation: $passwordConfirmation) {
      customer {
        id
        email
        name
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
const auth = useAuthStore()

const schema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
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

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('passwordConfirmation')

const loading = ref(false)
const serverError = ref('')

const { mutate: signUp } = useMutation(SIGN_UP)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  serverError.value = ''

  try {
    const result = await signUp({
      email: values.email,
      name: values.name,
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
    })

    const response = result?.data?.signUp

    if (response?.customer) {
      auth.setUser(response.customer)
      toast.success('Account created successfully!')
      router.push('/')
    } else {
      const error = response?.errors?.[0]
      serverError.value = error?.message || 'Failed to create account'
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
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <router-link to="/signin" class="font-medium text-primary-600 hover:text-primary-500">
            Sign in
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
          Create account
        </Button>
      </form>
    </div>
  </div>
</template>
