import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '../components/Badge.vue'

describe('Badge', () => {
  it('renders slot content when provided', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Custom Label'
      }
    })
    expect(wrapper.text()).toBe('Custom Label')
  })

  it('renders default label for variant when no slot', () => {
    const newWrapper = mount(Badge, { props: { variant: 'new' } })
    expect(newWrapper.text()).toBe('New')

    const closedWrapper = mount(Badge, { props: { variant: 'closed' } })
    expect(closedWrapper.text()).toBe('Closed')

    const inProgressWrapper = mount(Badge, { props: { variant: 'in_progress' } })
    expect(inProgressWrapper.text()).toBe('In Progress')
  })

  it('applies new variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'new' } })
    expect(wrapper.classes()).toContain('bg-blue-100')
    expect(wrapper.classes()).toContain('text-blue-800')
  })

  it('applies agent_assigned variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'agent_assigned' } })
    expect(wrapper.classes()).toContain('bg-purple-100')
  })

  it('applies in_progress variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'in_progress' } })
    expect(wrapper.classes()).toContain('bg-yellow-100')
  })

  it('applies hold variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'hold' } })
    expect(wrapper.classes()).toContain('bg-orange-100')
  })

  it('applies closed variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'closed' } })
    expect(wrapper.classes()).toContain('bg-green-100')
  })

  it('applies default variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: 'default' } })
    expect(wrapper.classes()).toContain('bg-gray-100')
  })

  it('uses default variant when no variant prop', () => {
    const wrapper = mount(Badge)
    expect(wrapper.classes()).toContain('bg-gray-100')
  })

  it('has rounded-full class for pill shape', () => {
    const wrapper = mount(Badge)
    expect(wrapper.classes()).toContain('rounded-full')
  })
})
