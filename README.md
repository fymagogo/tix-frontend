# Tix Frontend

Vue 3 monorepo containing two SPAs (Customer Portal, Agent Portal) with shared packages.

## Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Build Tool:** Vite
- **Monorepo:** pnpm workspaces
- **Styling:** Tailwind CSS
- **GraphQL:** Apollo Client + @vue/apollo-composable
- **State Management:** Pinia
- **Form Validation:** VeeValidate + Zod
- **Notifications:** Vue Toastification

## Prerequisites

Before you begin, ensure you have the following installed:

| Dependency | Version | Installation |
|------------|---------|--------------|
| Node.js | 20+ | [Node.js Downloads](https://nodejs.org/en/download/) or [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) |
| pnpm | 8+ | [pnpm Installation](https://pnpm.io/installation) or `npm install -g pnpm` |
| Tix API | - | See [tix-api README](../tix-api/README.md) - must be running on port 3000 |

## Project Structure

```
tix-frontend/
├── apps/
│   ├── customer-portal/     # Customer-facing SPA (port 5173)
│   └── agent-portal/        # Agent dashboard SPA (port 5174)
├── packages/
│   ├── ui/                  # Shared UI components
│   └── graphql/             # Apollo client & GraphQL operations
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace definition
└── tailwind.config.js       # Shared Tailwind config
```

## Getting Started

### Installation

```bash
cd tix-frontend
pnpm install
```

### Development

Run the Customer Portal:
```bash
pnpm dev:customer
# Opens at http://localhost:5173
```

Run the Agent Portal:
```bash
pnpm dev:agent
# Opens at http://localhost:5174
```

### Build

```bash
# Build both portals
pnpm build

# Or individually
pnpm build:customer
pnpm build:agent
```

### GraphQL Codegen

Generate TypeScript types from the API schema:

```bash
# Make sure API is running first
pnpm codegen
```

## Shared Packages

### @tix/ui

Reusable Vue 3 components with Tailwind CSS:

- `Button` - Primary/secondary/danger variants, loading state
- `Input` - Text input with label and error handling
- `TextArea` - Multi-line input
- `Select` - Dropdown select
- `Modal` - Dialog overlay
- `Badge` - Status badges (new, in_progress, closed, etc.)
- `Card` - Content container
- `Pagination` - Page navigation
- `Alert` - Success/error/warning/info messages
- `Spinner` - Loading indicator
- `EmptyState` - Empty content placeholder

### @tix/graphql

Apollo Client setup and GraphQL operations:

- Pre-configured Apollo Client with JWT auth
- GraphQL queries and mutations
- TypeScript types
- Composables: `usePagination`, `useMutationHandler`

## Features

### Customer Portal

- Sign up / Sign in
- Password reset flow
- View my tickets
- Create new ticket
- View ticket details
- Add comments (after agent responds)

### Agent Portal

- Sign in (via invitation)
- Accept invitation flow
- Password reset
- View all tickets with filters:
  - Status filter
  - Assigned to me
  - Search
  - Sort (newest, oldest, updated, status)
- Ticket management:
  - View details
  - Add comments
  - Transition status (start progress, hold, close)
  - Reassign to another agent
- Manage agents (invite new)
- Export closed tickets to CSV

## Environment Variables

Both apps use `.env` files:

```
VITE_API_URL=http://localhost:3000/graphql
```

## API Integration

The frontend expects the Tix API to be running at `http://localhost:3000` with:

- GraphQL endpoint at `/graphql`
- CORS configured for frontend origins (5173, 5174)
- Cookie-based JWT authentication (HttpOnly cookies with access/refresh tokens)

## Email Notes

- **Development:** Emails are captured by Letter Opener and open in browser (no actual sending)
- **Production:** Uses SendGrid free tier with a personal email as sender proxy. **Check your spam folder** for agent invitation emails, password reset links, and ticket notifications.
