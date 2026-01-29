// User types
export interface Customer {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Agent {
  id: string
  email: string
  name: string
  isAdmin: boolean
  createdAt: string
}

export type User = Customer | Agent

// Audit types
export interface AuditChange {
  field: string
  from: string | null
  to: string | null
}

export interface AuditEntry {
  id: string
  action: string
  changes: AuditChange[]
  changedAt: string
  changedBy?: Customer | Agent
  version: number
}

// History event types (human-readable)
export interface HistoryEvent {
  id: string
  event: string
  occurredAt: string
  actor?: Customer | Agent
}

// Ticket types
export type TicketStatus = 'NEW' | 'AGENT_ASSIGNED' | 'IN_PROGRESS' | 'HOLD' | 'CLOSED'

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: TicketStatus
  customer: Customer
  assignedAgent?: Agent
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  body: string
  author: Customer | Agent
  authorType: 'Customer' | 'Agent'
  createdAt: string
}

// Pagination types
export interface PageInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  perPage: number
}

export interface PaginationInput {
  page?: number
  perPage?: number
}

// Filter types
export interface TicketFilter {
  status?: TicketStatus
  assignedToMe?: boolean
  customerId?: string
  search?: string
}

export interface TicketOrderBy {
  field: 'CREATED_AT' | 'UPDATED_AT' | 'STATUS' | 'SUBJECT'
  direction: 'ASC' | 'DESC'
}

// Mutation response types
export interface MutationError {
  field?: string
  message: string
  code: string
}

export interface MutationResponse<T = unknown> {
  success: boolean
  errors: MutationError[]
  resource?: T
}

export interface AuthPayload {
  token: string
  user: Customer | Agent
}

// Export response type
export interface ExportResult {
  csv?: string
  async: boolean
  errors: MutationError[]
}
