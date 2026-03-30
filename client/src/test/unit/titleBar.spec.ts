import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TitleBar from '../../components/optionBar/shared/titleBar.vue'
import { useBlocksStore } from '../../stores/blockStores'

describe('TitleBar.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    // Initialize the store to ensure it's available
    useBlocksStore()
  })

  // Test rendering
  it('renders title bar', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test container
  it('has title bar container', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    expect(wrapper.find('.titleBar').exists()).toBe(true)
  })

  // Test content wrapper
  it('has title bar content', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    expect(wrapper.find('.inputZone').exists()).toBe(true)
  })

  // Test separator bar
  it('displays separator bar', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    expect(wrapper.find('.SimpleBar').exists()).toBe(true)
  })

  // Test input field
  it('renders document title input', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    const input = wrapper.find('#documentTitleInput')
    expect(input.exists()).toBe(true)
    expect(input.element.tagName).toBe('INPUT')
  })

  // Test placeholder
  it('has placeholder text', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    const input = wrapper.find('#documentTitleInput')
    expect(input.attributes('placeholder')).toBe('Titre du document')
  })

  // Test v-model binding
  it('binds to document title store', async () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    const input = wrapper.find('#documentTitleInput')
    
    await input.setValue('New Title')
    
    expect((input.element as HTMLInputElement).value).toBe('New Title')
  })

  // Test enter key handling
  it('blurs input on enter key', async () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    const input = wrapper.find('#documentTitleInput')
    const blurSpy = vi.spyOn(input.element as HTMLInputElement, 'blur')
    
    await input.trigger('keydown.enter')
    
    expect(blurSpy).toHaveBeenCalled()
  })

  // Test focus handling
  it('selects text on focus', async () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    const input = wrapper.find('#documentTitleInput')
    const selectSpy = vi.spyOn(input.element as HTMLInputElement, 'select')
    
    await input.trigger('focus')
    
    expect(selectSpy).toHaveBeenCalled()
  })

  // Test input type
  it('is a text input', () => {
    const wrapper = mount(TitleBar, {
      global: {
        plugins: [pinia],
      },
    })
    const input = wrapper.find('#documentTitleInput')
    expect(input.attributes('type')).toBe('text')
  })

  it('renders home button when isMenu is false', () => {
    const wrapper = mount(TitleBar, {
      props: { isMenu: false },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.homeButton').exists()).toBe(true)
  })

  it('hides home button when isMenu is true', () => {
    const wrapper = mount(TitleBar, {
      props: { isMenu: true },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.homeButton').exists()).toBe(false)
  })

  it('emits home event when home button clicked', async () => {
    const wrapper = mount(TitleBar, {
      props: { isMenu: false },
      global: { plugins: [pinia] },
    })
    await wrapper.find('.homeButton').trigger('click')
    expect(wrapper.emitted('home')).toBeTruthy()
  })

  it('shows custom title when customTitle prop is provided', () => {
    const wrapper = mount(TitleBar, {
      props: { customTitle: 'Mon Titre Custom' },
      global: { plugins: [pinia] },
    })
    expect(wrapper.find('.customTitle').exists()).toBe(true)
    expect(wrapper.find('.customTitle').text()).toBe('Mon Titre Custom')
    expect(wrapper.find('#documentTitleInput').exists()).toBe(false)
  })
})
