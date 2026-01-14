import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Editor from '../../components/applications/editor.vue'
import { createTestingPinia } from '@pinia/testing'
import { useBlocksStore } from '../../stores/blockStores'
import { useImageCropStore } from '../../stores/imageCropStore'

const appEl = document.createElement('div')
appEl.id = 'app'
document.body.appendChild(appEl)

const globalStubs = {
  CopyPastePopup: { template: '<div class="copy-popup" />' },
  SavePopUp: { template: '<div class="save-popup"></div>', props: ['isOpen', 'modelValue'] },
  ConfirmSavePopUp: { template: '<div class="confirm-save"></div>' },
  BlockWrapper: { template: '<div class="block-wrapper" />' },
  AddBlockZone: { template: '<button class="add-block" @click="$emit(\'add\')"></button>' },
  OptionBar: { template: '<div class="option-bar" @save="$emit(\'save\')"></div>' },
  TitleBar: { template: '<div class="title-bar"></div>' },
  ReaderViewWindow: { template: '<div class="reader-view" @save="$emit(\'save\')"></div>' },
  DeletePopup: { template: '<div class="delete-popup"></div>' },
  ErrorPopup: { template: '<div class="error-popup"></div>' },
  CropPopup: { template: '<div class="crop-popup"></div>', emits: ['crop'] },
  draggable: { template: '<div><slot /></div>' },
}

describe('Editor.vue', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  function mountEditor(initialState?: any) {
    return mount(Editor, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: true,
            initialState: initialState ?? {
              blocks: {
                blocks: [
                  { id: 1, text: '', step: 1, nbOfRepeats: 1, modified: false, images: [], textZones: [] },
                ],
                selectedIndex: 0,
                documentTitle: 'Titre du document',
                currentDocument: { title: 'Titre du document', version: '1.0.0' },
                canAdd: true,
                allDocuments: [],
              },
              imageCrop: {
                isCropperOpen: false,
                selectedImageId: null,
                blockIndex: null,
                cropRequestTimestamp: 0,
              },
              popup: { isOpen: false, isReaderOpen: false },
              deletePopup: { isVisible: false },
              errorPopup: { isOpen: false },
              confirmSavePopup: { isOpen: false },
            },
          }),
        ],
        stubs: globalStubs,
      },
    })
  }

  it('ouvre et ferme le dialogue de sauvegarde', async () => {
    const wrapper = mountEditor()
    const vm = wrapper.vm as any

    vm.openSaveDialog()
    await wrapper.vm.$nextTick()
    expect(vm.saveDialogOpen).toBe(true)

    vm.handleSaveCancel()
    await wrapper.vm.$nextTick()
    expect(vm.saveDialogOpen).toBe(false)
  })

  it('confirme la sauvegarde et appelle saveDocument', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    const saveSpy = vi.spyOn(store, 'saveDocument').mockResolvedValue(undefined)

    await (wrapper.vm as any).handleSaveConfirm('Nouveau titre')

    expect(store.currentDocument.title).toBe('Nouveau titre')
    expect(saveSpy).toHaveBeenCalled()
  })

  it('gère le collage: charge et mémorise le texte', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    const loadSpy = vi.spyOn(store, 'loadFromClipboard')

    await (wrapper.vm as any).handleClipboardSubmit('Texte')

    expect(loadSpy).toHaveBeenCalledWith('Texte')
    expect((wrapper.vm as any).clipboardText).toBe('Texte')

    await (wrapper.vm as any).handleClipboardCancel()
    expect((wrapper.vm as any).clipboardText).toBe('')
  })

  it('ajoute un bloc via AddBlockZone', async () => {
    const wrapper = mount(Editor, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              blocks: {
                blocks: [
                  { id: 1, text: 'ok', step: 1, nbOfRepeats: 1, modified: true, images: [], textZones: [] },
                ],
                selectedIndex: 0,
                documentTitle: 'Titre du document',
                currentDocument: { title: 'Titre du document', version: '1.0.0' },
                canAdd: true,
                allDocuments: [],
              },
              imageCrop: { isCropperOpen: false, selectedImageId: null, blockIndex: null, cropRequestTimestamp: 0 },
              popup: { isOpen: false, isReaderOpen: false },
              deletePopup: { isVisible: false },
              errorPopup: { isOpen: false },
              confirmSavePopup: { isOpen: false },
            },
          }),
        ],
        stubs: globalStubs,
      },
    })

    const store = useBlocksStore()
    const initial = store.blocks.length

    const btn = wrapper.find('.add-block')
    await btn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store.blocks.length).toBe(initial + 1)
  })

  it('recalcule les steps après drag-end', async () => {
    const wrapper = mountEditor({
      blocks: {
        blocks: [
          { id: 1, text: '', step: 3, nbOfRepeats: 1, modified: false, images: [], textZones: [] },
          { id: 2, text: '', step: 7, nbOfRepeats: 1, modified: false, images: [], textZones: [] },
        ],
        selectedIndex: 0,
        documentTitle: 'Titre du document',
        currentDocument: { title: 'Titre du document', version: '1.0.0' },
        canAdd: true,
        allDocuments: [],
      },
      imageCrop: { isCropperOpen: false, selectedImageId: null, blockIndex: null, cropRequestTimestamp: 0 },
      popup: { isOpen: false, isReaderOpen: false },
      deletePopup: { isVisible: false },
      errorPopup: { isOpen: false },
      confirmSavePopup: { isOpen: false },
    })

    await (wrapper.vm as any).onDragEnd()
    const store = useBlocksStore()
    expect(store.blocks[0]?.step).toBe(1)
    expect(store.blocks[1]?.step).toBe(2)
  })

  it('handleCropComplete met à jour l’image et le modified', async () => {
    const wrapper = mountEditor()
    const blocksStore = useBlocksStore()
    const imageStore = useImageCropStore()
    blocksStore.blocks[0]!.images = [{ id: 10, imagePath: 'old.png' } as any]
    imageStore.selectedImageId = 10
    imageStore.blockIndex = 0
    const modSpy = vi.spyOn(blocksStore, 'setModified')

    await (wrapper.vm as any).handleCropComplete('new.png')

    expect(blocksStore.blocks[0]!.images[0]!.imagePath).toBe('new.png')
    expect(modSpy).toHaveBeenCalledWith(0, true)
  })

  it('le watcher anyPopupOpen ajoute/supprime la classe no-scroll', async () => {
    const wrapper = mountEditor()
    const vm = wrapper.vm as any

    vm.openSaveDialog()
    await wrapper.vm.$nextTick()
    expect(document.getElementById('app')!.classList.contains('no-scroll')).toBe(true)

    vm.handleSaveCancel()
    await wrapper.vm.$nextTick()
    expect(document.getElementById('app')!.classList.contains('no-scroll')).toBe(false)
  })
})
