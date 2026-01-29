import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '../components/Input.vue'

describe('Input', () => {
  it('renders with label', () => {
    const wrapper = mount(Input, {
      props: { label: 'Email' }
    })
    expect(wrapper.find('label').text()).toContain('Email')
  })

  it('shows required asterisk when required', () => {
    const wrapper = mount(Input, {
      props: { label: 'Email', required: true }
    })
    expect(wrapper.find('.text-red-500').text()).toBe('*')
  })

  it('does not show required asterisk when not required', () => {
    const wrapper = mount(Input, {
      props: { label: 'Email', required: false }
    })
    expect(wrapper.find('.text-red-500').exists()).toBe(false)
  })

  it('sets correct input type', () => {
    const passwordWrapper = mount(Input, { props: { type: 'password' } })
    expect(passwordWrapper.find('input').attributes('type')).toBe('password')

    const emailWrapper = mount(Input, { props: { type: 'email' } })
    expect(emailWrapper.find('input').attributes('type')).toBe('email')
  })

  it('sets placeholder', () => {
    const wrapper = mount(Input, {
      props: { placeholder: 'Enter email' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter email')
  })

  it('displays error message', () => {
    const wrapper = mount(Input, {
      props: { error: 'Invalid email' }
    })
    expect(wrapper.find('.text-red-600').text()).toBe('Invalid email')
  })

  it('applies error styles when error prop is provided', () => {
    const wrapper = mount(Input, {
      props: { error: 'Invalid' }
    })
    expect(wrapper.find('input').classes()).toContain('border-red-300')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(Input, {
      props: { disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('updates v-model on input', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: '' }
    })
    await wrapper.find('input').setValue('test@example.com')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test@example.com'])
  })
})
