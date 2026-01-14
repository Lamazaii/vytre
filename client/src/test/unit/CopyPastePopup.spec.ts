import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CopyPastePopup from '../../components/popup/CopyPastePopup.vue'
import { usePopupStore } from '../../stores/popupStore'

describe('CopyPastePopup.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test visibility controlled by store
  it('displays when popup store is open', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '',
      },
    })
    
    await wrapper.vm.$nextTick()
    expect(store.isOpen).toBe(true)
    expect(wrapper.find('.overlay').exists()).toBe(true)
  })

  // Test hidden when closed
  it('hides when popup store is closed', () => {
    const store = usePopupStore()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '',
      },
    })
    
    expect(store.isOpen).toBe(false)
    expect(wrapper.find('.overlay').exists()).toBe(false)
  })

  // Test v-model updates
  it('emits update:modelValue when textarea changes', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: 'initial',
      },
    })
    
    await wrapper.vm.$nextTick()
    const textarea = wrapper.find('textarea')
    await textarea.setValue('new value')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  // Test submit action
  it('emits submit event with trimmed value', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '  test data  ',
      },
    })
    
    await wrapper.vm.$nextTick()
    const submitBtn = wrapper.find('.primaryButton')
    await submitBtn.trigger('click')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual(['test data'])
    expect(store.isOpen).toBe(false)
  })

  // Test cancel action
  it('emits cancel event and closes popup', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '',
      },
    })
    
    await wrapper.vm.$nextTick()
    const cancelBtn = wrapper.find('.ghostButton')
    await cancelBtn.trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(store.isOpen).toBe(false)
  })

  // Test close button
  it('closes popup via X button', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '',
      },
    })
    
    await wrapper.vm.$nextTick()
    const closeBtn = wrapper.find('.closeButton')
    await closeBtn.trigger('click')
    
    expect(store.isOpen).toBe(false)
  })

  // Test custom placeholder
  it('uses custom placeholder when provided', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '',
        placeholder: 'Custom placeholder',
      },
    })
    
    await wrapper.vm.$nextTick()
    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toBe('Custom placeholder')
  })

  // Test default placeholder
  it('uses default placeholder when not provided', async () => {
    const store = usePopupStore()
    store.openPopup()
    
    const wrapper = mount(CopyPastePopup, {
      props: {
        modelValue: '',
      },
    })
    
    await wrapper.vm.$nextTick()
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('placeholder')).toBeDefined()
  })
})
