import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useErrorPopupStore } from '../../stores/errorPopupStore'

function initStore() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return useErrorPopupStore()
}

describe('errorPopupStore', () => {
  it('shows and closes with message reset', () => {
    const store = initStore()
    store.show('An error occurred')
    expect(store.isOpen).toBe(true)
    expect(store.message).toBe('An error occurred')

    store.close()
    expect(store.isOpen).toBe(false)
    expect(store.message).toBe('')
  })
})
