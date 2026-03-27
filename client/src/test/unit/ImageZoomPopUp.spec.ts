import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageZoomPopUp from '../../components/popup/ImageZoomPopUp.vue'

const globalStubs = { Transition: { template: '<slot />' } }

describe('ImageZoomPopUp.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not render when isOpen is false', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: false, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('renders zoom popup when open', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('displays image with correct src', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test-image.jpg' },
      global: { stubs: globalStubs },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test-image.jpg')
    expect(img.classes()).toContain('modal-image')
  })

  it('uses imageAlt prop for alt text when provided', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg', imageAlt: 'My custom alt text' },
      global: { stubs: globalStubs },
    })
    expect(wrapper.find('img').attributes('alt')).toBe('My custom alt text')
  })

  it('has modal overlay that emits close on click', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    const overlay = wrapper.find('.modal-overlay')
    expect(overlay.exists()).toBe(true)
    await overlay.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('has close button that emits close event', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    const closeBtn = wrapper.find('.close-button')
    expect(closeBtn.exists()).toBe(true)
    expect(closeBtn.find('svg').exists()).toBe(true)
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not close when clicking on modal content', async () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    await wrapper.find('.modal-content').trigger('click')
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('wraps image in image-wrapper div', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    const imageWrapper = wrapper.find('.image-wrapper')
    expect(imageWrapper.exists()).toBe(true)
    expect(imageWrapper.find('img').exists()).toBe(true)
  })

  it('uses modal transition', () => {
    const wrapper = mount(ImageZoomPopUp, {
      props: { isOpen: true, imageSrc: 'test.jpg' },
      global: { stubs: globalStubs },
    })
    expect(wrapper.html()).toContain('modal-overlay')
  })
})
