import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useConfirmSavePopupStore } from '../../stores/confirmSavePopupStore'

describe('confirmSavePopupStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test initial state
  it('initializes with popup closed', () => {
    const store = useConfirmSavePopupStore()
    expect(store.isOpen).toBe(false)
    expect(store.message).toBe('')
  })

  // Test show function
  it('opens popup and sets message', () => {
    const store = useConfirmSavePopupStore()
    const testMessage = 'Document saved successfully!'
    
    store.show(testMessage)
    
    expect(store.isOpen).toBe(true)
    expect(store.message).toBe(testMessage)
  })

  // Test close function
  it('closes popup and clears message', () => {
    const store = useConfirmSavePopupStore()
    
    store.show('Test message')
    expect(store.isOpen).toBe(true)
    
    store.close()
    
    expect(store.isOpen).toBe(false)
    expect(store.message).toBe('')
  })

  // Test multiple show/close cycles
  it('handles multiple show/close cycles', () => {
    const store = useConfirmSavePopupStore()
    
    store.show('Message 1')
    expect(store.message).toBe('Message 1')
    expect(store.isOpen).toBe(true)
    
    store.close()
    expect(store.message).toBe('')
    expect(store.isOpen).toBe(false)
    
    store.show('Message 2')
    expect(store.message).toBe('Message 2')
    expect(store.isOpen).toBe(true)
  })

  // Test different message types
  it('handles different message content', () => {
    const store = useConfirmSavePopupStore()
    
    const messages = [
      'Document sauvegardé avec succès !',
      'Changes saved',
      'Error occurred',
      '',
    ]
    
    messages.forEach(msg => {
      store.show(msg)
      expect(store.message).toBe(msg)
    })
  })
})
