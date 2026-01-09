import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDeletePopupStore } from '../../stores/deletePopupStore'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

describe('deletePopupStore', () => {
  it('shows with a callback and confirms', () => {
    const store = useDeletePopupStore()
    const cb = vi.fn()

    store.show('image', cb)
    expect(store.isVisible).toBe(true)
    expect(store.deleteType).toBe('image')

    store.confirm()
    expect(cb).toHaveBeenCalled()
    expect(store.isVisible).toBe(false)
  })

  it('cancels and clears callback', () => {
    const store = useDeletePopupStore()
    const cb = vi.fn()
    store.show('block', cb)

    store.cancel()
    expect(store.isVisible).toBe(false)
    store.confirm()
    expect(cb).not.toHaveBeenCalled()
  })
})
