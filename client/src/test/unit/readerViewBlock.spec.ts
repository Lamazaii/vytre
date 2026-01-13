import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReaderViewBlock from '../../components/readerView/readerViewBlock.vue'
import type { Block } from '../../types/Blocks'

describe('ReaderViewBlock.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering
  it('renders reader view block', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test description',
        modelValue: 1,
      },
      global: {
        stubs: {
          ImageZoom: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.blockRow').exists()).toBe(true)
  })

  // Test step number display
  it('displays step number', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 5,
        description: 'Test',
        modelValue: 1,
      },
      global: {
        stubs: { ImageZoom: { template: '<div></div>' } },
      },
    })
    const stepNumber = wrapper.find('.stepNumber')
    expect(stepNumber.text()).toBe('5')
  })

  // Test text content
  it('displays block description', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: '<p>Test description</p>',
        modelValue: 1,
      },
      global: {
        stubs: { ImageZoom: { template: '<div></div>' } },
      },
    })
    const desc = wrapper.find('.description')
    expect(desc.html()).toContain('Test description')
  })

  // Test images display
  it('displays block images when provided', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test',
        modelValue: 1,
        images: [{ id: 'img1', imagePath: 'test.jpg', position: 0 }],
      },
      global: {
        stubs: { ImageZoom: { template: '<div></div>' } },
      },
    })
    const images = wrapper.findAll('.blockImage')
    expect(images.length).toBe(1)
  })

  // Test repetition count
  it('displays repetition count', () => {
    const wrapper = mount(ReaderViewBlock, {
      props: {
        numero: 1,
        description: 'Test',
        modelValue: 3,
      },
      global: {
        stubs: { ImageZoom: { template: '<div></div>' } },
      },
    })
    const repValue = wrapper.find('.repetitionValue')
    expect(repValue.text()).toBe('3')
  })
})
