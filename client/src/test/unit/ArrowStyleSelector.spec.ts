import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ArrowStyleSelector from '../../components/optionBar/shape/ArrowStyleSelector.vue'
import { useShapeStore } from '../../stores/shapeStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('ArrowStyleSelector.vue', () => {
  it('toggles start menu and selects an option', async () => {
    const wrapper = mount(ArrowStyleSelector)
    const store = useShapeStore()

    const [caretBtnStart] = wrapper.findAll('.arrow-style-caret-button')
    await caretBtnStart!.trigger('click')

    expect(wrapper.find('.arrow-style-menu').exists()).toBe(true)

    const optionBtns = wrapper.findAll('.arrow-style-menu-item')
    await optionBtns[1]!.trigger('click')

    // second option is 'stroke'
    expect(store.arrowStartStyle).toBe('stroke')
    expect(wrapper.find('.arrow-style-menu').exists()).toBe(false)
  })

  it('toggles end menu and selects an option', async () => {
    const wrapper = mount(ArrowStyleSelector)
    const store = useShapeStore()

    const [, caretBtnEnd] = wrapper.findAll('.arrow-style-caret-button')
    await caretBtnEnd!.trigger('click')
    expect(wrapper.findAll('.arrow-style-menu').length).toBeGreaterThanOrEqual(1)

    const optionBtns = wrapper.findAll('.arrow-style-menu-item')
    await optionBtns[2]!.trigger('click')

    expect(store.arrowEndStyle).toBe('open')
  })

  it('closes menus on outside click', async () => {
    const wrapper = mount(ArrowStyleSelector, { attachTo: document.body })
    const [caretBtn] = wrapper.findAll('.arrow-style-caret-button')
    await caretBtn!.trigger('click')
    expect(wrapper.find('.arrow-style-menu').exists()).toBe(true)

    // click outside
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.arrow-style-menu').exists()).toBe(false)
    wrapper.unmount()
  })
})
