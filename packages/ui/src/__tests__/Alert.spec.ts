import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Alert from '../components/Alert.vue'

describe('Alert', () => {
  it('renders slot content', () => {
    const wrapper = mount(Alert, {
      slots: {
        default: 'Alert message'
      }
    })
    expect(wrapper.text()).toContain('Alert message')
  })

  it('applies info type classes by default', () => {
    const wrapper = mount(Alert)
    expect(wrapper.classes()).toContain('bg-blue-50')
  })

  it('applies success type classes', () => {
    const wrapper = mount(Alert, {
      props: { type: 'success' }
    })
    expect(wrapper.classes()).toContain('bg-green-50')
  })

  it('applies error type classes', () => {
    const wrapper = mount(Alert, {
      props: { type: 'error' }
    })
    expect(wrapper.classes()).toContain('bg-red-50')
  })

  it('applies warning type classes', () => {
    const wrapper = mount(Alert, {
      props: { type: 'warning' }
    })
    expect(wrapper.classes()).toContain('bg-yellow-50')
  })

  it('shows dismiss button when dismissible', () => {
    const wrapper = mount(Alert, {
      props: { dismissible: true }
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('does not show dismiss button by default', () => {
    const wrapper = mount(Alert)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits dismiss event when dismiss button clicked', async () => {
    const wrapper = mount(Alert, {
      props: { dismissible: true }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('dismiss')).toBeTruthy()
  })

  it('shows correct icon for each type', () => {
    const successWrapper = mount(Alert, { props: { type: 'success' } })
    expect(successWrapper.find('svg').exists()).toBe(true)

    const errorWrapper = mount(Alert, { props: { type: 'error' } })
    expect(errorWrapper.find('svg').exists()).toBe(true)

    const warningWrapper = mount(Alert, { props: { type: 'warning' } })
    expect(warningWrapper.find('svg').exists()).toBe(true)

    const infoWrapper = mount(Alert, { props: { type: 'info' } })
    expect(infoWrapper.find('svg').exists()).toBe(true)
  })
})
