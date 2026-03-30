import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DeletePopup from '../../components/popup/DeletePopup.vue'
import { useDeletePopupStore } from '../../stores/deletePopupStore'

describe('DeletePopup.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test initial state
  it('is hidden when store isVisible is false', () => {
    const store = useDeletePopupStore()
    const wrapper = mount(DeletePopup)
    
    expect(store.isVisible).toBe(false)
    expect(wrapper.find('.popup-overlay').exists()).toBe(false)
  })

  // Test visibility
  it('displays when store shows popup', async () => {
    const store = useDeletePopupStore()
    store.show('block', () => {})
    
    const wrapper = mount(DeletePopup)
    
    await wrapper.vm.$nextTick()
    expect(store.isVisible).toBe(true)
  })

  // Test confirm action
  it('calls confirm and closes popup', async () => {
    const store = useDeletePopupStore()
    let confirmed = false
    store.show('block', () => { confirmed = true })
    
    const wrapper = mount(DeletePopup)
    
    await wrapper.vm.$nextTick()
    store.confirm()
    
    expect(confirmed).toBe(true)
    expect(store.isVisible).toBe(false)
  })

  // Test cancel action
  it('closes popup on cancel', async () => {
    const store = useDeletePopupStore()
    store.show('block', () => {})
    
    const wrapper = mount(DeletePopup)
    
    await wrapper.vm.$nextTick()
    expect(store.isVisible).toBe(true)
    
    store.cancel()
    await wrapper.vm.$nextTick()
    
    expect(store.isVisible).toBe(false)
  })

  // Test multiple show/hide cycles
  it('handles multiple show/hide cycles', () => {
    const store = useDeletePopupStore()
    mount(DeletePopup)

    store.show('block', () => {})
    expect(store.isVisible).toBe(true)

    store.cancel()
    expect(store.isVisible).toBe(false)

    store.show('image', () => {})
    expect(store.isVisible).toBe(true)

    store.confirm()
    expect(store.isVisible).toBe(false)
  })

  it('shows block title when deleteType is block', async () => {
    const store = useDeletePopupStore()
    store.show('block', () => {})
    const wrapper = mount(DeletePopup)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('h2').text()).toContain('BLOC')
  })

  it('shows image title when deleteType is image', async () => {
    const store = useDeletePopupStore()
    store.show('image', () => {})
    const wrapper = mount(DeletePopup)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('h2').text()).toContain("IMAGE")
  })

  it('clicking cancel button calls store.cancel', async () => {
    const store = useDeletePopupStore()
    store.show('block', () => {})
    const wrapper = mount(DeletePopup)
    await wrapper.vm.$nextTick()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(store.isVisible).toBe(false)
  })

  it('clicking confirm button calls store.confirm', async () => {
    const store = useDeletePopupStore()
    let confirmed = false
    store.show('block', () => { confirmed = true })
    const wrapper = mount(DeletePopup)
    await wrapper.vm.$nextTick()
    await wrapper.find('.btn-confirm').trigger('click')
    expect(confirmed).toBe(true)
    expect(store.isVisible).toBe(false)
  })

  it('clicking close button calls store.cancel', async () => {
    const store = useDeletePopupStore()
    store.show('block', () => {})
    const wrapper = mount(DeletePopup)
    await wrapper.vm.$nextTick()
    await wrapper.find('.close-btn').trigger('click')
    expect(store.isVisible).toBe(false)
  })
})
