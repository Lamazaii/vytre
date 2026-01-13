import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReaderViewWindow from '../../components/readerView/readerViewWindow.vue'
import { usePopupStore } from '../../stores/popupStore'
import { useBlocksStore } from '../../stores/blockStores'

describe('ReaderViewWindow.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test closed state
  it('does not render when reader is closed', () => {
    const popupStore = usePopupStore()
    popupStore.closeReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div class="bar"></div>' },
          ReaderViewBlock: { template: '<div class="block"></div>' },
        },
      },
    })
    expect(wrapper.find('.overlay').exists()).toBe(false)
  })

  // Test open state
  it('renders reader view window when reader is open', () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div></div>' },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.overlay').exists()).toBe(true)
    expect(wrapper.find('.popup').exists()).toBe(true)
  })

  // Test overlay click closes reader
  it('closes reader when clicking overlay', async () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div></div>' },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })

    const overlay = wrapper.find('.overlay')
    await overlay.trigger('click')
    expect(popupStore.isReaderOpen).toBe(false)
  })

  // Test popup content click does not close
  it('does not close when clicking popup content', async () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div></div>' },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })

    const popup = wrapper.find('.popup')
    await popup.trigger('click')
    expect(popupStore.isReaderOpen).toBe(true)
  })

  // Test bar component
  it('includes ReaderViewBar component', () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div class="bar"></div>' },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.readerViewWindow').exists()).toBe(true)
  })

  // Test save event propagation
  it('propagates save event from bar', async () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: {
            template: '<button class="test-save-btn" @click="$emit(\'save\')">Save</button>',
          },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })

    const btn = wrapper.find('.test-save-btn')
    await btn.trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
  })

  // Test block header
  it('displays block header with columns', () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div></div>' },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })

    const header = wrapper.find('.blockHeader')
    expect(header.exists()).toBe(true)
    expect(header.find('.headerNumber').text()).toBe('N°')
    expect(header.find('.headerDescription').text()).toBe("Détail de l'opération")
    expect(header.find('.headerRep').text()).toBe('REP.')
  })

  // Test renders blocks from store
  it('renders blocks from blocks store', () => {
    const popupStore = usePopupStore()
    const blocksStore = useBlocksStore()
    popupStore.openReader()

    blocksStore.blocks = [
      { id: 1, text: 'Block 1', step: 1, nbOfRepeats: 1, modified: false, images: [] },
      { id: 2, text: 'Block 2', step: 2, nbOfRepeats: 2, modified: false, images: [] },
    ]

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div></div>' },
          ReaderViewBlock: { template: '<div class="block"></div>' },
        },
      },
    })

    expect(wrapper.findAll('.block')).toHaveLength(2)
  })

  // Test reader app container
  it('has readerApp container with content', () => {
    const popupStore = usePopupStore()
    popupStore.openReader()

    const wrapper = mount(ReaderViewWindow, {
      global: {
        stubs: {
          ReaderViewBar: { template: '<div></div>' },
          ReaderViewBlock: { template: '<div></div>' },
        },
      },
    })

    expect(wrapper.find('.readerApp').exists()).toBe(true)
    expect(wrapper.find('.readerWindowContent').exists()).toBe(true)
  })
})
