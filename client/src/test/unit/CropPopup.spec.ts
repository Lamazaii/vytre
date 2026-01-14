import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CropPopup from '../../components/popup/CropPopup.vue'
import { useImageCropStore } from '../../stores/imageCropStore'

describe('CropPopup.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering when closed
  it('does not render when cropper is closed', () => {
    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div class="cropper"></div>' },
        },
      },
    })
    expect(wrapper.find('.cropper-modal-overlay').exists()).toBe(false)
  })

  // Test rendering when open
  it('renders crop popup when cropper is open with image', () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test-image.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div class="cropper"></div>' },
        },
      },
    })
    expect(wrapper.find('.cropper-modal-overlay').exists()).toBe(true)
  })

  // Test header elements
  it('displays header with title and close button', () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div></div>' },
        },
      },
    })
    
    expect(wrapper.find('.cropper-title').text()).toBe("Rogner l'image")
    expect(wrapper.find('.cropper-close-button').exists()).toBe(true)
  })

  // Test cancel button
  it('has cancel button that closes popup', async () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div></div>' },
        },
      },
    })
    
    const cancelBtn = wrapper.find('.cropper-ghost-button')
    expect(cancelBtn.exists()).toBe(true)
    expect(cancelBtn.text()).toBe('Annuler')
    
    await cancelBtn.trigger('click')
    expect(store.isCropperOpen).toBe(false)
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  // Test close button (X)
  it('closes popup when X button clicked', async () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div></div>' },
        },
      },
    })
    
    const closeBtn = wrapper.find('.cropper-close-button')
    await closeBtn.trigger('click')
    
    expect(store.isCropperOpen).toBe(false)
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  // Test confirm button
  it('has confirm button', () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div></div>' },
        },
      },
    })
    
    const confirmBtn = wrapper.find('.cropper-primary-button')
    expect(confirmBtn.exists()).toBe(true)
    expect(confirmBtn.text()).toBe('CONFIRMER')
  })

  // Test confirm with cropped image
  it('emits crop event with image data when confirmed', async () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test.jpg'

    const mockCanvas = {
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock')
    }

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: {
            template: '<div></div>',
            methods: {
              getResult: () => ({ canvas: mockCanvas })
            }
          },
        },
      },
    })
    
    // Simulate cropper ref
    wrapper.vm.cropperRef = {
      getResult: () => ({ canvas: mockCanvas })
    }
    
    const confirmBtn = wrapper.find('.cropper-primary-button')
    await confirmBtn.trigger('click')
    
    expect(wrapper.emitted('crop')).toBeTruthy()
    expect(wrapper.emitted('crop')?.[0]).toEqual(['data:image/png;base64,mock'])
    expect(store.isCropperOpen).toBe(false)
  })

  // Test cropper component rendering
  it('renders cropper component with correct src', () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'my-image.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div class="cropper"></div>' },
        },
      },
    })
    
    expect(wrapper.find('.cropper-engine-wrapper').exists()).toBe(true)
  })

  // Test footer buttons
  it('has footer with both action buttons', () => {
    const store = useImageCropStore()
    store.isCropperOpen = true
    store.imageToCropSrc = 'test.jpg'

    const wrapper = mount(CropPopup, {
      global: {
        stubs: {
          Cropper: { template: '<div></div>' },
        },
      },
    })
    
    const footer = wrapper.find('.cropper-footer')
    expect(footer.exists()).toBe(true)
    expect(footer.findAll('button')).toHaveLength(2)
  })
})
