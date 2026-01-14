import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReaderViewBar from '../../components/readerView/readerViewBar.vue'
import { usePopupStore } from '../../stores/popupStore'

describe('ReaderViewBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test rendering
  it('renders reader view bar', () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div class="toggle"></div>' },
        },
      },
    })
    expect(wrapper.find('.readerViewBar').exists()).toBe(true)
  })

  // Test icon toggle group
  it('includes IconToggleGroup component', () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div class="toggle"></div>' },
        },
      },
    })
    expect(wrapper.find('.toogleGroupContainer').exists()).toBe(true)
  })

  // Test save button
  it('has save button that emits save event', async () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
        },
      },
    })
    
    const saveBtn = wrapper.find('.saveButton')
    expect(saveBtn.exists()).toBe(true)
    expect(saveBtn.find('.saveButtonLabel').text()).toBe('ENREGISTRER')
    
    await saveBtn.trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
  })

  // Test save button icon
  it('displays floppy disk icon in save button', () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
        },
      },
    })
    
    const icon = wrapper.find('.saveButtonIcon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes('alt')).toBe('Enregistrer')
  })

  // Test toggle change handling
  it('closes reader when left toggle selected', () => {
    const store = usePopupStore()
    const closeSpy = vi.spyOn(store, 'closeReader')
    
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: true
        },
      },
    })
    
    // Call the handler directly
    const vm = wrapper.vm as any
    vm.handleToggleChange({ left: true, right: false })
    
    expect(closeSpy).toHaveBeenCalled()
  })

  // Test toggle props based on reader state
  it('renders toggle group container', () => {
    const store = usePopupStore()
    store.closeReader()
    
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: true,
        },
      },
    })
    
    expect(wrapper.find('.toogleGroupContainer').exists()).toBe(true)
  })

  // Test button container
  it('has save button spacer container', () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
        },
      },
    })
    
    expect(wrapper.find('.SaveButtonSpacer').exists()).toBe(true)
  })
})

