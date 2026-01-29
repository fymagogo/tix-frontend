import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '../components/EmptyState.vue'

describe('EmptyState', () => {
  it('renders the component', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items' },
    })
    expect(wrapper.find('.text-center').exists()).toBe(true)
  })

  it('displays the title', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No tickets found' },
    })
    expect(wrapper.find('h3').text()).toBe('No tickets found')
  })

  it('displays description when provided', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No tickets',
        description: 'Create your first ticket to get started',
      },
    })
    expect(wrapper.find('p').text()).toBe('Create your first ticket to get started')
  })

  it('does not render description when not provided', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No tickets' },
    })
    expect(wrapper.find('p.text-gray-500').exists()).toBe(false)
  })

  it('renders the document icon', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items' },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').classes()).toContain('text-gray-400')
  })

  it('renders action slot when provided', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items' },
      slots: {
        action: '<button>Add Item</button>',
      },
    })
    expect(wrapper.find('button').text()).toBe('Add Item')
  })

  it('does not render action container when no action slot', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items' },
    })
    // The action div should not be rendered when slot is empty
    const actionDiv = wrapper.findAll('div').filter(d => d.classes().includes('mt-6'))
    expect(actionDiv.length).toBe(0)
  })

  it('applies proper text styling to title', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items' },
    })
    expect(wrapper.find('h3').classes()).toContain('text-gray-900')
    expect(wrapper.find('h3').classes()).toContain('text-sm')
    expect(wrapper.find('h3').classes()).toContain('font-medium')
  })

  it('applies proper text styling to description', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items', description: 'Some description' },
    })
    expect(wrapper.find('p').classes()).toContain('text-gray-500')
    expect(wrapper.find('p').classes()).toContain('text-sm')
  })

  it('has proper spacing with py-12', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items' },
    })
    expect(wrapper.find('.py-12').exists()).toBe(true)
  })
})
