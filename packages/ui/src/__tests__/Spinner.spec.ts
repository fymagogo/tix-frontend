import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from '../components/Spinner.vue'

describe('Spinner', () => {
  it('renders an SVG element', () => {
    const wrapper = mount(Spinner)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has animate-spin class', () => {
    const wrapper = mount(Spinner)
    expect(wrapper.find('svg').classes()).toContain('animate-spin')
  })

  it('applies md size classes by default', () => {
    const wrapper = mount(Spinner)
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-8')
    expect(svg.classes()).toContain('w-8')
  })

  it('applies sm size classes', () => {
    const wrapper = mount(Spinner, { props: { size: 'sm' } })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-4')
    expect(svg.classes()).toContain('w-4')
  })

  it('applies lg size classes', () => {
    const wrapper = mount(Spinner, { props: { size: 'lg' } })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-12')
    expect(svg.classes()).toContain('w-12')
  })

  it('is centered in a flex container', () => {
    const wrapper = mount(Spinner)
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('items-center')
    expect(wrapper.classes()).toContain('justify-center')
  })
})
