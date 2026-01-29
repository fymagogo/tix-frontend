import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import type { MutationError } from '../types'

interface UseMutationHandlerOptions {
  successMessage?: string
  onSuccess?: () => void
  onError?: (errors: MutationError[]) => void
}

export function useMutationHandler(options: UseMutationHandlerOptions = {}) {
  const toast = useToast()
  const loading = ref(false)
  const errors = ref<MutationError[]>([])

  function getFieldError(field: string): string | undefined {
    return errors.value.find((e) => e.field === field)?.message
  }

  function hasError(field: string): boolean {
    return errors.value.some((e) => e.field === field)
  }

  function clearErrors() {
    errors.value = []
  }

  async function handleMutation<T>(
    mutationFn: () => Promise<{ data?: { [key: string]: { success: boolean; errors: MutationError[]; resource?: T } } }>
  ): Promise<T | null> {
    loading.value = true
    errors.value = []

    try {
      const result = await mutationFn()
      const data = result.data

      if (!data) {
        throw new Error('No data returned from mutation')
      }

      // Get the first key from the response (the mutation name)
      const mutationKey = Object.keys(data)[0]
      const response = data[mutationKey]

      if (response.success) {
        if (options.successMessage) {
          toast.success(options.successMessage)
        }
        options.onSuccess?.()
        return response.resource ?? null
      } else {
        errors.value = response.errors
        const generalError = response.errors.find((e) => !e.field)?.message
        if (generalError) {
          toast.error(generalError)
        }
        options.onError?.(response.errors)
        return null
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(message)
      errors.value = [{ message, code: 'UNEXPECTED_ERROR' }]
      options.onError?.(errors.value)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errors,
    getFieldError,
    hasError,
    clearErrors,
    handleMutation,
  }
}
