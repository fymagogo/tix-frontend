import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextArea from '../components/TextArea.vue'

describe('TextArea', () => {
  it('renders a textarea element', () => {
    const wrapper = mount(TextArea)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('renders label when provided', () => {
    const wrapper = mount(TextArea, {
      props: { label: 'Description' },
    })
    expect(wrapper.find('label').text()).toContain('Description')
  })

  it('shows required indicator when required', () => {
    const wrapper = mount(TextArea, {
      props: { label: 'Description', required: true },
    })
    expect(wrapper.find('span.text-red-500').text()).toBe('*')
  })

  it('sets placeholder text', () => {
    const wrapper = mount(TextArea, {
      props: { placeholder: 'Enter description...' },
    })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Enter description...')
  })

  it('uses default rows value of 4', () => {
    const wrapper = mount(TextArea)
    expect(wrapper.find('textarea').attributes('rows')).toBe('4')
  })

  it('allows custom rows value', () => {
    const wrapper = mount(TextArea, {
      props: { rows: 8 },
    })
    expect(wrapper.find('textarea').attributes('rows')).toBe('8')
  })

  it('disables textarea when disabled prop is true', () => {
    const wrapper = mount(TextArea, {
      props: { disabled: true },
    })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(TextArea, {
      props: { error: 'This field is required' },
    })
    expect(wrapper.find('.text-red-600').text()).toBe('This field is required')
  })

  it('applies error styling when error is present', () => {
    const wrapper = mount(TextArea, {
      props: { error: 'Error' },
    })
    expect(wrapper.find('textarea').classes()).toContain('border-red-300')
  })

  it('supports v-model binding', async () => {
    const wrapper = mount(TextArea, {
      props: {
        modelValue: 'initial text',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e }),
      },
    })
    
    await wrapper.find('textarea').setValue('updated text')
    expect(wrapper.props('modelValue')).toBe('updated text')
  })

  it('sets required attribute when required', () => {
    const wrapper = mount(TextArea, {
      props: { required: true },
    })
    expect(wrapper.find('textarea').attributes('required')).toBeDefined()
  })
})
