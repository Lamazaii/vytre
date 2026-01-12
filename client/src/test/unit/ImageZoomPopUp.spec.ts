import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageZoomPopUp from '../../components/popup/ImageZoomPopUp.vue'

describe('ImageZoomPopUp.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering
  it('renders zoom popup', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test with image URL
  it('displays image when URL provided', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test.jpg')
  })

  // Test overlay
  it('has modal overlay', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const overlay = wrapper.find('.modal-overlay')
    expect(overlay.exists()).toBe(true)
  })

  // Test close functionality
  it('emits close event when button clicked', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const closeBtn = wrapper.find('.close-button')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  // Test image display
  it('renders enlarged image', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const img = wrapper.find('.modal-image')
    expect(img.exists()).toBe(true)
  })
})
