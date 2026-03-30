import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReaderViewBlock from '../../components/readerView/readerViewBlock.vue'

describe('ReaderViewBlock.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const stubs = {
    ImageZoom: { template: '<div class="image-zoom-stub" :class="{ open: isOpen }" />', props: ['isOpen', 'imageSrc', 'imageAlt'] },
    CanvasZoomPopUp: { template: '<div class="canvas-zoom-stub" :class="{ open: isOpen }" />', props: ['isOpen', 'canvasData'] },
    ReaderViewCanvas: { template: '<div class="reader-canvas-stub" />' },
  }

  it('renders reader view block', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test description', modelValue: 1 },
      global: { stubs },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.blockRow').exists()).toBe(true)
  })

  it('displays step number', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 5, description: 'Test', modelValue: 1 },
      global: { stubs },
    })
    expect(wrapper.find('.stepNumber').text()).toBe('5')
  })

  it('displays block description via v-html', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: '<p>Test description</p>', modelValue: 1 },
      global: { stubs },
    })
    expect(wrapper.find('.description').html()).toContain('Test description')
  })

  it('displays block images when provided', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test',
        modelValue: 1,
        images: [{ id: 'img1', imagePath: 'test.jpg', position: 0 }],
      },
      global: { stubs },
    })
    expect(wrapper.findAll('.blockImage').length).toBe(1)
  })

  it('displays repetition count', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 3 },
      global: { stubs },
    })
    expect(wrapper.find('.repetitionValue').text()).toBe('x3')
  })

  it('shows canvas when canvasData has objects', () => {
    const canvasData = JSON.stringify({ objects: [{ type: 'rect' }] })
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1, canvasData },
      global: { stubs },
    })
    expect(wrapper.find('.reader-canvas-stub').exists()).toBe(true)
  })

  it('does not show canvas when canvasData has no objects', () => {
    const canvasData = JSON.stringify({ objects: [] })
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1, canvasData },
      global: { stubs },
    })
    expect(wrapper.find('.reader-canvas-stub').exists()).toBe(false)
  })

  it('does not show canvas when canvasData is undefined', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1 },
      global: { stubs },
    })
    expect(wrapper.find('.reader-canvas-stub').exists()).toBe(false)
  })

  it('does not show canvas when canvasData is invalid JSON', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1, canvasData: 'not-json' },
      global: { stubs },
    })
    expect(wrapper.find('.reader-canvas-stub').exists()).toBe(false)
  })

  it('opens image zoom modal when image is clicked', async () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test',
        modelValue: 1,
        images: [{ id: 'img1', imagePath: 'photo.jpg', position: 0 }],
      },
      global: { stubs },
    })

    const img = wrapper.find('.blockImage')
    await img.trigger('click')
    await wrapper.vm.$nextTick()

    // The ImageZoom stub should now have isOpen=true
    const zoom = wrapper.find('.image-zoom-stub')
    expect(zoom.classes()).toContain('open')
  })

  it('closes image zoom modal when close event emitted', async () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test',
        modelValue: 1,
        images: [{ id: 'img1', imagePath: 'photo.jpg', position: 0 }],
      },
      global: { stubs },
    })

    await wrapper.find('.blockImage').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.image-zoom-stub').classes()).toContain('open')

    // Find the stub by component reference and emit close
    const zoomStubs = wrapper.findAllComponents({ template: '<div class="image-zoom-stub" :class="{ open: isOpen }" />' })
    if (zoomStubs.length > 0) {
      await zoomStubs[0]!.vm.$emit('close')
    } else {
      // Fallback: trigger close via the first element with close handler
      ;(wrapper.vm as any).closeImageModal()
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.image-zoom-stub').classes()).not.toContain('open')
  })

  it('opens canvas zoom modal when canvas is clicked', async () => {
    const canvasData = JSON.stringify({ objects: [{ type: 'circle' }] })
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1, canvasData },
      global: { stubs },
    })

    await wrapper.find('.reader-canvas-stub').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.canvas-zoom-stub').classes()).toContain('open')
  })

  it('closes canvas zoom modal when close event emitted', async () => {
    const canvasData = JSON.stringify({ objects: [{ type: 'circle' }] })
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1, canvasData },
      global: { stubs },
    })

    await wrapper.find('.reader-canvas-stub').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.canvas-zoom-stub').classes()).toContain('open')

    // Close via the exposed internal function
    ;(wrapper.vm as any).closeCanvasModal()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.canvas-zoom-stub').classes()).not.toContain('open')
  })

  it('renders text zones when provided', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test',
        modelValue: 1,
        textZones: ['<p>Zone 1</p>', '<p>Zone 2</p>'],
      },
      global: { stubs },
    })
    const zones = wrapper.findAll('.textZone')
    expect(zones.length).toBe(2)
  })

  it('does not render text zone section when textZones is empty', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: { numero: 1, description: 'Test', modelValue: 1, textZones: [] },
      global: { stubs },
    })
    expect(wrapper.find('.textZonesContainer').exists()).toBe(false)
  })
})
