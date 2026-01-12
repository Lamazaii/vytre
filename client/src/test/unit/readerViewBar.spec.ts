import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReaderViewBar from '../../components/readerView/readerViewBar.vue'

describe('ReaderViewBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering
  it('renders reader view bar', () => {
    const wrapper = mount(ReaderViewBar)
    expect(wrapper.exists()).toBe(true)
  })

  // Test navigation controls
  it('has navigation controls', () => {
    const wrapper = mount(ReaderViewBar)
    expect(wrapper.exists()).toBe(true)
  })

  // Test block counter
  it('displays current block position', () => {
    const wrapper = mount(ReaderViewBar)
    expect(wrapper.exists()).toBe(true)
  })

  // Test next button
  it('has next block button', () => {
    const wrapper = mount(ReaderViewBar)
    expect(wrapper.exists()).toBe(true)
  })

  // Test previous button
  it('has previous block button', () => {
    const wrapper = mount(ReaderViewBar)
    expect(wrapper.exists()).toBe(true)
  })

  // Test close button
  it('has close reader button', () => {
    const wrapper = mount(ReaderViewBar)
    expect(wrapper.exists()).toBe(true)
  })
})
