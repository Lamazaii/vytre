import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageOptionBar from '../../components/optionBar/image/imageOptionBar.vue'

describe('ImageOptionBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders image option bar', () => {
    const wrapper = mount(ImageOptionBar)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.imageOptionBar').exists()).toBe(true)
  })

  it('renders Add image button', () => {
    const wrapper = mount(ImageOptionBar)
    const addBtn = wrapper.find('.formatButton')
    expect(addBtn.exists()).toBe(true)
  })

  it('renders crop button as disabled when no image selected', () => {
    const wrapper = mount(ImageOptionBar)
    const cropBtn = wrapper.find('.cropButton')
    expect(cropBtn.exists()).toBe(true)
    expect(cropBtn.attributes('disabled')).toBeDefined()
  })

  it('shows error when clicking add image with no block selected', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useErrorPopupStore } = await import('../../stores/errorPopupStore')
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')

    // No block selected (selectedIndex is null by default)
    const addBtn = wrapper.find('.formatButton')
    await addBtn.trigger('click')

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('sélectionner un bloc'))
  })

  it('calls requestAddImage when clicking add image with a block selected', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useBlocksStore } = await import('../../stores/blockStores')
    const { useShapeStore } = await import('../../stores/shapeStore')
    const blocksStore = useBlocksStore()
    const shapeStore = useShapeStore()

    blocksStore.selectedIndex = 0
    const spy = vi.spyOn(shapeStore, 'requestAddImage')

    const addBtn = wrapper.find('.formatButton')
    await addBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('crop button is disabled and not active when no image is selected', () => {
    const wrapper = mount(ImageOptionBar)
    const cropBtn = wrapper.find('.cropButton')
    expect(cropBtn.attributes('disabled')).toBeDefined()
    expect(cropBtn.classes()).not.toContain('active')
  })

  it('calls requestCrop when clicking crop with an image selected', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useImageCropStore } = await import('../../stores/imageCropStore')
    const imageCropStore = useImageCropStore()

    imageCropStore.selectedImageId = 'img1'
    const spy = vi.spyOn(imageCropStore, 'requestCrop')

    await wrapper.vm.$nextTick()
    const cropBtn = wrapper.find('.cropButton')
    await cropBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('organize button is disabled when no image is selected', () => {
    const wrapper = mount(ImageOptionBar)
    const organizeBtn = wrapper.find('.organize-select-button')
    expect(organizeBtn.attributes('disabled')).toBeDefined()
  })

  it('opens layer dropdown when organize button clicked and image is selected', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useImageCropStore } = await import('../../stores/imageCropStore')
    const imageCropStore = useImageCropStore()

    imageCropStore.selectedImageId = 'img1'
    await wrapper.vm.$nextTick()

    const organizeBtn = wrapper.find('.organize-select-button')
    await organizeBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.layerDropdown').exists()).toBe(true)
  })

  it('calls requestBringImageForward when Avancer is clicked', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useImageCropStore } = await import('../../stores/imageCropStore')
    const { useShapeStore } = await import('../../stores/shapeStore')
    const imageCropStore = useImageCropStore()
    const shapeStore = useShapeStore()

    imageCropStore.selectedImageId = 'img1'
    await wrapper.vm.$nextTick()

    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()

    const spy = vi.spyOn(shapeStore, 'requestBringImageForward')
    const forwardBtn = wrapper.findAll('.layerMenuItem')[0]!
    await forwardBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('calls requestSendImageToBack when Reculer is clicked', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useImageCropStore } = await import('../../stores/imageCropStore')
    const { useShapeStore } = await import('../../stores/shapeStore')
    const imageCropStore = useImageCropStore()
    const shapeStore = useShapeStore()

    imageCropStore.selectedImageId = 'img1'
    await wrapper.vm.$nextTick()

    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()

    const spy = vi.spyOn(shapeStore, 'requestSendImageToBack')
    const backBtn = wrapper.findAll('.layerMenuItem')[1]!
    await backBtn.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('closes layer dropdown when image is deselected', async () => {
    const wrapper = mount(ImageOptionBar)
    const { useImageCropStore } = await import('../../stores/imageCropStore')
    const imageCropStore = useImageCropStore()

    imageCropStore.selectedImageId = 'img1'
    await wrapper.vm.$nextTick()
    await wrapper.find('.organize-select-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.layerDropdown').exists()).toBe(true)

    // Deselect image
    imageCropStore.selectedImageId = null
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.layerDropdown').exists()).toBe(false)
  })
})
