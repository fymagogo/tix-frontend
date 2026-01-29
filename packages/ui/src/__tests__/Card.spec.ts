import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '../components/Card.vue'

describe('Card', () => {
  it('renders slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Card content'
      }
    })
    expect(wrapper.text()).toContain('Card content')
  })

  it('renders header slot when provided', () => {
    const wrapper = mount(Card, {
      slots: {
        header: 'Card Header',
        default: 'Card content'
      }
    })
    expect(wrapper.text()).toContain('Card Header')
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Card content',
        footer: 'Card Footer'
      }
    })
    expect(wrapper.text()).toContain('Card Footer')
  })

  it('applies padding by default', () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('p-4')
  })

  it('does not apply padding when padding is false', () => {
    const wrapper = mount(Card, {
      props: { padding: false }
    })
    expect(wrapper.classes()).not.toContain('p-4')
  })

  it('applies hover shadow when clickable', () => {
    const wrapper = mount(Card, {
      props: { clickable: true }
    })
    expect(wrapper.classes()).toContain('cursor-pointer')
    expect(wrapper.classes()).toContain('hover:shadow-md')
  })

  it('emits click event when clickable and clicked', async () => {
    const wrapper = mount(Card, {
      props: { clickable: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when not clickable', async () => {
    const wrapper = mount(Card, {
      props: { clickable: false }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('has base styling classes', () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('bg-white')
    expect(wrapper.classes()).toContain('rounded-lg')
    expect(wrapper.classes()).toContain('shadow')
  })
})
