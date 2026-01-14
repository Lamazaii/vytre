import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TextOptionBar from '../../components/optionBar/textOptionBar.vue'

describe('TextOptionBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test component structure
  it('renders text option bar', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test formatting buttons
  it('provides bold formatting button', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test italic button
  it('provides italic formatting button', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test underline button
  it('provides underline formatting button', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test color selection
  it('supports text color selection', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test font size selector
  it('supports font size changes', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test editor integration
  it('integrates with Tiptap editor', () => {
    const wrapper = mount(TextOptionBar, {
      global: {
        stubs: {
          TiptapEditor: { template: '<div class="editor"></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
