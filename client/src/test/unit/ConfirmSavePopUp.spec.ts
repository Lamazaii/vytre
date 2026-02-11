import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConfirmSavePopUp from '../../components/popup/ConfirmSavePopUp.vue'
import { useConfirmSavePopupStore } from '../../stores/confirmSavePopupStore'

describe('ConfirmSavePopUp.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test visibility
  it('displays when store isOpen is true', async () => {
    const store = useConfirmSavePopupStore()
    store.show('Success message')
    
    const wrapper = mount(ConfirmSavePopUp)
    
    await wrapper.vm.$nextTick()
    expect(store.isOpen).toBe(true)
    expect(wrapper.find('.popup-overlay').exists()).toBe(true)
  })

  // Test hidden state
  it('hides when store isOpen is false', () => {
    const store = useConfirmSavePopupStore()
    
    const wrapper = mount(ConfirmSavePopUp)
    
    expect(store.isOpen).toBe(false)
    expect(wrapper.find('.popup-overlay').exists()).toBe(false)
  })

  // Test message display
  it('displays message from store', async () => {
    const store = useConfirmSavePopupStore()
    const testMessage = 'Document sauvegardé avec succès !'
    store.show(testMessage)
    
    const wrapper = mount(ConfirmSavePopUp)
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain(testMessage)
  })

  // Test OK button closes popup
  it('closes popup when OK button is clicked', async () => {
    const store = useConfirmSavePopupStore()
    store.show('Test')
    
    const wrapper = mount(ConfirmSavePopUp)
    
    await wrapper.vm.$nextTick()
    const okBtn = wrapper.find('.btn-confirm')
    
    await okBtn.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(store.isOpen).toBe(false)
  })

  // Test close button
  it('closes popup via X button', async () => {
    const store = useConfirmSavePopupStore()
    store.show('Test')
    
    const wrapper = mount(ConfirmSavePopUp)
    
    await wrapper.vm.$nextTick()
    const closeBtn = wrapper.find('.close-btn')
    
    await closeBtn.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(store.isOpen).toBe(false)
  })

  // Test multiple messages
  it('updates message content dynamically', async () => {
    const store = useConfirmSavePopupStore()
    
    const wrapper = mount(ConfirmSavePopUp)
    
    store.show('First message')
    await wrapper.vm.$nextTick()
    expect(store.message).toBe('First message')
    
    store.show('Second message')
    await wrapper.vm.$nextTick()
    expect(store.message).toBe('Second message')
  })
})
