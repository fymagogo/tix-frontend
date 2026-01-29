import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../components/Pagination.vue'

describe('Pagination', () => {
  it('renders pagination navigation', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('has proper aria-label', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Pagination')
  })

  it('disables previous button on first page', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    // Find mobile "Previous" button (has text "Previous")
    const prevButton = wrapper.findAll('button').find(b => b.text() === 'Previous')
    expect(prevButton).toBeDefined()
    expect(prevButton!.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 5, totalPages: 5 },
    })
    // Find mobile "Next" button (has text "Next")
    const nextButton = wrapper.findAll('button').find(b => b.text() === 'Next')
    expect(nextButton).toBeDefined()
    expect(nextButton!.attributes('disabled')).toBeDefined()
  })

  it('enables both buttons on middle page', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    // Check mobile buttons - should all be enabled for middle page
    const mobileButtons = wrapper.findAll('.sm\\:hidden button')
    mobileButtons.forEach(btn => {
      expect(btn.attributes('disabled')).toBeUndefined()
    })
  })

  it('emits change event when clicking previous', async () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    // Find the mobile "Previous" button
    const prevButton = wrapper.findAll('button').find(b => b.text() === 'Previous')
    await prevButton?.trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0]).toEqual([2])
  })

  it('emits change event when clicking next', async () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    // Find the mobile "Next" button
    const nextButton = wrapper.findAll('button').find(b => b.text() === 'Next')
    await nextButton?.trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0]).toEqual([4])
  })

  it('emits change event when clicking page number', async () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    // Find a page number button (not ellipsis, not prev/next)
    const pageButtons = wrapper.findAll('button').filter(b => b.text() === '3')
    if (pageButtons.length > 0) {
      await pageButtons[0].trigger('click')
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')![0]).toEqual([3])
    }
  })

  it('does not emit when clicking current page', async () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    const currentPageBtn = wrapper.findAll('button').find(b => b.text() === '3')
    await currentPageBtn?.trigger('click')
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('shows all pages when total pages <= 7', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    // Should show pages 1-5 without ellipsis
    const pageNumbers = wrapper.findAll('button').filter(b => /^[1-5]$/.test(b.text()))
    expect(pageNumbers.length).toBe(5)
  })

  it('shows ellipsis for many pages', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 5, totalPages: 10 },
    })
    // Should show ellipsis
    expect(wrapper.text()).toContain('...')
  })

  it('highlights current page with different styling', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    const currentPageBtn = wrapper.findAll('button').find(b => b.text() === '3')
    expect(currentPageBtn?.classes()).toContain('bg-primary-600')
    expect(currentPageBtn?.classes()).toContain('text-white')
  })
})
