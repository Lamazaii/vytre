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
  NameConflictPopup: { template: '<div />' },
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
    const wrapper = mount(Editor, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              blocks: {
                blocks: [
                  { id: 1, text: '', step: 3, nbOfRepeats: 1, modified: false, images: [], textZones: [] },
                  { id: 2, text: '', step: 7, nbOfRepeats: 1, modified: false, images: [], textZones: [] },
                ],
                selectedIndex: 0,
                documentTitle: 'Titre du document',
                currentDocument: { title: 'Titre du document', version: '1.0.0' },
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

  it('handleHome émet selectMode menu', async () => {
    const wrapper = mountEditor()
    const { useDeletePopupStore } = await import('../../stores/deletePopupStore')
    const deletePopup = useDeletePopupStore()
    // Make show() immediately invoke its callback so selectMode is emitted
    vi.spyOn(deletePopup, 'show').mockImplementation((_type: string, cb: () => void) => { cb() })
    ;(wrapper.vm as any).handleHome()
    expect(wrapper.emitted('selectMode')).toBeTruthy()
    expect(wrapper.emitted('selectMode')![0]).toEqual(['menu'])
  })

  it('toggleSelect appelle blocksStore.toggleSelect', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    const spy = vi.spyOn(store, 'toggleSelect')
    ;(wrapper.vm as any).toggleSelect(0)
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('removeBlock appelle blocksStore.removeBlock', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    const spy = vi.spyOn(store, 'removeBlock')
    ;(wrapper.vm as any).removeBlock(0)
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('handleSaveConfirm rouvre le dialog quand saveDocument retourne rename', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    vi.spyOn(store, 'saveDocument').mockResolvedValue('rename')
    await (wrapper.vm as any).handleSaveConfirm('Titre')
    await wrapper.vm.$nextTick()
    expect((wrapper.vm as any).saveDialogOpen).toBe(true)
  })

  it('watch cropRequestTimestamp ouvre le cropper quand timestamp > 0', async () => {
    const wrapper = mountEditor()
    const blocksStore = useBlocksStore()
    const imageStore = useImageCropStore()

    const img = { id: 'img1', imagePath: 'photo.jpg' }
    blocksStore.blocks[0]!.images = [img as any]
    imageStore.selectedImageId = 'img1'
    imageStore.blockIndex = 0

    const openSpy = vi.spyOn(imageStore, 'openCropper')
    imageStore.cropRequestTimestamp = Date.now()
    await wrapper.vm.$nextTick()
    expect(openSpy).toHaveBeenCalledWith('photo.jpg')
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

  it('triggerAutoSave ne sauvegarde pas si pas de id document', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    store.currentDocument.id = undefined
    store.hasUnsavedChanges = true
    const spy = vi.spyOn(store, 'saveDocument')
    await (wrapper.vm as any).triggerAutoSave()
    expect(spy).not.toHaveBeenCalled()
  })

  it('triggerAutoSave ne sauvegarde pas si pas de changements non sauvegardés', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    store.currentDocument.id = 1
    store.hasUnsavedChanges = false
    const spy = vi.spyOn(store, 'saveDocument')
    await (wrapper.vm as any).triggerAutoSave()
    expect(spy).not.toHaveBeenCalled()
  })

  it('triggerAutoSave ne sauvegarde pas si déjà en cours de sauvegarde', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    store.currentDocument.id = 1
    store.hasUnsavedChanges = true
    store.isSaving = true
    const spy = vi.spyOn(store, 'saveDocument')
    await (wrapper.vm as any).triggerAutoSave()
    expect(spy).not.toHaveBeenCalled()
  })

  it('triggerAutoSave appelle saveDocument en mode silencieux', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    store.currentDocument.id = 1
    store.hasUnsavedChanges = true
    store.isSaving = false
    const spy = vi.spyOn(store, 'saveDocument').mockResolvedValue(undefined)
    await (wrapper.vm as any).triggerAutoSave()
    expect(spy).toHaveBeenCalledWith({ silent: true })
  })

  it('onUnmounted nettoie le timer auto-save', async () => {
    const clearSpy = vi.spyOn(window, 'clearInterval')
    const wrapper = mountEditor()
    wrapper.unmount()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('setModified appelle blocksStore.setModified', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    const spy = vi.spyOn(store, 'setModified')
    ;(wrapper.vm as any).setModified(0, true)
    expect(spy).toHaveBeenCalledWith(0, true)
  })

  it('addEmptyBlockIfAllowed appelle blocksStore.addEmptyBlockIfAllowed', async () => {
    const wrapper = mountEditor()
    const store = useBlocksStore()
    const spy = vi.spyOn(store, 'addEmptyBlockIfAllowed')
    ;(wrapper.vm as any).addEmptyBlockIfAllowed()
    expect(spy).toHaveBeenCalled()
  })

  it('handleCropComplete ne fait rien si selectedImageId est null', async () => {
    const wrapper = mountEditor()
    const blocksStore = useBlocksStore()
    const imageStore = useImageCropStore()
    blocksStore.blocks[0]!.images = [{ id: 10, imagePath: 'old.png' } as any]
    imageStore.selectedImageId = null
    imageStore.blockIndex = 0
    const modSpy = vi.spyOn(blocksStore, 'setModified')
    await (wrapper.vm as any).handleCropComplete('new.png')
    expect(modSpy).not.toHaveBeenCalled()
  })

  it('handleCropComplete ne fait rien si imageIndex est -1', async () => {
    const wrapper = mountEditor()
    const blocksStore = useBlocksStore()
    const imageStore = useImageCropStore()
    blocksStore.blocks[0]!.images = [{ id: 99, imagePath: 'old.png' } as any]
    imageStore.selectedImageId = 42
    imageStore.blockIndex = 0
    const modSpy = vi.spyOn(blocksStore, 'setModified')
    await (wrapper.vm as any).handleCropComplete('new.png')
    expect(modSpy).not.toHaveBeenCalled()
  })

  it('watch cropRequestTimestamp ne fait rien si timestamp est 0', async () => {
    const wrapper = mountEditor()
    const imageStore = useImageCropStore()
    const openSpy = vi.spyOn(imageStore, 'openCropper')
    imageStore.cropRequestTimestamp = 0
    await wrapper.vm.$nextTick()
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('watch cropRequestTimestamp ne fait rien si blockIndex est null', async () => {
    const wrapper = mountEditor()
    const imageStore = useImageCropStore()
    imageStore.blockIndex = null
    const openSpy = vi.spyOn(imageStore, 'openCropper')
    imageStore.cropRequestTimestamp = Date.now()
    await wrapper.vm.$nextTick()
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('watch cropRequestTimestamp ne fait rien si image non trouvée', async () => {
    const wrapper = mountEditor()
    const blocksStore = useBlocksStore()
    const imageStore = useImageCropStore()
    blocksStore.blocks[0]!.images = [{ id: 99, imagePath: 'photo.jpg' } as any]
    imageStore.selectedImageId = 42
    imageStore.blockIndex = 0
    const openSpy = vi.spyOn(imageStore, 'openCropper')
    imageStore.cropRequestTimestamp = Date.now()
    await wrapper.vm.$nextTick()
    expect(openSpy).not.toHaveBeenCalled()
  })
})
