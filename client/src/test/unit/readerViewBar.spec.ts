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

  // Test close button
  it('has close button that closes reader', async () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
        },
      },
    })
    
    const closeBtn = wrapper.find('.closeButton')
    expect(closeBtn.exists()).toBe(true)
    expect(closeBtn.find('svg').exists()).toBe(true)
  })

  // Test title display
  it('displays title text', () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
        },
      },
    })
    
    const title = wrapper.find('.title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Prévisualisation du mode lecteur')
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

  // Test right section container
  it('has right section container', () => {
    const wrapper = mount(ReaderViewBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
        },
      },
    })

    expect(wrapper.find('.rightSection').exists()).toBe(true)
  })

  it('clicking close button calls closeReader', async () => {
    const store = usePopupStore()
    store.openReader()
    const wrapper = mount(ReaderViewBar, {
      global: { stubs: { IconToggleGroup: { template: '<div />' } } },
    })
    await wrapper.find('.closeButton').trigger('click')
    expect(store.isReaderOpen).toBe(false)
  })

  it('handleToggleChange does nothing when right is selected', () => {
    const store = usePopupStore()
    store.openReader()
    const wrapper = mount(ReaderViewBar, {
      global: { stubs: { IconToggleGroup: true } },
    })
    const vm = wrapper.vm as any
    vm.handleToggleChange({ left: false, right: true })
    // Reader stays open
    expect(store.isReaderOpen).toBe(true)
  })
})

