import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ShapeSelector from '../../components/optionBar/shape/ShapeSelector.vue'

describe('ShapeSelector.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders shape selector', () => {
    const wrapper = mount(ShapeSelector)
    expect(wrapper.find('.shape-button-group').exists()).toBe(true)
  })

  it('shows default shape button (Carre)', () => {
    const wrapper = mount(ShapeSelector)
    expect(wrapper.find('.shape-select-label').text()).toBe('Carre')
  })

  it('opens shape menu when caret clicked', async () => {
    const wrapper = mount(ShapeSelector)
    expect(wrapper.find('.shape-menu').exists()).toBe(false)
    await wrapper.find('.shape-select-caret-button').trigger('click')
    expect(wrapper.find('.shape-menu').exists()).toBe(true)
  })

  it('closes shape menu on second caret click', async () => {
    const wrapper = mount(ShapeSelector)
    await wrapper.find('.shape-select-caret-button').trigger('click')
    await wrapper.find('.shape-select-caret-button').trigger('click')
    expect(wrapper.find('.shape-menu').exists()).toBe(false)
  })

  it('changes selected shape to circle when circle menu item clicked', async () => {
    const wrapper = mount(ShapeSelector)
    await wrapper.find('.shape-select-caret-button').trigger('click')
    const circleBtn = wrapper.findAll('.shape-menu-item').find(el => el.text().includes('Rond'))
    await circleBtn!.trigger('click')
    expect(wrapper.find('.shape-select-label').text()).toBe('Rond')
  })

  it('changes selected shape to triangle when triangle menu item clicked', async () => {
    const wrapper = mount(ShapeSelector)
    await wrapper.find('.shape-select-caret-button').trigger('click')
    const triangleBtn = wrapper.findAll('.shape-menu-item').find(el => el.text().includes('Triangle'))
    await triangleBtn!.trigger('click')
    expect(wrapper.find('.shape-select-label').text()).toBe('Triangle')
  })

  it('closes menu after selecting a shape', async () => {
    const wrapper = mount(ShapeSelector)
    await wrapper.find('.shape-select-caret-button').trigger('click')
    await wrapper.findAll('.shape-menu-item')[0]!.trigger('click')
    expect(wrapper.find('.shape-menu').exists()).toBe(false)
  })

  it('does not show current shape in menu', async () => {
    const wrapper = mount(ShapeSelector) // default is square
    await wrapper.find('.shape-select-caret-button').trigger('click')
    // Should show circle and triangle, not square
    const items = wrapper.findAll('.shape-menu-item')
    const texts = items.map(i => i.text())
    expect(texts).not.toContain('Carre')
    expect(texts.some(t => t.includes('Rond'))).toBe(true)
    expect(texts.some(t => t.includes('Triangle'))).toBe(true)
  })

  it('shows error when adding shape without selected block', async () => {
    const wrapper = mount(ShapeSelector)
    const { useErrorPopupStore } = await import('../../stores/errorPopupStore')
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')
    await wrapper.find('.shape-select-button').trigger('click')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('sélectionner un bloc'))
  })

  it('calls requestAddShape when block is selected', async () => {
    const wrapper = mount(ShapeSelector)
    const { useBlocksStore } = await import('../../stores/blockStores')
    const { useShapeStore } = await import('../../stores/shapeStore')
    const blocksStore = useBlocksStore()
    const shapeStore = useShapeStore()

    blocksStore.selectedIndex = 0
    const spy = vi.spyOn(shapeStore, 'requestAddShape')
    await wrapper.find('.shape-select-button').trigger('click')
    expect(spy).toHaveBeenCalled()
  })

  it('closes menu when clicking outside', async () => {
    const wrapper = mount(ShapeSelector, { attachTo: document.body })
    await wrapper.find('.shape-select-caret-button').trigger('click')
    expect(wrapper.find('.shape-menu').exists()).toBe(true)
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.shape-menu').exists()).toBe(false)
    wrapper.unmount()
  })
})
