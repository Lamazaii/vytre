import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextZoneItem from '../../components/blocks/EditableBlock/textZoneItem.vue'

describe('textZoneItem.vue', () => {
  const stubs = {
    TiptapEditor: {
      template: '<div class="tiptap-stub" @click="$emit(\'update:modelValue\', \'new\')" @dblclick="$emit(\'focus\')" @mouseenter="$emit(\'selectionUpdate\')" />',
      props: ['modelValue', 'placeholder'],
      emits: ['update:modelValue', 'focus', 'selectionUpdate'],
    },
  }

  it('renders text zone', () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    expect(wrapper.find('.textZone').exists()).toBe(true)
  })

  it('renders TiptapEditor with modelValue', () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '<p>Hello</p>' }, global: { stubs } })
    expect(wrapper.find('.tiptap-stub').exists()).toBe(true)
  })

  it('renders remove button', () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    expect(wrapper.find('.removeTextZoneButton').exists()).toBe(true)
  })

  it('emits remove when remove button clicked', async () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    await wrapper.find('.removeTextZoneButton').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('renders textZoneEditorWrapper', () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    expect(wrapper.find('.textZoneEditorWrapper').exists()).toBe(true)
  })

  it('emits update:modelValue from TiptapEditor', async () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    await wrapper.find('.tiptap-stub').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new'])
  })

  it('emits focus from TiptapEditor', async () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    await wrapper.find('.tiptap-stub').trigger('dblclick')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits selectionUpdate from TiptapEditor', async () => {
    const wrapper = mount(TextZoneItem, { props: { modelValue: '' }, global: { stubs } })
    await wrapper.find('.tiptap-stub').trigger('mouseenter')
    expect(wrapper.emitted('selectionUpdate')).toBeTruthy()
  })
})
