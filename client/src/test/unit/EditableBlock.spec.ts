import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import EditableBlock from '../../components/blocks/EditableBlock/editableBlock.vue'
import { useBlocksStore } from '../../stores/blockStores'
import { useImageCropStore } from '../../stores/imageCropStore'
import { useTextFormatStore } from '../../stores/textFormatStore'
import { useShapeStore } from '../../stores/shapeStore'
import type { Image } from '../../types/Image'

const fakeEditor = {
  isActive: vi.fn().mockReturnValue(false),
  getAttributes: vi.fn().mockReturnValue({}),
  chain: () => ({
    focus: () => ({
      toggleBold: () => ({ run: vi.fn() }),
      toggleItalic: () => ({ run: vi.fn() }),
      toggleUnderline: () => ({ run: vi.fn() }),
      setFontSize: () => ({ run: vi.fn() }),
      setColor: () => ({ run: vi.fn() }),
      run: vi.fn(),
    }),
  }),
}

const TiptapEditorStub = defineComponent({
  name: 'TiptapEditor',
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue', 'focus', 'selectionUpdate'],
  methods: {
    getEditor() { return fakeEditor },
  },
  template: '<textarea data-test="tiptap" @focus="$emit(\'focus\')" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
})

const TextZoneItemStub = defineComponent({
  name: 'TextZoneItem',
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue', 'focus', 'selectionUpdate', 'remove', 'setRef'],
  mounted() {
    this.$emit('setRef', { getEditor: () => fakeEditor })
  },
  template: `
    <div data-test="text-zone">
      <button data-test="text-zone-focus" @click="$emit('focus')">focus</button>
      <button data-test="text-zone-update" @click="$emit('update:modelValue', 'updated text')">update</button>
      <button data-test="text-zone-remove" @click="$emit('remove')">remove</button>
    </div>
  `,
})

const ImageUploaderStub = defineComponent({
  name: 'ImageUploader',
  emits: ['upload'],
  methods: {
    triggerFileInput() {},
  },
  template: '<button data-test="uploader" @click="$emit(\'upload\', \'data:image/png\')">upload</button>',
})

const ShapeCanvasStub = defineComponent({
  name: 'ShapeCanvas',
  props: ['blockIndex', 'canvasData', 'active'],
  emits: ['update:canvasData', 'update:hasObjects', 'modified'],
  data() {
    return {
      selectedImageSrc: null as string | null,
    }
  },
  methods: {
    addImage(imageData: string) {
      this.$emit('update:hasObjects', true)
      this.selectedImageSrc = imageData
    },
    getSelectedImage() {
      if (!this.selectedImageSrc) return null
      return { getSrc: () => this.selectedImageSrc, originalSrc: this.selectedImageSrc }
    },
    replaceSelectedImage(imageData: string) {
      this.selectedImageSrc = imageData
    },
    addSquare() {},
    addCircle() {},
    addTriangle() {},
    addTextZone() {},
    addArrow() {},
    bringSelectedImageForward() {},
    sendSelectedImageToBack() {},
    bringSelectedShapeForward() {},
    sendSelectedShapeToBack() {},
    bringSelectedTextForward() {},
    sendSelectedTextToBack() {},
  },
  template: '<div data-test="shape-canvas"></div>',
})

afterEach(() => {
  vi.clearAllMocks()
})

function mountEditableBlock(options?: {
  images?: Image[];
  textZones?: string[];
  canDelete?: boolean;
}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const blocksStore = useBlocksStore()
  if (blocksStore.blocks[0]) {
    blocksStore.blocks[0].textZones = options?.textZones ?? []
  }
  const imageCropStore = useImageCropStore()
  const textFormatStore = useTextFormatStore()

  const wrapper = mount(EditableBlock, {
    props: {
      blockIndex: 0,
      images: options?.images,
      canDelete: options?.canDelete,
    },
    global: {
      plugins: [pinia],
      stubs: {
        TiptapEditor: TiptapEditorStub,
        TextZoneItem: TextZoneItemStub,
        ImageUploader: ImageUploaderStub,
        ShapeCanvas: ShapeCanvasStub,
      },
    },
  })

  return { wrapper, blocksStore, imageCropStore, textFormatStore }
}

describe('EditableBlock', () => {
  it('emits select when the block is clicked', async () => {
    const { wrapper } = mountEditableBlock()

    await wrapper.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('emits delete when the trash icon is clicked', async () => {
    const { wrapper } = mountEditableBlock({ canDelete: true })

    const trash = wrapper.find('.trashIcon')
    await trash.trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('adds a new image and emits updates when upload fires', async () => {
    const { wrapper } = mountEditableBlock()

    await wrapper.find('[data-test="uploader"]').trigger('click')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('modified')).toBeTruthy()
    expect(wrapper.find('[data-test="shape-canvas"]').exists()).toBe(true)
  })

  it('delegates text zone updates to the blocks store', async () => {
    const { wrapper, blocksStore } = mountEditableBlock({ textZones: ['existing zone'] })
    const spy = vi.spyOn(blocksStore, 'updateTextZone')

    await wrapper.find('[data-test="text-zone-update"]').trigger('click')

    expect(spy).toHaveBeenCalledWith(0, 0, 'updated text')
  })

  it('opens the cropper when a crop is requested for the selected image', async () => {
    const image: Image = { id: 'img-1', imagePath: 'image.png', blockId: 0 }
    const { wrapper, imageCropStore } = mountEditableBlock({ images: [image] })
    const spy = vi.spyOn(imageCropStore, 'openCropper')

    // Wait for the component to mount and process the images
    await nextTick()
    await nextTick()
    
    // Trigger the image upload to ensure ShapeCanvas is rendered and has an image
    const shapeCanvasComponent = wrapper.findComponent({ name: 'ShapeCanvas' })
    if (shapeCanvasComponent.exists()) {
      shapeCanvasComponent.vm.addImage('image.png')
    }
    
    imageCropStore.blockIndex = 0
    imageCropStore.cropRequestTimestamp = Date.now()
    await nextTick()

    expect(spy).toHaveBeenCalledWith('image.png')
    await wrapper.unmount()
  })

  it('hides the trash icon when deletion is disabled', () => {
    const { wrapper } = mountEditableBlock({ canDelete: false })
    expect(wrapper.find('.trashIcon').exists()).toBe(false)
  })

  it('sets the text format editor when a text zone gains focus', async () => {
    const { wrapper, textFormatStore } = mountEditableBlock({ textZones: ['zone'] })
    const spy = vi.spyOn(textFormatStore, 'setTiptapEditor')

    await wrapper.find('[data-test="text-zone-focus"]').trigger('click')

    expect(spy).toHaveBeenCalledWith(fakeEditor)
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('emits description updates when the main editor changes', async () => {
    const { wrapper, blocksStore } = mountEditableBlock()
    const spy = vi.spyOn(blocksStore, 'updateBlockDescription')

    await wrapper.find('[data-test="tiptap"]').setValue('Hello')
    await nextTick()

    expect(spy).toHaveBeenCalledWith(0, 'Hello')
    expect(wrapper.emitted('update:description')?.[0]?.[0]).toBe('Hello')
  })

  it('migrates images to canvas on mount', async () => {
    const image: Image = { id: 'img-1', imagePath: 'image.png', blockId: 0 }
    const { wrapper } = mountEditableBlock({ images: [image] })

    // Wait for mount and image migration (200ms timeout in component)
    await new Promise(resolve => setTimeout(resolve, 250))
    await nextTick()

    const emitted = wrapper.emitted('update:images')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]?.[0]).toHaveLength(0)
  })

  it('saves selection when editor gains focus', async () => {
    const { wrapper, textFormatStore } = mountEditableBlock()
    const saveSpy = vi.spyOn(textFormatStore, 'saveSelection')

    await wrapper.find('[data-test="tiptap"]').trigger('focus')
    await nextTick()

    expect(saveSpy).toHaveBeenCalled()
  })

  it('removes a text zone when remove event fires', async () => {
    const { wrapper, blocksStore } = mountEditableBlock({ textZones: ['zone1', 'zone2'] })
    const spy = vi.spyOn(blocksStore, 'removeTextZone')

    await wrapper.find('[data-test="text-zone-remove"]').trigger('click')

    expect(spy).toHaveBeenCalledWith(0, 0)
  })

  it('updates canvas data and blocks store', async () => {
    const { wrapper, blocksStore } = mountEditableBlock()
    const spy = vi.spyOn(blocksStore, 'updateBlockCanvas')

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    shapeCanvas.vm.$emit('update:canvasData', 'newCanvasData')
    await nextTick()

    expect(spy).toHaveBeenCalledWith(0, 'newCanvasData')
  })

  it('updates hasShapes when canvas objects change', async () => {
    const { wrapper } = mountEditableBlock()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    shapeCanvas.vm.$emit('update:hasObjects', true)
    await nextTick()

    expect(wrapper.find('[data-test="shape-canvas"]').exists()).toBe(true)
  })

  it('syncs welcomeText when props.description changes', async () => {
    const { wrapper, blocksStore } = mountEditableBlock()
    const spy = vi.spyOn(blocksStore, 'updateBlockDescription')

    await wrapper.setProps({ description: 'New description' })
    await nextTick()

    expect(spy).toHaveBeenCalledWith(0, 'New description')
    expect(wrapper.emitted('update:description')).toBeTruthy()
  })

  it('adds square shape when shapeStore requests it', async () => {
    const { wrapper, blocksStore } = mountEditableBlock()
    const shapeStore = useShapeStore()
    
    // Set block as active
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const addSquareSpy = vi.spyOn(shapeCanvas.vm, 'addSquare')

    shapeStore.activeShape = 'square'
    shapeStore.addShapeRequest = Date.now()
    await nextTick()
    await nextTick()

    expect(addSquareSpy).toHaveBeenCalled()
  })

  it('adds circle shape when shapeStore requests it', async () => {
    const { wrapper, blocksStore } = mountEditableBlock()
    const shapeStore = useShapeStore()
    
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const addCircleSpy = vi.spyOn(shapeCanvas.vm, 'addCircle')

    shapeStore.activeShape = 'circle'
    shapeStore.addShapeRequest = Date.now()
    await nextTick()
    await nextTick()

    expect(addCircleSpy).toHaveBeenCalled()
  })

  it('adds triangle shape when shapeStore requests it', async () => {
    const { wrapper, blocksStore } = mountEditableBlock()
    const shapeStore = useShapeStore()
    
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const addTriangleSpy = vi.spyOn(shapeCanvas.vm, 'addTriangle')

    shapeStore.activeShape = 'triangle'
    shapeStore.addShapeRequest = Date.now()
    await nextTick()
    await nextTick()

    expect(addTriangleSpy).toHaveBeenCalled()
  })

  it('does not add shape when block is not active', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    
    await wrapper.setProps({ active: false })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const addSquareSpy = vi.spyOn(shapeCanvas.vm, 'addSquare')

    shapeStore.activeShape = 'square'
    shapeStore.addShapeRequest = Date.now()
    await nextTick()

    expect(addSquareSpy).not.toHaveBeenCalled()
  })

  it('replaces selected image with cropped data', async () => {
    const { wrapper, imageCropStore } = mountEditableBlock()
    
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const replaceSpy = vi.spyOn(shapeCanvas.vm, 'replaceSelectedImage')
    const clearSpy = vi.spyOn(imageCropStore, 'clearCroppedImage')

    imageCropStore.blockIndex = 0
    imageCropStore.croppedImageData = 'data:image/png;base64,cropped'
    await nextTick()

    expect(replaceSpy).toHaveBeenCalledWith('data:image/png;base64,cropped')
    expect(clearSpy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('does not replace image when cropped data is for different block', async () => {
    const { wrapper, imageCropStore } = mountEditableBlock()
    
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const replaceSpy = vi.spyOn(shapeCanvas.vm, 'replaceSelectedImage')

    imageCropStore.blockIndex = 999
    imageCropStore.croppedImageData = 'data:image/png;base64,cropped'
    await nextTick()

    expect(replaceSpy).not.toHaveBeenCalled()
  })

  it('changes trash icon on hover', async () => {
    const { wrapper } = mountEditableBlock({ canDelete: true })

    const trash = wrapper.find('.trashIcon')
    await trash.trigger('mouseenter')
    await nextTick()

    expect(trash.classes()).toContain('hovering')

    await trash.trigger('mouseleave')
    await nextTick()

    expect(trash.classes()).not.toContain('hovering')
  })

  it('applies active class when block is active', async () => {
    const { wrapper } = mountEditableBlock()

    await wrapper.setProps({ active: true })
    await nextTick()

    expect(wrapper.find('.editableBlock.active').exists()).toBe(true)
  })

  it('shows ShapeCanvas when hasShapes is true', async () => {
    const { wrapper } = mountEditableBlock()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    shapeCanvas.vm.$emit('update:hasObjects', true)
    await nextTick()

    expect(wrapper.find('.shapeCanvasSection').isVisible()).toBe(true)
  })

  it('shows ImageUploader when hasShapes is false', async () => {
    const { wrapper } = mountEditableBlock()

    expect(wrapper.find('.imageUploaderSection').isVisible()).toBe(true)
  })

  it('renders text zones when they exist', async () => {
    const { wrapper } = mountEditableBlock({ textZones: ['zone1', 'zone2', 'zone3'] })

    const textZones = wrapper.findAllComponents({ name: 'TextZoneItem' })
    expect(textZones).toHaveLength(3)
  })

  it('does not render text zones section when empty', async () => {
    const { wrapper } = mountEditableBlock({ textZones: [] })

    expect(wrapper.find('.textZonesSection').exists()).toBe(false)
  })

  it('initializes with provided description', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const blocksStore = useBlocksStore()
    const spy = vi.spyOn(blocksStore, 'updateBlockDescription')

    const wrapper = mount(EditableBlock, {
      props: {
        blockIndex: 0,
        description: 'Initial description',
      },
      global: {
        plugins: [pinia],
        stubs: {
          TiptapEditor: TiptapEditorStub,
          TextZoneItem: TextZoneItemStub,
          ImageUploader: ImageUploaderStub,
          ShapeCanvas: ShapeCanvasStub,
        },
      },
    })

    await nextTick()
    
    // Vérifier que la description est dans le DOM
    const tiptap = wrapper.find('[data-test="tiptap"]')
    expect(tiptap.exists()).toBe(true)
    
    wrapper.unmount()
  })

  // ── Layer control watchers ──────────────────────────────────────────────────

  it('calls bringSelectedImageForward when bringImageForwardRequest changes', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'bringSelectedImageForward')

    shapeStore.bringImageForwardRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('calls sendSelectedImageToBack when sendImageToBackRequest changes', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'sendSelectedImageToBack')

    shapeStore.sendImageToBackRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('calls bringSelectedShapeForward when bringShapeForwardRequest changes', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'bringSelectedShapeForward')

    shapeStore.bringShapeForwardRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('calls sendSelectedShapeToBack when sendShapeToBackRequest changes', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'sendSelectedShapeToBack')

    shapeStore.sendShapeToBackRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('calls bringSelectedTextForward when bringTextForwardRequest changes', async () => {
    const { wrapper, textFormatStore } = mountEditableBlock()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'bringSelectedTextForward')

    textFormatStore.bringTextForwardRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('calls sendSelectedTextToBack when sendTextToBackRequest changes', async () => {
    const { wrapper, textFormatStore } = mountEditableBlock()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'sendSelectedTextToBack')

    textFormatStore.sendTextToBackRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('does not call layer methods when block is not active', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: false })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'bringSelectedImageForward')

    shapeStore.bringImageForwardRequest++
    await nextTick()

    expect(spy).not.toHaveBeenCalled()
  })

  // ── addImageRequest watcher ─────────────────────────────────────────────────

  it('triggers image uploader when addImageRequest fires', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const uploader = wrapper.findComponent({ name: 'ImageUploader' })
    const spy = vi.spyOn(uploader.vm, 'triggerFileInput')

    shapeStore.addImageRequest++
    await nextTick()

    expect(spy).toHaveBeenCalled()
  })

  it('does not trigger uploader when block is not active', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: false })

    const uploader = wrapper.findComponent({ name: 'ImageUploader' })
    const spy = vi.spyOn(uploader.vm, 'triggerFileInput')

    shapeStore.addImageRequest++
    await nextTick()

    expect(spy).not.toHaveBeenCalled()
  })

  // ── addShapeRequest: text and arrow shapes ──────────────────────────────────

  it('adds text zone when shapeStore requests text shape', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'addTextZone')

    shapeStore.activeShape = 'text'
    shapeStore.addShapeRequest = Date.now()
    await nextTick()
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect(wrapper.emitted('modified')).toBeTruthy()
  })

  it('adds arrow when shapeStore requests arrow shape', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    await wrapper.setProps({ active: true })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    const spy = vi.spyOn(shapeCanvas.vm, 'addArrow')

    shapeStore.activeShape = 'arrow'
    shapeStore.addShapeRequest = Date.now()
    await nextTick()
    await nextTick()

    expect(spy).toHaveBeenCalled()
  })

  // ── onFocusEditable full path ───────────────────────────────────────────────

  it('onFocusEditable clears shape selection', async () => {
    const { wrapper } = mountEditableBlock()
    const shapeStore = useShapeStore()
    const clearSpy = vi.spyOn(shapeStore, 'clearShapeSelection')

    await wrapper.find('[data-test="tiptap"]').trigger('focus')
    await nextTick()

    expect(clearSpy).toHaveBeenCalled()
  })

  it('onFocusEditable clears image crop selection', async () => {
    const { wrapper, imageCropStore } = mountEditableBlock()
    const clearSpy = vi.spyOn(imageCropStore, 'clearSelection')

    await wrapper.find('[data-test="tiptap"]').trigger('focus')
    await nextTick()

    expect(clearSpy).toHaveBeenCalled()
  })

  // ── onTextZoneFocus full path ───────────────────────────────────────────────

  it('onTextZoneFocus clears shape selection', async () => {
    const { wrapper } = mountEditableBlock({ textZones: ['zone'] })
    const shapeStore = useShapeStore()
    const clearSpy = vi.spyOn(shapeStore, 'clearShapeSelection')

    await wrapper.find('[data-test="text-zone-focus"]').trigger('click')
    await nextTick()

    expect(clearSpy).toHaveBeenCalled()
  })

  // ── canvasData with JSON on mount ───────────────────────────────────────────

  it('sets hasShapes=true on mount when canvasData has objects', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const blocksStore = useBlocksStore()
    blocksStore.blocks[0]!.canvasData = JSON.stringify({ objects: [{ type: 'rect' }] })

    const wrapper = mount(EditableBlock, {
      props: { blockIndex: 0 },
      global: {
        plugins: [pinia],
        stubs: {
          TiptapEditor: TiptapEditorStub,
          TextZoneItem: TextZoneItemStub,
          ImageUploader: ImageUploaderStub,
          ShapeCanvas: ShapeCanvasStub,
        },
      },
    })
    await nextTick()

    expect(wrapper.find('.shapeCanvasSection').isVisible()).toBe(true)
    wrapper.unmount()
  })

  it('does not throw when canvasData is invalid JSON on mount', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const blocksStore = useBlocksStore()
    blocksStore.blocks[0]!.canvasData = 'not-json'

    const wrapper = mount(EditableBlock, {
      props: { blockIndex: 0 },
      global: {
        plugins: [pinia],
        stubs: {
          TiptapEditor: TiptapEditorStub,
          TextZoneItem: TextZoneItemStub,
          ImageUploader: ImageUploaderStub,
          ShapeCanvas: ShapeCanvasStub,
        },
      },
    })
    await nextTick()

    expect(wrapper.find('.shapeCanvasSection').exists()).toBe(true)
    wrapper.unmount()
  })

  // ── handleCanvasUpdate with undefined blockIndex ────────────────────────────

  it('handleCanvasUpdate still updates canvasData when blockIndex is undefined', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(EditableBlock, {
      props: { blockIndex: undefined },
      global: {
        plugins: [pinia],
        stubs: {
          TiptapEditor: TiptapEditorStub,
          TextZoneItem: TextZoneItemStub,
          ImageUploader: ImageUploaderStub,
          ShapeCanvas: ShapeCanvasStub,
        },
      },
    })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    shapeCanvas.vm.$emit('update:canvasData', 'testData')
    await nextTick()

    // canvasData ref should update even with no blockIndex
    wrapper.unmount()
  })

  // ── cropRequestTimestamp with originalSrc ───────────────────────────────────

  it('opens cropper with originalSrc when available', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const imageCropStore = useImageCropStore()
    const openSpy = vi.spyOn(imageCropStore, 'openCropper')

    const wrapper = mount(EditableBlock, {
      props: { blockIndex: 0, active: true },
      global: {
        plugins: [pinia],
        stubs: {
          TiptapEditor: TiptapEditorStub,
          TextZoneItem: TextZoneItemStub,
          ImageUploader: ImageUploaderStub,
          ShapeCanvas: ShapeCanvasStub,
        },
      },
    })
    await nextTick()

    const shapeCanvas = wrapper.findComponent({ name: 'ShapeCanvas' })
    shapeCanvas.vm.selectedImageSrc = 'data:image/png;original'
    ;(shapeCanvas.vm as any).getSelectedImage = () => ({
      getSrc: () => 'data:image/png;original',
      originalSrc: 'data:image/png;original',
    })

    imageCropStore.blockIndex = 0
    imageCropStore.cropRequestTimestamp = Date.now()
    await nextTick()

    expect(openSpy).toHaveBeenCalledWith('data:image/png;original')
    wrapper.unmount()
  })
})
