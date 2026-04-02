<script setup lang="ts">
// Popup components
import CopyPastePopup from '../popup/CopyPastePopup.vue';
import SavePopUp from '../popup/SavePopUp.vue';
import ConfirmSavePopUp from '../popup/ConfirmSavePopUp.vue';
import NameConflictPopup from '../popup/NameConflictPopup.vue';

import BlockWrapper from '../blocks/BlockWrapper.vue';
import AddBlockZone from '../blocks/addBlockZone.vue';
import OptionBar from '../optionBar/optionBar.vue';
import TitleBar from '../optionBar/shared/titleBar.vue';
import ReaderViewWindow from '../readerView/readerViewWindow.vue';
import DeletePopup from '../popup/DeletePopup.vue';
import ErrorPopup from '../popup/ErrorPopup.vue';
import CropPopup from '../popup/CropPopup.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBlocksStore } from '../../stores/blockStores';
import { useImageCropStore } from '../../stores/imageCropStore';
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { usePopupStore } from '../../stores/popupStore'
import { useDeletePopupStore } from '../../stores/deletePopupStore'
import { useErrorPopupStore } from '../../stores/errorPopupStore'
import { useConfirmSavePopupStore } from '../../stores/confirmSavePopupStore'

// Initialize all stores
const blocksStore = useBlocksStore()
const popupStore = usePopupStore()
const deletePopupStore = useDeletePopupStore()
const errorPopupStore = useErrorPopupStore()
const confirmSavePopupStore = useConfirmSavePopupStore()
const imageCropStore = useImageCropStore()

// Extract reactive references from store and local state
const { blocks, selectedIndex, canAdd, documentTitle, hasUnsavedChanges, currentDocument, isSaving } = storeToRefs(blocksStore)
const saveDialogOpen = ref(false)
const clipboardText = ref('')

const emit = defineEmits<{
  (e: 'selectMode', mode: 'menu'): void
}>()

// Check if any popup is currently open
const anyPopupOpen = computed(() => {
  return (
    saveDialogOpen.value === true ||
    popupStore.isOpen === true ||
    deletePopupStore.isVisible === true ||
    errorPopupStore.isOpen === true ||
    confirmSavePopupStore.isOpen === true ||
    imageCropStore.isCropperOpen === true
  )
})

// Disable page scroll when any popup is open
watch(anyPopupOpen, (open) => {
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.classList.toggle('no-scroll', open)
  }
}, { immediate: true })

// Auto-save every 5 minutes if document has unsaved changes
const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000
let autoSaveTimer: ReturnType<typeof setInterval> | null = null

async function triggerAutoSave() {
  if (!currentDocument.value.id) return
  if (!hasUnsavedChanges.value) return
  if (isSaving.value) return

  await blocksStore.saveDocument({ silent: true })
}

// Setup auto-save interval on component mount
onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  autoSaveTimer = window.setInterval(() => {
    triggerAutoSave().catch((error) => {
      console.error('Auto-save error', error)
    })
  }, AUTO_SAVE_INTERVAL_MS)
})

// Cleanup auto-save timer on component unmount
onUnmounted(() => {
  if (autoSaveTimer !== null) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
})

// Mark block as modified
function setModified(i: number, value: boolean) {
  blocksStore.setModified(i, value)
}

// Open save dialog
function openSaveDialog() {
  saveDialogOpen.value = true
}

// Close save dialog without saving
function handleSaveCancel() {
  saveDialogOpen.value = false
}

// Confirm save with title update
async function handleSaveConfirm(value: string) {
  blocksStore.currentDocument.title = value || documentTitle.value
  
  saveDialogOpen.value = false
  
  const result = await blocksStore.saveDocument()

  // If name conflict, reopen dialog
  if (result === 'rename') {
    saveDialogOpen.value = true
  }
}

function toggleSelect(i: number) {
  blocksStore.toggleSelect(i)
}

function addEmptyBlockIfAllowed() {
  blocksStore.addEmptyBlockIfAllowed()
}

function removeBlock(i: number) {
  blocksStore.removeBlock(i)
}

function onDragEnd() {
  blocksStore.renumberBlocks()
}

function handleClipboardSubmit(value: string) {
  blocksStore.loadFromClipboard(value)
  clipboardText.value = value
}

function handleClipboardCancel() {
  clipboardText.value = ''
}

function handleHome() {
  // Go back to menu directly if no unsaved changes
  if (!hasUnsavedChanges.value) {
    emit('selectMode', 'menu')
    return
  }
  
  // Otherwise show confirmation popup
  deletePopupStore.show('exit', () => {
    emit('selectMode', 'menu')
  })
}

// Update block image after crop operation
function handleCropComplete(croppedImageData: string) {
  imageCropStore.setCroppedImage(croppedImageData)
  
  if (imageCropStore.selectedImageId && imageCropStore.blockIndex !== null) {
    const blockIndex = imageCropStore.blockIndex
    const block = blocks.value[blockIndex]
    if (block && block.images) {
      const imageIndex = block.images.findIndex(img => img.id === imageCropStore.selectedImageId)
      if (imageIndex !== -1 && block.images[imageIndex]) {
        // Update image data with cropped version
        block.images[imageIndex].imagePath = croppedImageData
        blocksStore.setModified(blockIndex, true)
      }
    }
  }
}

watch(() => imageCropStore.cropRequestTimestamp, (timestamp) => {
  // Open cropper when crop request is made
  if (timestamp > 0 && imageCropStore.blockIndex !== null) {
    const block = blocks.value[imageCropStore.blockIndex]
    if (block && block.images) {
      const imageToEdit = block.images.find(img => img.id === imageCropStore.selectedImageId)
      if (imageToEdit) {
        imageCropStore.openCropper(imageToEdit.imagePath)
      }
    }
  }
})
</script>

<template>
  <div id="app" class="app-editor">
    <!-- Header with title and options -->
    <header>
      <div class="OptionBarFixed">
        <TitleBar @home="handleHome" />
        <OptionBar @save="openSaveDialog" />
      </div>
    </header>

    <!-- Content blocks section -->
    <div class="block">
      <!-- Drag and drop blocks reordering -->
      <draggable 
        v-model="blocks" 
        item-key="id"
        ghost-class="ghost"
        handle=".drag-handle"
        filter=".shapeCanvasWrapper, .shapeCanvasWrapper *, canvas, .upper-canvas, .lower-canvas"
        :preventOnFilter="false"
        @end="onDragEnd"
      >
        <template #item="{element: block, index: i}">
          <BlockWrapper
            :key="block.id"
            :block="block"
            :blockIndex="i"
            :active="selectedIndex === i"
            :canDelete="blocks.length > 1"
            @select="toggleSelect(i)"
            @delete="removeBlock(i)"
            @modified="(v:boolean) => setModified(i, v)"
          />
        </template>
      </draggable>

      <!-- Zone to add new blocks -->
      <div class="addBlock"> 
        <AddBlockZone @add="addEmptyBlockIfAllowed" :disabled="!canAdd" />
      </div>
    </div>

       <!-- Clipboard import dialog -->
       <CopyPastePopup
        class="popUp"
        v-model="clipboardText"
        @submit="handleClipboardSubmit"
        @cancel="handleClipboardCancel"
      />

    <!-- Reading mode view -->
    <ReaderViewWindow @save="openSaveDialog"/>

    <!-- Save document dialog -->
    <SavePopUp
      :isOpen="saveDialogOpen"
      v-model="documentTitle"
      @confirm="handleSaveConfirm"
      @cancel="handleSaveCancel"
    />

    <!-- Confirm save and handle conflicts -->
    <ConfirmSavePopUp />
    <NameConflictPopup />
    <DeletePopup/>
    <ErrorPopup/>
    <CropPopup @crop="handleCropComplete" />

  </div>
</template>

<style scoped>

header {
  width: 100%;
  max-width: 1468px;
  height : auto;
  display: flex;
  flex-direction: column;
}

.OptionBarFixed {
  position: fixed;
  width: 100%;
  z-index: 3000;
}

.OptionBarSpacer {
  width: 100%;
  height: 94px;
  display: block;
  margin-bottom: 12px;
}

.addBlock {
  display: flex;
  justify-content: center;
  width: 100%;
}

.popUp{
  display: flex;
  padding-top: 158px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.block {
  margin-top: 140px;
  z-index: 0;
}

</style>
