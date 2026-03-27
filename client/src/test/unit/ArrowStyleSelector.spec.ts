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

    const caretBtn = wrapper.findAll('.arrow-style-caret-button')[0]
    await caretBtn.trigger('click')

    expect(wrapper.find('.arrow-style-menu').exists()).toBe(true)

    const optionBtn = wrapper.findAll('.arrow-style-menu-item')[1]
    await optionBtn.trigger('click')

    // second option is 'stroke'
    expect(store.arrowStartStyle).toBe('stroke')
    expect(wrapper.find('.arrow-style-menu').exists()).toBe(false)
  })

  it('toggles end menu and selects an option', async () => {
    const wrapper = mount(ArrowStyleSelector)
    const store = useShapeStore()

    const caretBtnEnd = wrapper.findAll('.arrow-style-caret-button')[1]
    await caretBtnEnd.trigger('click')
    expect(wrapper.findAll('.arrow-style-menu').length).toBeGreaterThanOrEqual(1)

    const optionBtn = wrapper.findAll('.arrow-style-menu-item')[2]
    await optionBtn.trigger('click')

    expect(store.arrowEndStyle).toBe('open')
  })

  it('closes menus on outside click', async () => {
    const wrapper = mount(ArrowStyleSelector, { attachTo: document.body })
    const caretBtn = wrapper.findAll('.arrow-style-caret-button')[0]
    await caretBtn.trigger('click')
    expect(wrapper.find('.arrow-style-menu').exists()).toBe(true)

    // click outside
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.arrow-style-menu').exists()).toBe(false)
    wrapper.unmount()
  })
})
