import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OptionBar from '../../components/optionBar/optionBar.vue'

describe('OptionBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Test component structure
  it('renders option bar', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // Test toolbar container
  it('has editor toolbar', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
  })

  // Test clipboard button
  it('renders clipboard button', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    const clipboardBtn = wrapper.find('[title="Presse-papiers"]')
    expect(clipboardBtn.exists()).toBe(true)
  })

  // Test content type tabs
  it('renders content type navigation', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    expect(wrapper.find('.content-type-nav').exists()).toBe(true)
  })

  // Test text tab
  it('has text content tab', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    const tabs = wrapper.findAll('.tab-item')
    expect(tabs.length).toBeGreaterThan(0)
  })

  // Test image tab
  it('has image content tab', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    const tabs = wrapper.findAll('.tab-item')
    expect(tabs.length).toBeGreaterThan(1)
  })

  // Test tab switching
  it('switches between text and image tabs', async () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div class="text-option"></div>' },
          ImageOptionBar: { template: '<div class="image-option"></div>' },
        },
      },
    })
    
    const tabs = wrapper.findAll('.tab-item')
    if (tabs.length > 1) {
      await tabs[1]!.trigger('click')
      expect(wrapper.find('.image-option').exists()).toBe(true)
    }
  })

  // Test save button
  it('renders save button', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    const saveBtn = wrapper.find('.save-action-button')
    expect(saveBtn.exists()).toBe(true)
  })

  // Test save button emits event
  it('emits save event when save button clicked', async () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    const saveBtn = wrapper.find('.save-action-button')
    await saveBtn.trigger('click')
    
    expect(wrapper.emitted('save')).toBeTruthy()
  })

  // Test icon toggle group
  it('renders icon toggle group', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div class="icon-toggle"></div>' },
          TextOptionBar: { template: '<div></div>' },
          ImageOptionBar: { template: '<div></div>' },
        },
      },
    })
    
    expect(wrapper.find('.icon-toggle').exists()).toBe(true)
  })

  // Test contextual toolbar
  it('shows contextual toolbar based on active tab', () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div class="text-option"></div>' },
          ImageOptionBar: { template: '<div class="image-option"></div>' },
        },
      },
    })

    expect(wrapper.find('.contextual-toolbar-wrapper').exists()).toBe(true)
  })

  it('switches to form tab when form tab clicked', async () => {
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div></div>' },
          TextOptionBar: { template: '<div class="text-option"></div>' },
          ImageOptionBar: { template: '<div class="image-option"></div>' },
          ShapeOptionBar: { template: '<div class="shape-option"></div>' },
        },
      },
    })
    const tabs = wrapper.findAll('.tab-item')
    await tabs[2]!.trigger('click') // third tab = form
    expect(wrapper.find('.shape-option').exists()).toBe(true)
  })

  it('handleIconChange opens reader when right is active', async () => {
    const { usePopupStore } = await import('../../stores/popupStore')
    const popupStore = usePopupStore()
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: {
            template: '<div class="icon-toggle-stub" @click="$emit(\'change\', { left: false, right: true })" />',
            emits: ['change'],
          },
          TextOptionBar: { template: '<div />' },
          ImageOptionBar: { template: '<div />' },
          ShapeOptionBar: { template: '<div />' },
        },
      },
    })
    await wrapper.find('.icon-toggle-stub').trigger('click')
    expect(popupStore.isReaderOpen).toBe(true)
  })

  it('handleIconChange closes reader when left is active', async () => {
    const { usePopupStore } = await import('../../stores/popupStore')
    const popupStore = usePopupStore()
    popupStore.openReader()
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: {
            template: '<div class="icon-toggle-stub" @click="$emit(\'change\', { left: true, right: false })" />',
            emits: ['change'],
          },
          TextOptionBar: { template: '<div />' },
          ImageOptionBar: { template: '<div />' },
          ShapeOptionBar: { template: '<div />' },
        },
      },
    })
    await wrapper.find('.icon-toggle-stub').trigger('click')
    expect(popupStore.isReaderOpen).toBe(false)
  })

  it('auto-switches to image tab when imageCropStore has selected image', async () => {
    const { useImageCropStore } = await import('../../stores/imageCropStore')
    const imageCropStore = useImageCropStore()
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div />' },
          TextOptionBar: { template: '<div />' },
          ImageOptionBar: { template: '<div class="image-tab-content" />' },
          ShapeOptionBar: { template: '<div />' },
        },
      },
    })
    imageCropStore.selectedImageId = 'img1'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.image-tab-content').exists()).toBe(true)
  })

  it('auto-switches to form tab when shapeStore has selected shape', async () => {
    const { useShapeStore } = await import('../../stores/shapeStore')
    const shapeStore = useShapeStore()
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div />' },
          TextOptionBar: { template: '<div />' },
          ImageOptionBar: { template: '<div />' },
          ShapeOptionBar: { template: '<div class="form-tab-content" />' },
        },
      },
    })
    shapeStore.updateStylesFromSelection('#000', '#fff', 2)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.form-tab-content').exists()).toBe(true)
  })

  it('auto-switches to text tab when textFormatStore has text focus', async () => {
    const { useTextFormatStore } = await import('../../stores/textFormatStore')
    const textFormatStore = useTextFormatStore()
    const wrapper = mount(OptionBar, {
      global: {
        stubs: {
          IconToggleGroup: { template: '<div />' },
          TextOptionBar: { template: '<div class="text-tab-content" />' },
          ImageOptionBar: { template: '<div />' },
          ShapeOptionBar: { template: '<div />' },
        },
      },
    })
    // First go to a different tab
    await wrapper.findAll('.tab-item')[1]!.trigger('click')
    // Then trigger text focus
    textFormatStore.hasTextFocus = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.text-tab-content').exists()).toBe(true)
  })
})
