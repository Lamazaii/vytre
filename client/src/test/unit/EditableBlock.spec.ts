import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import EditableBlock from '../../components/blocks/EditableBlock/editableBlock.vue'
import { useBlocksStore } from '../../stores/blockStores'
import { useImageCropStore } from '../../stores/imageCropStore'
import { useTextFormatStore } from '../../stores/textFormatStore'
import { useDeletePopupStore } from '../../stores/deletePopupStore'
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

const ImageItemStub = defineComponent({
  name: 'ImageItem',
  props: ['imagePath', 'isSelected'],
  emits: ['select', 'remove'],
  template: `
    <div>
      <button data-test="image-select" @click="$emit('select')">select</button>
      <button data-test="image-remove" @click="$emit('remove')">remove</button>
    </div>
  `,
})

const ImageUploaderStub = defineComponent({
  name: 'ImageUploader',
  emits: ['upload'],
  template: '<button data-test="uploader" @click="$emit(\'upload\', \'data:image/png\')">upload</button>',
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
  const deletePopupStore = useDeletePopupStore()

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
        ImageItem: ImageItemStub,
        ImageUploader: ImageUploaderStub,
      },
    },
  })

  return { wrapper, blocksStore, imageCropStore, textFormatStore, deletePopupStore }
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

    const updateImages = wrapper.emitted('update:images')
    expect(updateImages).toBeTruthy()
    expect((updateImages?.[0]?.[0] as Image[])).toHaveLength(1)
    expect(wrapper.emitted('modified')).toBeTruthy()
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

    imageCropStore.selectImage('img-1', 0)
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

  it('removes an image after confirming the delete popup', async () => {
    const image: Image = { id: 'img-1', imagePath: 'image.png', blockId: 0 }
    const { wrapper, deletePopupStore } = mountEditableBlock({ images: [image] })

    await wrapper.find('[data-test="image-remove"]').trigger('click')
    deletePopupStore.confirm()
    await nextTick()

    const emitted = wrapper.emitted('update:images')
    expect(emitted?.[0]?.[0]).toHaveLength(0)
  })
})
