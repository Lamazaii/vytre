import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageZoomPopUp from '../../components/popup/ImageZoomPopUp.vue'

describe('ImageZoomPopUp.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test closed state
  it('does not render when isOpen is false', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: false,
        imageSrc: 'test.jpg',
      },
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  // Test rendering
  it('renders zoom popup when open', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  // Test image display
  it('displays image with correct src', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test-image.jpg',
      },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test-image.jpg')
    expect(img.classes()).toContain('modal-image')
  })

  // Test alt text
  it('uses imageAlt prop for alt text when provided', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
        imageAlt: 'My custom alt text',
      },
    })
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('My custom alt text')
  })

  // Test modal overlay
  it('has modal overlay that emits close on click', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const overlay = wrapper.find('.modal-overlay')
    expect(overlay.exists()).toBe(true)
    
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  // Test close button
  it('has close button that emits close event', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const closeBtn = wrapper.find('.close-button')
    expect(closeBtn.exists()).toBe(true)
    expect(closeBtn.text()).toBe('×')
    
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  // Test modal content click
  it('does not close when clicking on modal content', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const modalContent = wrapper.find('.modal-content')
    await modalContent.trigger('click')
    
    // Should not emit close event (click.stop prevents propagation)
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  // Test image wrapper
  it('wraps image in image-wrapper div', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    const imageWrapper = wrapper.find('.image-wrapper')
    expect(imageWrapper.exists()).toBe(true)
    expect(imageWrapper.find('img').exists()).toBe(true)
  })

  // Test transition
  it('uses modal transition', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: {
        isOpen: true,
        imageSrc: 'test.jpg',
      },
    })
    expect(wrapper.html()).toContain('modal-overlay')
  })
})

