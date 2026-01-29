import { ref, computed } from 'vue'
import type { PageInfo, PaginationInput } from '../types'

export function usePagination(initialPerPage = 20) {
  const currentPage = ref(1)
  const perPage = ref(initialPerPage)
  const pageInfo = ref<PageInfo | null>(null)

  const paginationInput = computed<PaginationInput>(() => ({
    page: currentPage.value,
    perPage: perPage.value,
  }))

  const hasNextPage = computed(() => pageInfo.value?.hasNextPage ?? false)
  const hasPreviousPage = computed(() => pageInfo.value?.hasPreviousPage ?? false)
  const totalPages = computed(() => pageInfo.value?.totalPages ?? 1)
  const totalCount = computed(() => pageInfo.value?.totalCount ?? 0)

  function setPageInfo(info: PageInfo) {
    pageInfo.value = info
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function previousPage() {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  function reset() {
    currentPage.value = 1
    pageInfo.value = null
  }

  return {
    currentPage,
    perPage,
    pageInfo,
    paginationInput,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    totalCount,
    setPageInfo,
    goToPage,
    nextPage,
    previousPage,
    reset,
  }
}
