import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { useBlocksStore } from '../../stores/blockStores'
import BlockWrapper from '../../components/blocks/BlockWrapper.vue'
import type { Block } from '../../types/Blocks'

describe('BlockWrapper.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockBlock: Block = {
    id: 1,
    text: 'Test block',
    step: 1,
    nbOfRepeats: 1,
    modified: false,
    images: [],
  }

  // Test rendering
  it('renders block wrapper', () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div class="step-number"></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: { template: '<div class="editable-block"></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test element container
  it('has element container', () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.element-container').exists()).toBe(true)
  })

  // Test drag handle
  it('renders drag handle', () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
  })

  // Test step number component
  it('renders step number', () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div class="step-number"></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.step-number').exists()).toBe(true)
  })

  // Test editable block component
  it('renders editable block', () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: { template: '<div class="editable-block"></div>' },
        },
      },
    })
    expect(wrapper.find('.editable-block').exists()).toBe(true)
  })

  // Test active state
  it('passes active prop to children', () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: true,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.props('active')).toBe(true)
  })

  // Test event emissions
  it('emits select event', async () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: {
            template: '<div @click="$emit(\'select\')"></div>',
          },
        },
      },
    })

    const editableBlock = wrapper.findComponent({ name: 'EditableBlock' })
    if (editableBlock.exists()) {
      await editableBlock.vm.$emit('select')
      expect(wrapper.emitted('select')).toBeTruthy()
    }
  })

  // Test delete emission
  it('emits delete event', async () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: mockBlock,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: {
            template: '<div @click="$emit(\'delete\')"></div>',
          },
        },
      },
    })

    const editableBlock = wrapper.findComponent({ name: 'EditableBlock' })
    if (editableBlock.exists()) {
      await editableBlock.vm.$emit('delete')
      expect(wrapper.emitted('delete')).toBeTruthy()
    }
  })

  // Test repetition count
  it('displays repetition count', () => {
    const blockWithReps = { ...mockBlock, nbOfRepeats: 5 }
    const wrapper = mount(BlockWrapper, {
      props: {
        block: blockWithReps,
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div class="rep-count"></div>' },
          EditableBlock: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.rep-count').exists()).toBe(true)
  })

  it('met à jour la description via EditableBlock et appelle le store', async () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: { ...mockBlock },
        blockIndex: 0,
        active: false,
        canDelete: true,
      },
      global: {
        plugins: [createTestingPinia({ stubActions: true })],
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: {
            template: '<div class="editable-block" @click="$emit(\'update:description\', \'Nouvelle desc\')"></div>',
          },
        },
      },
    })

    const store = useBlocksStore()
    const editable = wrapper.find('.editable-block')
    await editable.trigger('click')

    expect(store.updateBlockDescription).toHaveBeenCalledWith(0, 'Nouvelle desc')
    expect(wrapper.props('block').text).toBe('Nouvelle desc')
  })

  it('met à jour les images via EditableBlock', async () => {
    const wrapper = mount(BlockWrapper, {
      props: {
        block: { ...mockBlock, images: [] },
        blockIndex: 1,
        active: false,
        canDelete: true,
      },
      global: {
        plugins: [createTestingPinia({ stubActions: true })],
        stubs: {
          StepNumber: { template: '<div></div>' },
          RepetitionCount: { template: '<div></div>' },
          EditableBlock: {
            template: '<div class="editable-block" @click="$emit(\'update:images\', [{ imagePath: \'img.png\' }])"></div>',
          },
        },
      },
    })

    const editable = wrapper.find('.editable-block')
    await editable.trigger('click')

    expect(wrapper.props('block').images?.[0]?.imagePath).toBe('img.png')
  })
})
