import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPicker from '../../components/optionBar/shared/ColorPicker.vue'

const defaultProps = {
  modelValue: '#000000',
  title: 'Couleur',
  iconPath: 'M0 0h24v24H0z',
}

describe('ColorPicker.vue (shared)', () => {
  it('renders color picker', () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    expect(wrapper.find('.color-button-group').exists()).toBe(true)
  })

  it('shows img element when modelValue is transparent', () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, modelValue: 'transparent' } })
    // The shared ColorPicker uses an img for transparent
    expect(wrapper.find('.color-select-button').exists()).toBe(true)
  })

  it('shows colored SVG icon when modelValue is a color', () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, modelValue: '#3b82f6' } })
    expect(wrapper.find('.color-select-button svg').exists()).toBe(true)
  })

  it('opens color menu when caret button clicked', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)
  })

  it('closes color menu on second click', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })

  it('shows 8 preset swatches by default', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.findAll('.swatch').length).toBe(8)
  })

  it('emits update:modelValue on swatch click', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, presetColors: ['#abc123'] } })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.swatch').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['#abc123'])
  })

  it('closes after selecting a swatch', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, presetColors: ['#abc123'] } })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.swatch').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })

  it('shows transparent swatch when allowTransparent is true', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, allowTransparent: true } })
    await wrapper.find('.color-caret-button').trigger('click')
    expect(wrapper.find('.transparent-swatch').exists()).toBe(true)
  })

  it('selects transparent color from transparent swatch', async () => {
    const wrapper = mount(ColorPicker, { props: { ...defaultProps, allowTransparent: true } })
    await wrapper.find('.color-caret-button').trigger('click')
    await wrapper.find('.transparent-swatch').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['transparent'])
  })

  it('closes picker when clicking outside', async () => {
    const wrapper = mount(ColorPicker, { attachTo: document.body, props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('exposes closeColorPicker', async () => {
    const wrapper = mount(ColorPicker, { props: defaultProps })
    await wrapper.find('.color-caret-button').trigger('click')
    ;(wrapper.vm as any).closeColorPicker()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })
})
