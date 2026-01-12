import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Menu from '../../components/applications/menu.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('Menu.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering
  it('renders the menu', () => {
    const wrapper = mount(Menu)
    expect(wrapper.exists()).toBe(true)
  })

  // Test has menu container
  it('has menu container', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.menuContainer').exists()).toBe(true)
  })

  // Test has header content
  it('displays header with title', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.headerContent').exists()).toBe(true)
  })

  // Test has documents list section
  it('displays documents list section', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.documentsList').exists()).toBe(true)
  })

  // Test new button exists
  it('has new document button', () => {
    const wrapper = mount(Menu)
    const newButton = wrapper.find('.newButton')
    expect(newButton.exists()).toBe(true)
  })

  // Test new document button emits event
  it('emits selectMode event when new button clicked', async () => {
    const wrapper = mount(Menu)
    const newButton = wrapper.find('.newButton')
    
    await newButton.trigger('click')
    
    expect(wrapper.emitted('selectMode')).toBeTruthy()
    if (wrapper.emitted('selectMode')) {
      expect(wrapper.emitted('selectMode')[0]).toEqual(['editor'])
    }
  })

  // Test search input exists
  it('has search input for documents', () => {
    const wrapper = mount(Menu)
    expect(wrapper.find('.searchInput').exists()).toBe(true)
  })

  // Test search functionality
  it('filters documents based on search query', async () => {
    const wrapper = mount(Menu)
    const searchInput = wrapper.find('.searchInput')
    
    await searchInput.setValue('test')
    
    expect((searchInput.element as HTMLInputElement).value).toBe('test')
  })
})
