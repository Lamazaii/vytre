import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNameConflictPopupStore } from '../../stores/nameConflictPopupStore'

describe('nameConflictPopupStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('is closed by default', () => {
    const store = useNameConflictPopupStore()
    expect(store.isOpen).toBe(false)
    expect(store.documentName).toBe('')
  })

  it('show opens the popup with the given name', async () => {
    const store = useNameConflictPopupStore()
    store.show('TestDoc')
    expect(store.isOpen).toBe(true)
    expect(store.documentName).toBe('TestDoc')
  })

  it('handleValidate closes popup and resolves with validate', async () => {
    const store = useNameConflictPopupStore()
    const promise = store.show('Test')
    store.handleValidate()
    const result = await promise
    expect(result).toBe('validate')
    expect(store.isOpen).toBe(false)
  })

  it('handleRename closes popup and resolves with rename', async () => {
    const store = useNameConflictPopupStore()
    const promise = store.show('Test')
    store.handleRename()
    const result = await promise
    expect(result).toBe('rename')
    expect(store.isOpen).toBe(false)
  })

  it('handleValidate without callback does not throw', () => {
    const store = useNameConflictPopupStore()
    // Without calling show() first, resolveCallback is null
    expect(() => store.handleValidate()).not.toThrow()
  })

  it('handleRename without callback does not throw', () => {
    const store = useNameConflictPopupStore()
    expect(() => store.handleRename()).not.toThrow()
  })
})
