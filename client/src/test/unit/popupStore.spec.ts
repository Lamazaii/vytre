import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePopupStore } from '../../stores/popupStore'

function initStore() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return usePopupStore()
}

describe('popupStore', () => {
  it('opens and closes the generic popup', () => {
    const store = initStore()
    store.openPopup()
    expect(store.isOpen).toBe(true)
    store.closePopup()
    expect(store.isOpen).toBe(false)
  })

  it('opens and closes the reader', () => {
    const store = initStore()
    store.openReader()
    expect(store.isReaderOpen).toBe(true)
    store.closeReader()
    expect(store.isReaderOpen).toBe(false)
  })
})
