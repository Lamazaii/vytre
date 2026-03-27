import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NameConflictPopup from '../../components/popup/NameConflictPopup.vue'
import { useNameConflictPopupStore } from '../../stores/nameConflictPopupStore'

describe('NameConflictPopup.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not render when store is closed', () => {
    const wrapper = mount(NameConflictPopup)
    expect(wrapper.find('.overlay').exists()).toBe(false)
  })

  it('renders when store is open', async () => {
    const store = useNameConflictPopupStore()
    store.show('MonDocument') // opens the popup
    const wrapper = mount(NameConflictPopup)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.overlay').exists()).toBe(true)
  })

  it('displays the conflicting document name', async () => {
    const store = useNameConflictPopupStore()
    store.show('NomConflict')
    const wrapper = mount(NameConflictPopup)
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('NomConflict')
  })

  it('calls handleValidate when Valider clicked', async () => {
    const store = useNameConflictPopupStore()
    store.show('Test')
    const wrapper = mount(NameConflictPopup)
    await wrapper.vm.$nextTick()
    await wrapper.find('.primaryButton').trigger('click')
    expect(store.isOpen).toBe(false)
  })

  it('calls handleRename when Changer le nom clicked', async () => {
    const store = useNameConflictPopupStore()
    store.show('Test')
    const wrapper = mount(NameConflictPopup)
    await wrapper.vm.$nextTick()
    await wrapper.find('.ghostButton').trigger('click')
    expect(store.isOpen).toBe(false)
  })

  it('calls handleRename when close button clicked', async () => {
    const store = useNameConflictPopupStore()
    store.show('Test')
    const wrapper = mount(NameConflictPopup)
    await wrapper.vm.$nextTick()
    await wrapper.find('.closeButton').trigger('click')
    expect(store.isOpen).toBe(false)
  })
})
