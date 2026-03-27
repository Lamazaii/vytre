import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import Lector from '../../components/applications/lector.vue'

describe('Lector.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const stubs = {
    TitleBar: { template: '<div class="title-bar-stub" />', props: ['isReadOnly'] },
    ReaderViewBlock: {
      template: '<div class="reader-block-stub" />',
      props: ['numero', 'description', 'modelValue', 'images', 'textZones', 'canvasData'],
    },
  }

  it('renders the lector component', () => {
    const wrapper = mount(Lector, {
      global: { plugins: [createTestingPinia()], stubs },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.app-lector').exists()).toBe(true)
  })

  it('renders the TitleBar with isReadOnly=true', () => {
    const wrapper = mount(Lector, {
      global: { plugins: [createTestingPinia()], stubs },
    })
    const titleBar = wrapper.find('.title-bar-stub')
    expect(titleBar.exists()).toBe(true)
  })

  it('renders the reader window content section', () => {
    const wrapper = mount(Lector, {
      global: { plugins: [createTestingPinia()], stubs },
    })
    expect(wrapper.find('.readerWindowContent').exists()).toBe(true)
  })

  it('renders one ReaderViewBlock for each block in the store', () => {
    const wrapper = mount(Lector, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            blocks: {
              blocks: [
                { id: 1, text: '<p>Step 1</p>', step: 1, nbOfRepeats: 1, images: [], textZones: [] },
                { id: 2, text: '<p>Step 2</p>', step: 2, nbOfRepeats: 2, images: [], textZones: [] },
              ],
            },
          },
        })],
        stubs,
      },
    })

    expect(wrapper.findAll('.reader-block-stub').length).toBe(2)
  })

  it('emits selectMode with "menu" when home is triggered', async () => {
    const wrapper = mount(Lector, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          TitleBar: {
            template: '<button class="home-btn" @click="$emit(\'home\')">Home</button>',
            emits: ['home'],
          },
          ReaderViewBlock: { template: '<div />', props: ['numero', 'description', 'modelValue'] },
        },
      },
    })

    await wrapper.find('.home-btn').trigger('click')
    expect(wrapper.emitted('selectMode')).toBeTruthy()
    expect(wrapper.emitted('selectMode')![0]).toEqual(['menu'])
  })

  it('renders the block header section', () => {
    const wrapper = mount(Lector, {
      global: { plugins: [createTestingPinia()], stubs },
    })
    expect(wrapper.find('.blockHeader').exists()).toBe(true)
    expect(wrapper.text()).toContain('N°')
  })
})
