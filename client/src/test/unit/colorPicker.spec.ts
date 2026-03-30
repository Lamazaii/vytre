import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPicker from '../../components/optionBar/ColorPicker.vue'

const defaultProps = {
  modelValue: '#000000',
  title: 'Couleur',
  iconPath: 'M0 0h24v24H0z',
}

describe('ColorPicker.vue (optionBar)', () => {
  it('renders color picker', () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.color-button-group').exists()).toBe(true)
  })

  it('shows color icon button', () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    expect(wrapper.find('.color-select-button').exists()).toBe(true)
  })

  it('shows transparent SVG icon when modelValue is transparent', () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, modelValue: 'transparent' } })
    // The transparent icon SVG is different from the colored one
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows colored SVG icon when modelValue is a color', () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, modelValue: '#ff0000' } })
    const svgs = wrapper.findAll('.color-select-button svg')
    expect(svgs.length).toBe(1)
  })

  it('opens color menu when caret button clicked', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)
  })

  it('closes color menu when caret button clicked again', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })

  it('shows preset color swatches when opened', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, presetColors: ['#111', '#222', '#333'] } })
    await wrapper.find('.color-caret-button').trigger('click')
    const swatches = wrapper.findAll('.swatch')
    expect(swatches.length).toBe(3)
  })

  it('emits update:modelValue when swatch clicked', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, presetColors: ['#ff0000'] } })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.swatch').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['#ff0000'])
  })

  it('closes color menu after selecting a color', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, presetColors: ['#ff0000'] } })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.swatch').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })

  it('shows transparent swatch when allowTransparent is true', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, allowTransparent: true } })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.transparent-swatch').exists()).toBe(true)
  })

  it('does not show transparent swatch when allowTransparent is false', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, allowTransparent: false } })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.transparent-swatch').exists()).toBe(false)
  })

  it('emits transparent when transparent swatch clicked', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, allowTransparent: true } })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.transparent-swatch').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['transparent'])
  })

  it('closes picker when clicking outside', async () => {
    const wrapper = mount(ColorPicker, { attachTo: document.body, props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('exposes closeColorPicker method', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)
    ;(wrapper.vm as any).closeColorPicker()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })
})
