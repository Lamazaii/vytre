import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ShapeOptionBar from '../../components/optionBar/shape/shapeOptionBar.vue'

describe('ShapeOptionBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const stubs = {
    ShapeSelector: { template: '<div class="shape-selector-stub" />' },
    ColorPicker: {
      template: '<div class="color-picker-stub" @click="$emit(\'update:modelValue\', \'#ff0000\')" />',
      props: ['modelValue', 'title', 'iconPath', 'presetColors', 'allowTransparent'],
      emits: ['update:modelValue'],
    },
    SelecteurEpaisseur: {
      template: '<div class="epaisseur-stub" @click="$emit(\'update:modelValue\', 3)" />',
      props: ['modelValue'],
      emits: ['update:modelValue'],
    },
  }

  it('renders the shape option bar', () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.shapeOptionBar').exists()).toBe(true)
  })

  it('renders ShapeSelector, two ColorPickers and SelecteurEpaisseur', () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    expect(wrapper.find('.shape-selector-stub').exists()).toBe(true)
    expect(wrapper.findAll('.color-picker-stub').length).toBe(2)
    expect(wrapper.find('.epaisseur-stub').exists()).toBe(true)
  })

  it('organise button is disabled when no shape is selected', () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const organiseBtn = wrapper.find('.organize-select-button')
    expect(organiseBtn.attributes('disabled')).toBeDefined()
  })

  it('does not open layer menu when no shape is selected', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const organiseBtn = wrapper.find('.organize-select-button')
    await organiseBtn.trigger('click')
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('opens layer dropdown when shape is selected and organize button is clicked', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const { useShapeStore } = await import('../../stores/shapeStore')
    const store = useShapeStore()

    store.updateStylesFromSelection('#000', '#fff', 2) // sets hasSelectedShape = true
    await wrapper.vm.$nextTick()

    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.layerDropdown').exists()).toBe(true)
  })

  it('calls requestBringShapeForward and closes menu when Avancer is clicked', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const { useShapeStore } = await import('../../stores/shapeStore')
    const store = useShapeStore()

    store.updateStylesFromSelection('#000', '#fff', 2)
    await wrapper.vm.$nextTick()
    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()

    const spy = vi.spyOn(store, 'requestBringShapeForward')
    const forwardBtn = wrapper.findAll('.layerMenuItem')[0]
    await forwardBtn?.trigger('click')

    expect(spy).toHaveBeenCalled()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('calls requestSendShapeToBack and closes menu when Reculer is clicked', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const { useShapeStore } = await import('../../stores/shapeStore')
    const store = useShapeStore()

    store.updateStylesFromSelection('#000', '#fff', 2)
    await wrapper.vm.$nextTick()
    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()

    const spy = vi.spyOn(store, 'requestSendShapeToBack')
    const backBtn = wrapper.findAll('.layerMenuItem')[1]
    await backBtn?.trigger('click')

    expect(spy).toHaveBeenCalled()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('auto-closes dropdown when shape is deselected', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const { useShapeStore } = await import('../../stores/shapeStore')
    const store = useShapeStore()

    store.updateStylesFromSelection('#000', '#fff', 2)
    await wrapper.vm.$nextTick()
    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(true)

    store.clearShapeSelection()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('updates fillColor and strokeColor via ColorPicker v-model', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const { useShapeStore } = await import('../../stores/shapeStore')
    const store = useShapeStore()
    const pickers = wrapper.findAll('.color-picker-stub')
    await pickers[0]?.trigger('click')
    await pickers[1]?.trigger('click')
    expect(store.fillColor).toBe('#ff0000')
    expect(store.strokeColor).toBe('#ff0000')
  })

  it('updates strokeWidth via SelecteurEpaisseur v-model', async () => {
    const wrapper = mount(ShapeOptionBar, { global: { stubs } })
    const { useShapeStore } = await import('../../stores/shapeStore')
    const store = useShapeStore()
    await wrapper.find('.epaisseur-stub').trigger('click')
    expect(store.strokeWidth).toBe(3)
  })
})
