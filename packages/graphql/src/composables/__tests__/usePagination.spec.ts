import { describe, it, expect } from 'vitest'
import { usePagination } from '../usePagination'

describe('usePagination', () => {
  it('initializes with default values', () => {
    const pagination = usePagination()
    
    expect(pagination.currentPage.value).toBe(1)
    expect(pagination.perPage.value).toBe(20)
    expect(pagination.pageInfo.value).toBeNull()
  })

  it('initializes with custom perPage', () => {
    const pagination = usePagination(50)
    
    expect(pagination.perPage.value).toBe(50)
  })

  it('computes paginationInput correctly', () => {
    const pagination = usePagination(10)
    
    expect(pagination.paginationInput.value).toEqual({
      page: 1,
      perPage: 10,
    })
  })

  it('updates paginationInput when currentPage changes', () => {
    const pagination = usePagination()
    pagination.currentPage.value = 3
    
    expect(pagination.paginationInput.value.page).toBe(3)
  })

  it('setPageInfo updates pageInfo', () => {
    const pagination = usePagination()
    const pageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    }
    
    pagination.setPageInfo(pageInfo)
    
    expect(pagination.pageInfo.value).toEqual(pageInfo)
  })

  it('hasNextPage returns correct value', () => {
    const pagination = usePagination()
    
    expect(pagination.hasNextPage.value).toBe(false)
    
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    expect(pagination.hasNextPage.value).toBe(true)
  })

  it('hasPreviousPage returns correct value', () => {
    const pagination = usePagination()
    
    expect(pagination.hasPreviousPage.value).toBe(false)
    
    pagination.setPageInfo({
      hasNextPage: false,
      hasPreviousPage: true,
      totalPages: 5,
      totalCount: 100,
    })
    
    expect(pagination.hasPreviousPage.value).toBe(true)
  })

  it('totalPages returns correct value', () => {
    const pagination = usePagination()
    
    expect(pagination.totalPages.value).toBe(1)
    
    pagination.setPageInfo({
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 10,
      totalCount: 200,
    })
    
    expect(pagination.totalPages.value).toBe(10)
  })

  it('totalCount returns correct value', () => {
    const pagination = usePagination()
    
    expect(pagination.totalCount.value).toBe(0)
    
    pagination.setPageInfo({
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    expect(pagination.totalCount.value).toBe(100)
  })

  it('goToPage navigates to valid page', () => {
    const pagination = usePagination()
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.goToPage(3)
    
    expect(pagination.currentPage.value).toBe(3)
  })

  it('goToPage does not navigate to invalid page (too low)', () => {
    const pagination = usePagination()
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.goToPage(0)
    
    expect(pagination.currentPage.value).toBe(1)
  })

  it('goToPage does not navigate to invalid page (too high)', () => {
    const pagination = usePagination()
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.goToPage(10)
    
    expect(pagination.currentPage.value).toBe(1)
  })

  it('nextPage advances when hasNextPage is true', () => {
    const pagination = usePagination()
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.nextPage()
    
    expect(pagination.currentPage.value).toBe(2)
  })

  it('nextPage does not advance when hasNextPage is false', () => {
    const pagination = usePagination()
    pagination.setPageInfo({
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.nextPage()
    
    expect(pagination.currentPage.value).toBe(1)
  })

  it('previousPage goes back when hasPreviousPage is true', () => {
    const pagination = usePagination()
    pagination.currentPage.value = 3
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: true,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.previousPage()
    
    expect(pagination.currentPage.value).toBe(2)
  })

  it('previousPage does not go back when hasPreviousPage is false', () => {
    const pagination = usePagination()
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: false,
      totalPages: 5,
      totalCount: 100,
    })
    
    pagination.previousPage()
    
    expect(pagination.currentPage.value).toBe(1)
  })

  it('reset restores initial state', () => {
    const pagination = usePagination()
    pagination.currentPage.value = 5
    pagination.setPageInfo({
      hasNextPage: true,
      hasPreviousPage: true,
      totalPages: 10,
      totalCount: 200,
    })
    
    pagination.reset()
    
    expect(pagination.currentPage.value).toBe(1)
    expect(pagination.pageInfo.value).toBeNull()
  })
})
