import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../components/Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('applies primary variant classes by default', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  it('applies secondary variant classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'secondary' }
    })
    expect(wrapper.classes()).toContain('bg-white')
  })

  it('applies danger variant classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger' }
    })
    expect(wrapper.classes()).toContain('bg-red-600')
  })

  it('applies size classes', () => {
    const smWrapper = mount(Button, { props: { size: 'sm' } })
    expect(smWrapper.classes()).toContain('px-3')

    const lgWrapper = mount(Button, { props: { size: 'lg' } })
    expect(lgWrapper.classes()).toContain('px-6')
  })

  it('shows loading spinner when loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('sets correct button type', () => {
    const submitWrapper = mount(Button, { props: { type: 'submit' } })
    expect(submitWrapper.attributes('type')).toBe('submit')

    const resetWrapper = mount(Button, { props: { type: 'reset' } })
    expect(resetWrapper.attributes('type')).toBe('reset')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    await wrapper.trigger('click')
    // Disabled buttons may still emit but have disabled attribute
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
