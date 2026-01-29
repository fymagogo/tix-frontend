import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from '../components/Select.vue'

const defaultOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

describe('Select', () => {
  it('renders a select element', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions },
    })
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('renders all options', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions },
    })
    const options = wrapper.findAll('option')
    // +1 for the placeholder option
    expect(options).toHaveLength(defaultOptions.length + 1)
  })

  it('renders label when provided', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions, label: 'Select Option' },
    })
    expect(wrapper.find('label').text()).toContain('Select Option')
  })

  it('shows required indicator when required', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions, label: 'Select Option', required: true },
    })
    expect(wrapper.find('span.text-red-500').text()).toBe('*')
  })

  it('displays placeholder as first disabled option', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions, placeholder: 'Choose one...' },
    })
    const placeholderOption = wrapper.find('option[disabled]')
    expect(placeholderOption.text()).toBe('Choose one...')
  })

  it('uses default placeholder when not provided', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions },
    })
    const placeholderOption = wrapper.find('option[disabled]')
    expect(placeholderOption.text()).toBe('Select an option')
  })

  it('disables select when disabled prop is true', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions, disabled: true },
    })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions, error: 'This field is required' },
    })
    expect(wrapper.find('.text-red-600').text()).toBe('This field is required')
  })

  it('applies error styling when error is present', () => {
    const wrapper = mount(Select, {
      props: { options: defaultOptions, error: 'Error' },
    })
    expect(wrapper.find('select').classes()).toContain('border-red-300')
  })

  it('supports v-model binding', async () => {
    const wrapper = mount(Select, {
      props: {
        options: defaultOptions,
        modelValue: 'option1',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e }),
      },
    })
    
    await wrapper.find('select').setValue('option2')
    expect(wrapper.props('modelValue')).toBe('option2')
  })
})
