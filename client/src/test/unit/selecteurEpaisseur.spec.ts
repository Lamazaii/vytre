import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SelecteurEpaisseur from '../../components/optionBar/shared/SelecteurEpaisseur.vue'

describe('SelecteurEpaisseur.vue', () => {
  it('renders stroke width group', () => {
    const wrapper = mount(SelecteurEpaisseur, { props: { modelValue: 2 } })
    expect(wrapper.find('.stroke-width-group').exists()).toBe(true)
  })

  it('displays current value in label', () => {
    const wrapper = mount(SelecteurEpaisseur, { props: { modelValue: 3 } })
    expect(wrapper.find('.stroke-width-label').text()).toBe('3px')
  })

  it('opens menu when caret button clicked', async () => {
    const wrapper = mount(SelecteurEpaisseur, { props: { modelValue: 2 } })
    expect(wrapper.find('.stroke-width-menu').exists()).toBe(false)
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    expect(wrapper.find('.stroke-width-menu').exists()).toBe(true)
  })

  it('closes menu on second caret click', async () => {
    const wrapper = mount(SelecteurEpaisseur, { props: { modelValue: 2 } })
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    expect(wrapper.find('.stroke-width-menu').exists()).toBe(false)
  })

  it('shows available widths excluding current value', async () => {
    const wrapper = mount(SelecteurEpaisseur, {
      props: { modelValue: 3, strokeWidthOptions: [1, 2, 3, 4, 5] },
    })
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    const items = wrapper.findAll('.stroke-width-menu-item')
    // Excludes 3 (current), shows 1, 2, 4, 5
    expect(items.length).toBe(4)
  })

  it('emits update:modelValue when a width is selected', async () => {
    const wrapper = mount(SelecteurEpaisseur, {
      props: { modelValue: 1, strokeWidthOptions: [1, 2, 3] },
    })
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    const items = wrapper.findAll('.stroke-width-menu-item')
    await items[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('closes menu after selecting a width', async () => {
    const wrapper = mount(SelecteurEpaisseur, {
      props: { modelValue: 1, strokeWidthOptions: [1, 2, 3] },
    })
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    await wrapper.findAll('.stroke-width-menu-item')[0]!.trigger('click')
    expect(wrapper.find('.stroke-width-menu').exists()).toBe(false)
  })

  it('closes menu when clicking outside', async () => {
    const wrapper = mount(SelecteurEpaisseur, { attachTo: document.body, props: { modelValue: 2 } })
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    expect(wrapper.find('.stroke-width-menu').exists()).toBe(true)
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stroke-width-menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('uses default width options [1,2,3,4,5]', async () => {
    const wrapper = mount(SelecteurEpaisseur, { props: { modelValue: 99 } })
    await wrapper.find('.stroke-width-caret-button').trigger('click')
    // All 5 default options shown since 99 is not in them
    expect(wrapper.findAll('.stroke-width-menu-item').length).toBe(5)
  })
})
