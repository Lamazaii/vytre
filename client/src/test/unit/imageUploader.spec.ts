import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageUploader from '../../components/blocks/EditableBlock/imageUploader.vue'

describe('imageUploader.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders addImage container', () => {
    const wrapper = mount(ImageUploader)
    expect(wrapper.find('.addImage').exists()).toBe(true)
  })

  it('renders add image text', () => {
    const wrapper = mount(ImageUploader)
    expect(wrapper.find('.addImageText').exists()).toBe(true)
  })

  it('has a hidden file input', () => {
    const wrapper = mount(ImageUploader)
    const input = wrapper.find('input[type="file"]')
    expect(input.exists()).toBe(true)
  })

  it('exposes triggerFileInput method', () => {
    const wrapper = mount(ImageUploader)
    expect(typeof (wrapper.vm as any).triggerFileInput).toBe('function')
  })

  it('calls click on file input when triggerFileInput is called', () => {
    const wrapper = mount(ImageUploader)
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {})
    ;(wrapper.vm as any).triggerFileInput()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('emits upload with data URL when a valid image is selected', async () => {
    const wrapper = mount(ImageUploader)

    // Mock FileReader
    const mockResult = 'data:image/png;base64,abc123'
    const mockReader = {
      onload: null as any,
      readAsDataURL: vi.fn(function (this: any) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: mockResult } })
          }
        }, 0)
      }),
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockReader))

    const file = new File(['content'], 'photo.png', { type: 'image/png' })
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement

    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    await wrapper.find('input[type="file"]').trigger('change')

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.emitted('upload')).toBeTruthy()
    expect(wrapper.emitted('upload')![0]).toEqual([mockResult])

    vi.unstubAllGlobals()
  })

  it('does not emit upload when file type is not image', async () => {
    const wrapper = mount(ImageUploader)

    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    await wrapper.find('input[type="file"]').trigger('change')

    expect(wrapper.emitted('upload')).toBeFalsy()
  })

  it('does not emit upload when no files selected', async () => {
    const wrapper = mount(ImageUploader)
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [], configurable: true })
    await wrapper.find('input[type="file"]').trigger('change')
    expect(wrapper.emitted('upload')).toBeFalsy()
  })
})
