import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../components/Modal.vue'

describe('Modal', () => {
  it('renders modal content when open', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Test Modal' },
      slots: {
        default: 'Modal content'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain('Modal content')
  })

  it('does not render modal content when closed', () => {
    const wrapper = mount(Modal, {
      props: { open: false },
      slots: {
        default: 'Modal content'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).not.toContain('Modal content')
  })

  it('renders title when provided', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'My Modal Title' },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain('My Modal Title')
  })

  it('does not render title section when no title provided', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    // The modal-title id should not exist when no title
    expect(wrapper.find('#modal-title').exists()).toBe(false)
  })

  it('emits close event when overlay clicked', async () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    await wrapper.find('.bg-gray-500').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when close button clicked', async () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Test' },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    const closeButton = wrapper.find('button')
    expect(closeButton.exists()).toBe(true)
    await closeButton.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('has correct aria attributes', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('modal-title')
  })

  it('has correct role attribute', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Test' },
      slots: {
        default: 'Content',
        footer: '<button>Save</button>'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.find('.bg-gray-50').exists()).toBe(true)
  })

  it('does not render footer section when no footer slot', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Test' },
      slots: {
        default: 'Content'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    // The bg-gray-50 class is used in the footer
    expect(wrapper.find('.bg-gray-50').exists()).toBe(false)
  })

  it('renders overlay with aria-hidden', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    const overlay = wrapper.find('[aria-hidden="true"]')
    expect(overlay.exists()).toBe(true)
  })

  it('renders close button with screen reader text', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Test' },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('.sr-only').text()).toBe('Close')
  })

  it('renders modal title with correct id', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Test Title' },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    const title = wrapper.find('#modal-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Test Title')
  })

  it('renders default slot content', () => {
    const wrapper = mount(Modal, {
      props: { open: true },
      slots: {
        default: '<p>Custom content here</p>'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain('Custom content here')
  })
})
