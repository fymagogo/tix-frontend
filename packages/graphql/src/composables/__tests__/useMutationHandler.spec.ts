import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMutationHandler } from '../useMutationHandler'

// Mock vue-toastification
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
}

vi.mock('vue-toastification', () => ({
  useToast: () => mockToast,
}))

describe('useMutationHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default values', () => {
    const handler = useMutationHandler()
    
    expect(handler.loading.value).toBe(false)
    expect(handler.errors.value).toEqual([])
  })

  it('getFieldError returns undefined for non-existent field', () => {
    const handler = useMutationHandler()
    
    expect(handler.getFieldError('email')).toBeUndefined()
  })

  it('getFieldError returns error message for existing field', () => {
    const handler = useMutationHandler()
    handler.errors.value = [
      { field: 'email', message: 'Email is invalid', code: 'INVALID' },
    ]
    
    expect(handler.getFieldError('email')).toBe('Email is invalid')
  })

  it('hasError returns false for non-existent field', () => {
    const handler = useMutationHandler()
    
    expect(handler.hasError('email')).toBe(false)
  })

  it('hasError returns true for existing field error', () => {
    const handler = useMutationHandler()
    handler.errors.value = [
      { field: 'email', message: 'Email is invalid', code: 'INVALID' },
    ]
    
    expect(handler.hasError('email')).toBe(true)
  })

  it('clearErrors removes all errors', () => {
    const handler = useMutationHandler()
    handler.errors.value = [
      { field: 'email', message: 'Email is invalid', code: 'INVALID' },
      { field: 'password', message: 'Password too short', code: 'INVALID' },
    ]
    
    handler.clearErrors()
    
    expect(handler.errors.value).toEqual([])
  })

  it('handleMutation sets loading to true during mutation', async () => {
    const handler = useMutationHandler()
    let loadingDuringMutation = false
    
    await handler.handleMutation(async () => {
      loadingDuringMutation = handler.loading.value
      return {
        data: {
          createTicket: {
            success: true,
            errors: [],
            resource: { id: '1' },
          },
        },
      }
    })
    
    expect(loadingDuringMutation).toBe(true)
    expect(handler.loading.value).toBe(false)
  })

  it('handleMutation returns resource on success', async () => {
    const handler = useMutationHandler()
    const ticket = { id: '1', subject: 'Test' }
    
    const result = await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: true,
          errors: [],
          resource: ticket,
        },
      },
    }))
    
    expect(result).toEqual(ticket)
  })

  it('handleMutation shows success toast on success', async () => {
    const handler = useMutationHandler({
      successMessage: 'Ticket created!',
    })
    
    await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: true,
          errors: [],
          resource: { id: '1' },
        },
      },
    }))
    
    expect(mockToast.success).toHaveBeenCalledWith('Ticket created!')
  })

  it('handleMutation calls onSuccess callback on success', async () => {
    const onSuccess = vi.fn()
    const handler = useMutationHandler({ onSuccess })
    
    await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: true,
          errors: [],
          resource: { id: '1' },
        },
      },
    }))
    
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handleMutation returns null on failure', async () => {
    const handler = useMutationHandler()
    
    const result = await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: false,
          errors: [{ field: 'subject', message: 'Subject is required', code: 'BLANK' }],
        },
      },
    }))
    
    expect(result).toBeNull()
  })

  it('handleMutation sets errors on failure', async () => {
    const handler = useMutationHandler()
    const errors = [
      { field: 'subject', message: 'Subject is required', code: 'BLANK' },
    ]
    
    await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: false,
          errors,
        },
      },
    }))
    
    expect(handler.errors.value).toEqual(errors)
  })

  it('handleMutation shows error toast for general error', async () => {
    const handler = useMutationHandler()
    
    await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: false,
          errors: [{ message: 'Something went wrong', code: 'SERVER_ERROR' }],
        },
      },
    }))
    
    expect(mockToast.error).toHaveBeenCalledWith('Something went wrong')
  })

  it('handleMutation calls onError callback on failure', async () => {
    const onError = vi.fn()
    const handler = useMutationHandler({ onError })
    const errors = [{ field: 'subject', message: 'Subject is required', code: 'BLANK' }]
    
    await handler.handleMutation(async () => ({
      data: {
        createTicket: {
          success: false,
          errors,
        },
      },
    }))
    
    expect(onError).toHaveBeenCalledWith(errors)
  })

  it('handleMutation handles thrown errors', async () => {
    const handler = useMutationHandler()
    
    const result = await handler.handleMutation(async () => {
      throw new Error('Network error')
    })
    
    expect(result).toBeNull()
    expect(mockToast.error).toHaveBeenCalledWith('Network error')
    expect(handler.errors.value).toEqual([
      { message: 'Network error', code: 'UNEXPECTED_ERROR' },
    ])
  })

  it('handleMutation handles no data returned', async () => {
    const handler = useMutationHandler()
    
    const result = await handler.handleMutation(async () => ({}))
    
    expect(result).toBeNull()
    expect(mockToast.error).toHaveBeenCalledWith('No data returned from mutation')
  })

  it('handleMutation returns null when no resource in success response', async () => {
    const handler = useMutationHandler()
    
    const result = await handler.handleMutation(async () => ({
      data: {
        deleteTicket: {
          success: true,
          errors: [],
        },
      },
    }))
    
    expect(result).toBeNull()
  })

  it('handleMutation calls onError on unexpected error', async () => {
    const onError = vi.fn()
    const handler = useMutationHandler({ onError })
    
    await handler.handleMutation(async () => {
      throw new Error('Network error')
    })
    
    expect(onError).toHaveBeenCalledWith([
      { message: 'Network error', code: 'UNEXPECTED_ERROR' },
    ])
  })

  it('handleMutation handles non-Error thrown values', async () => {
    const handler = useMutationHandler()
    
    await handler.handleMutation(async () => {
      throw 'string error' // non-Error value
    })
    
    expect(mockToast.error).toHaveBeenCalledWith('An unexpected error occurred')
  })
})
