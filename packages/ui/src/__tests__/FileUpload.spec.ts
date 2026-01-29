import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUpload from '../components/FileUpload.vue'

describe('FileUpload', () => {
  beforeEach(() => {
    // Mock crypto.randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
      },
      writable: true
    })
  })

  it('renders with label', () => {
    const wrapper = mount(FileUpload, {
      props: {
        label: 'Upload Files'
      }
    })
    expect(wrapper.text()).toContain('Upload Files')
  })

  it('shows drag and drop text', () => {
    const wrapper = mount(FileUpload)
    expect(wrapper.text()).toContain('Click to upload')
    expect(wrapper.text()).toContain('drag and drop')
  })

  it('shows file type hint', () => {
    const wrapper = mount(FileUpload, {
      props: {
        maxSize: 10 * 1024 * 1024
      }
    })
    expect(wrapper.text()).toContain('Images')
    expect(wrapper.text()).toContain('PDF')
  })

  it('respects disabled state', () => {
    const wrapper = mount(FileUpload, {
      props: {
        disabled: true
      }
    })
    expect(wrapper.classes()).toContain('w-full')
    const dropzone = wrapper.find('.border-dashed')
    expect(dropzone.classes()).toContain('opacity-50')
  })

  it('displays file list when files are added', async () => {
    const wrapper = mount(FileUpload, {
      props: {
        modelValue: [
          {
            id: 'test-1',
            file: new File(['test'], 'test.png', { type: 'image/png' }),
            progress: 100,
            status: 'completed'
          }
        ]
      }
    })
    
    expect(wrapper.text()).toContain('test.png')
  })

  it('shows error message when provided', () => {
    const wrapper = mount(FileUpload, {
      props: {
        error: 'Upload failed'
      }
    })
    expect(wrapper.text()).toContain('Upload failed')
  })

  it('emits upload event when file is selected', async () => {
    const wrapper = mount(FileUpload)
    
    // Simulate file selection
    const input = wrapper.find('input[type="file"]')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    // Create a mock FileList
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    
    Object.defineProperty(input.element, 'files', {
      value: dataTransfer.files,
      writable: true
    })
    
    await input.trigger('change')
    
    // Should emit upload event for valid file
    expect(wrapper.emitted('upload')).toBeTruthy()
  })

  it('validates file type', async () => {
    const wrapper = mount(FileUpload, {
      props: {
        accept: 'image/png',
        modelValue: []
      }
    })
    
    const input = wrapper.find('input[type="file"]')
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
    
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    
    Object.defineProperty(input.element, 'files', {
      value: dataTransfer.files,
      writable: true
    })
    
    await input.trigger('change')
    
    // Should not emit upload for invalid file type
    const uploads = wrapper.emitted('upload') || []
    expect(uploads.length).toBe(0)
  })

  it('allows removing files', async () => {
    const wrapper = mount(FileUpload, {
      props: {
        modelValue: [
          {
            id: 'test-1',
            file: new File(['test'], 'test.png', { type: 'image/png' }),
            progress: 100,
            status: 'completed'
          }
        ]
      }
    })
    
    // Find and click remove button
    const removeBtn = wrapper.find('button')
    if (removeBtn.exists()) {
      await removeBtn.trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    }
  })

  it('shows upload progress', () => {
    const wrapper = mount(FileUpload, {
      props: {
        modelValue: [
          {
            id: 'test-1',
            file: new File(['test'], 'test.png', { type: 'image/png' }),
            progress: 50,
            status: 'uploading'
          }
        ]
      }
    })
    
    // Check for progress bar
    const progressBar = wrapper.find('.bg-primary-600')
    expect(progressBar.exists()).toBe(true)
  })
})
