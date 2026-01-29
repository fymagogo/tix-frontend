import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client/core'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql',
})

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('auth_token')

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  })

  return forward(operation)
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
  link: authLink.concat(httpLink),
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
