import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ErrorPopup from '../../components/popup/ErrorPopup.vue'
import { useErrorPopupStore } from '../../stores/errorPopupStore'

describe('ErrorPopup.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test visibility based on store state
  it('displays popup when store isOpen is true', async () => {
    const store = useErrorPopupStore()
    store.show('Error message')
    
    const wrapper = mount(ErrorPopup)
    
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.popup-overlay').exists()).toBe(true)
  })

  // Test popup hidden when closed
  it('hides popup when store isOpen is false', () => {
    const store = useErrorPopupStore()
    
    const wrapper = mount(ErrorPopup)
    
    expect(wrapper.find('.popup-overlay').exists()).toBe(false)
  })

  // Test message display
  it('displays the error message from store', async () => {
    const store = useErrorPopupStore()
    store.show('Test error message')
    
    const wrapper = mount(ErrorPopup)
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Test error message')
  })

  // Test close button functionality
  it('closes popup when OK button is clicked', async () => {
    const store = useErrorPopupStore()
    store.show('Error')
    
    const wrapper = mount(ErrorPopup)
    
    await wrapper.vm.$nextTick()
    const button = wrapper.find('.btn-confirm')
    
    await button.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(store.isOpen).toBe(false)
  })

  // Test close via X button
  it('closes popup when close button is clicked', async () => {
    const store = useErrorPopupStore()
    store.show('Error')
    
    const wrapper = mount(ErrorPopup)
    
    await wrapper.vm.$nextTick()
    const closeBtn = wrapper.find('.close-btn')
    
    await closeBtn.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(store.isOpen).toBe(false)
  })
})

