import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TextOptionBar from '../../components/optionBar/text/textOptionBar.vue'

describe('TextOptionBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders text option bar', () => {
    const wrapper = mount(TextOptionBar)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.textOptionBar').exists()).toBe(true)
  })

  it('renders bold, italic, underline and addText buttons', () => {
    const wrapper = mount(TextOptionBar)
    const buttons = wrapper.findAll('.formatButton')
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders font size selector with options', () => {
    const wrapper = mount(TextOptionBar)
    const select = wrapper.find('.fontSize')
    expect(select.exists()).toBe(true)
    const options = wrapper.findAll('option')
    expect(options.length).toBe(3)
  })

  it('renders color picker button', () => {
    const wrapper = mount(TextOptionBar)
    const colorButton = wrapper.find('.colorButton')
    expect(colorButton.exists()).toBe(true)
  })

  it('toggles color picker visibility when color button is clicked', async () => {
    const wrapper = mount(TextOptionBar)
    const colorButton = wrapper.find('.colorButton')

    // Initially hidden
    expect(wrapper.find('.colorMenu').exists()).toBe(false)

    // Click to open
    await colorButton.trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)

    // Click again to close
    await colorButton.trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })

  it('shows preset color swatches when color picker is open', async () => {
    const wrapper = mount(TextOptionBar)
    await wrapper.find('.colorButton').trigger('click')
    const swatches = wrapper.findAll('.swatch')
    expect(swatches.length).toBe(8)
  })

  it('selecting a color closes the color menu', async () => {
    const wrapper = mount(TextOptionBar)
    await wrapper.find('.colorButton').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)

    const swatch = wrapper.find('.swatch')
    await swatch.trigger('click')

    expect(wrapper.find('.colorMenu').exists()).toBe(false)
  })

  it('clicking bold button calls applyBold from store', async () => {
    // Set up spy BEFORE mounting so the component picks up the spy on destructuring
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const spy = vi.spyOn(store, 'applyBold')

    const wrapper = mount(TextOptionBar)
    const boldBtn = wrapper.findAll('.formatButton')[0]!
    await boldBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('clicking italic button calls applyItalic from store', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const spy = vi.spyOn(store, 'applyItalic')

    const wrapper = mount(TextOptionBar)
    const italicBtn = wrapper.findAll('.formatButton')[1]!
    await italicBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('clicking underline button calls applyUnderline from store', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const spy = vi.spyOn(store, 'applyUnderline')

    const wrapper = mount(TextOptionBar)
    const underlineBtn = wrapper.findAll('.formatButton')[2]!
    await underlineBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('changing font size triggers applyFontSize', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const spy = vi.spyOn(store, 'applyFontSize')

    const wrapper = mount(TextOptionBar)
    const select = wrapper.find('.fontSize')
    await select.setValue('Large')
    await select.trigger('change')

    expect(spy).toHaveBeenCalledWith('Large')
  })

  it('clicking add text button calls addTextZone from blocks store', async () => {
    const { useBlocksStore } = await import('../../stores/blockStores')
    const store = useBlocksStore()
    const spy = vi.spyOn(store, 'addTextZone')

    const wrapper = mount(TextOptionBar)
    // addText button is the 4th format button (index 3)
    const addTextBtn = wrapper.findAll('.formatButton')[3]!
    await addTextBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('clicking outside the color picker closes it', async () => {
    const wrapper = mount(TextOptionBar, { attachTo: document.body })
    await wrapper.find('.colorButton').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)

    // Simulate click outside by dispatching on document
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.colorMenu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('clicking inside the color picker does not close it', async () => {
    const wrapper = mount(TextOptionBar, { attachTo: document.body })
    await wrapper.find('.colorButton').trigger('click')
    expect(wrapper.find('.colorMenu').exists()).toBe(true)

    // Click inside the picker root
    await wrapper.find('.colorPicker').trigger('click')
    await wrapper.vm.$nextTick()

    // Menu should still be open (click was inside)
    expect(wrapper.find('.colorMenu').exists()).toBe(true)
    wrapper.unmount()
  })

  it('toggleLayerMenu does nothing when no textbox is selected', async () => {
    const wrapper = mount(TextOptionBar)
    // fabricTextbox is null → hasSelectedTextbox is false
    ;(wrapper.vm as any).toggleLayerMenu()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('toggleLayerMenu opens and closes the layer menu when textbox is selected', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const mockTextbox: any = {
      isEditing: false, fontWeight: 'normal', fontStyle: 'normal',
      underline: false, fill: '#000', fontSize: 16,
    }
    store.setFabricTextbox(mockTextbox as any, null)

    const wrapper = mount(TextOptionBar)
    await wrapper.vm.$nextTick()

    ;(wrapper.vm as any).toggleLayerMenu()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(true)

    ;(wrapper.vm as any).toggleLayerMenu()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('onBringForwardMenuClick calls requestBringTextForward and closes menu', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const mockTextbox: any = {
      isEditing: false, fontWeight: 'normal', fontStyle: 'normal',
      underline: false, fill: '#000', fontSize: 16,
    }
    store.setFabricTextbox(mockTextbox as any, null)

    // Spy must be set up before mounting so the component picks it up on destructuring
    const spy = vi.spyOn(store, 'requestBringTextForward')

    const wrapper = mount(TextOptionBar)
    await wrapper.vm.$nextTick()

    ;(wrapper.vm as any).toggleLayerMenu()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(true)

    await wrapper.find('.layerMenuItem').trigger('click')
    await wrapper.vm.$nextTick()
    expect(spy).toHaveBeenCalled()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('onSendToBackMenuClick calls requestSendTextToBack and closes menu', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const mockTextbox: any = {
      isEditing: false, fontWeight: 'normal', fontStyle: 'normal',
      underline: false, fill: '#000', fontSize: 16,
    }
    store.setFabricTextbox(mockTextbox as any, null)

    // Spy must be set up before mounting so the component picks it up on destructuring
    const spy = vi.spyOn(store, 'requestSendTextToBack')

    const wrapper = mount(TextOptionBar)
    await wrapper.vm.$nextTick()

    ;(wrapper.vm as any).toggleLayerMenu()
    await wrapper.vm.$nextTick()

    const menuItems = wrapper.findAll('.layerMenuItem')
    await menuItems[1]?.trigger('click')
    await wrapper.vm.$nextTick()
    expect(spy).toHaveBeenCalled()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })

  it('watch hasSelectedTextbox closes layer menu when deselected', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const store = useTextFormatStore()
    const mockTextbox: any = {
      isEditing: false, fontWeight: 'normal', fontStyle: 'normal',
      underline: false, fill: '#000', fontSize: 16,
    }
    store.setFabricTextbox(mockTextbox as any, null)

    const wrapper = mount(TextOptionBar)
    await wrapper.vm.$nextTick()

    ;(wrapper.vm as any).toggleLayerMenu()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(true)

    // Clear textbox → hasSelectedTextbox becomes false → watch closes menu
    store.setFabricTextbox(null, null)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })
})
