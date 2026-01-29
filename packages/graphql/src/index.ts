// Apollo Client
export { apolloClient, createApolloClient } from './apollo-client'

// Types
export * from './types'

// Composables
export { usePagination } from './composables/usePagination'
export { useMutationHandler } from './composables/useMutationHandler'
export { useDirectUpload } from './composables/useDirectUpload'

// Utilities
export function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback
  
  // GraphQL errors from Apollo
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    
    // Apollo GraphQL errors
    if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
      return (err.graphQLErrors[0] as { message?: string })?.message || fallback
    }
    
    // Network errors
    if (err.networkError && typeof err.networkError === 'object') {
      const netErr = err.networkError as { message?: string }
      return netErr.message || 'Network error occurred'
    }
    
    // Standard Error object
    if ('message' in err && typeof err.message === 'string') {
      return err.message
    }
  }
  
  return fallback
}

// Re-export generated types and composables when available
// export * from './generated/graphql'
