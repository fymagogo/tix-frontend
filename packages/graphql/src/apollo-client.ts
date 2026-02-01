import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  Observable,
  fromPromise,
} from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import gql from 'graphql-tag'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql',
  credentials: 'include', // Send cookies with requests
})

// User type is set by the app (agent-portal or customer-portal)
let currentUserType: 'agent' | 'customer' = 'customer'

export function setUserType(userType: 'agent' | 'customer') {
  currentUserType = userType
}

export function getUserType() {
  return currentUserType
}

// Add X-User-Type header to all requests so the backend knows which cookie to check
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'X-User-Type': currentUserType,
    },
  }
})

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($userType: String!) {
    refreshToken(userType: $userType) {
      success
      user {
        ... on Customer {
          id
          name
          email
          __typename
        }
        ... on Agent {
          id
          name
          email
          isAdmin
          __typename
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

let isRefreshing = false
let pendingRequests: Array<() => void> = []

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback())
  pendingRequests = []
}

// Error link to handle token refresh on authentication errors
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check for authentication error
      if (
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.extensions?.code === 'AUTHENTICATION_ERROR' ||
        err.message.toLowerCase().includes('authentication required')
      ) {
        if (isRefreshing) {
          // Queue this request while refresh is in progress
          return new Observable((observer) => {
            pendingRequests.push(() => {
              forward(operation).subscribe(observer)
            })
          })
        }

        isRefreshing = true

        return fromPromise(
          apolloClient
            .mutate({
              mutation: REFRESH_TOKEN_MUTATION,
              variables: { userType: currentUserType },
            })
            .then((result) => {
              const refreshResult = result.data?.refreshToken
              if (refreshResult?.success) {
                resolvePendingRequests()
                return true
              }
              // Refresh failed - user needs to re-login
              // Emit event for auth store to handle
              window.dispatchEvent(new CustomEvent('auth:session-expired'))
              return false
            })
            .catch(() => {
              window.dispatchEvent(new CustomEvent('auth:session-expired'))
              return false
            })
            .finally(() => {
              isRefreshing = false
            })
        ).flatMap((success) => {
          if (success) {
            return forward(operation)
          }
          return Observable.of()
        })
      }
    }
  }
})

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        tickets: {
          keyArgs: ['filter', 'orderBy'],
          merge(existing, incoming, { args }) {
            if (!args?.pagination || args.pagination.page === 1) {
              return incoming
            }
            return {
              ...incoming,
              items: [...(existing?.items || []), ...incoming.items],
            }
          },
        },
      },
    },
  },
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

export function createApolloClient() {
  return apolloClient
}
