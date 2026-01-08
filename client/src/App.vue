<script setup lang="ts">
import CopyPastePopup from './components/popup/CopyPastePopup.vue';
import SavePopUp from './components/popup/SavePopUp.vue';
import ConfirmSavePopUp from './components/popup/ConfirmSavePopUp.vue';
import Element from './components/blockElement/element.vue';
import AddBlockZone from './components/addBlock/addBlockZone.vue';
import OptionBar from './components/optionBar/optionBar.vue';
import TitleBar from './components/titleBar/titleBar.vue';
import ReaderViewWindow from './components/readerView/readerViewWindow.vue';
import DeletePopup from './components/popup/DeletePopup.vue';
import ErrorPopup from './components/popup/ErrorPopup.vue';
import CropPopup from './components/popup/CropPopup.vue';
import { ref, computed, watch } from 'vue'
import { useBlocksStore } from './stores/blockStores';
import { useImageCropStore } from './stores/imageCropStore';
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { usePopupStore } from './stores/popupStore'
import { useDeletePopupStore } from './stores/deletePopupStore'
import { useErrorPopupStore } from './stores/errorPopupStore'
import { useConfirmSavePopupStore } from './stores/confirmSavePopupStore'

const blocksStore = useBlocksStore()
const popupStore = usePopupStore()
const deletePopupStore = useDeletePopupStore()
const errorPopupStore = useErrorPopupStore()
const confirmSavePopupStore = useConfirmSavePopupStore()
const imageCropStore = useImageCropStore()

const { blocks, selectedIndex, canAdd, documentTitle } = storeToRefs(blocksStore)
const saveDialogOpen = ref(false)
const clipboardText = ref('')

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

watch(anyPopupOpen, (open) => {
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.classList.toggle('no-scroll', open)
  }
}, { immediate: true })

function setModified(i: number, value: boolean) {
  blocksStore.setModified(i, value)
}

function openSaveDialog() {
  saveDialogOpen.value = true
}

function handleSaveCancel() {
  saveDialogOpen.value = false
}

async function handleSaveConfirm(value: string) {
  blocksStore.currentDocument.title = value || documentTitle.value
  

  saveDialogOpen.value = false
  

  await blocksStore.saveDocument()
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
  blocks.value.forEach((block, index) => {
    block.step = index + 1
  })
}

function handleClipboardSubmit(value: string) {
  blocksStore.loadFromClipboard(value)
  clipboardText.value = value
}

function handleClipboardCancel() {
  clipboardText.value = ''
}

function handleCropComplete(croppedImageData: string) {
  if (imageCropStore.selectedImageId && imageCropStore.blockIndex !== null) {
    const blockIndex = imageCropStore.blockIndex
    const block = blocks.value[blockIndex]
    if (block && block.images) {
      const imageIndex = block.images.findIndex(img => img.id === imageCropStore.selectedImageId)
      if (imageIndex !== -1 && block.images[imageIndex]) {
        block.images[imageIndex].imagePath = croppedImageData
        blocksStore.setModified(blockIndex, true)
      }
    }
  }
}

watch(() => imageCropStore.cropRequestTimestamp, (timestamp) => {
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
    <header>
      <div class="OptionBarFixed">
        <TitleBar/>
        <OptionBar @save="openSaveDialog" />
      </div>
    </header>

    <div class="block">
      <draggable 
        v-model="blocks" 
        item-key="id"
        ghost-class="ghost"
        handle=".drag-handle"
        @end="onDragEnd"
      >
        <template #item="{element: block, index: i}">
          <Element
            :key="block.id"
            :numero="block.step" 
            :description="block.text"
            :modelValue="block.nbOfRepeats"
            :images="block.images"
            :blockIndex="i"
            :active="selectedIndex === i"
            :modified="block.modified"
            :canDelete="blocks.length > 1"
            @select="toggleSelect(i)"
            @delete="removeBlock(i)"
            @modified="(v) => setModified(i, v)"
            @update:description="(v: string) => blocksStore.updateBlockDescription(i, v)"
            @update:modelValue="(v: number) => block.nbOfRepeats = v"
            @update:images="(v: any) => block.images = v"
          />
        </template>
      </draggable>
    </div>

    <div class="addBlock"> 
      <AddBlockZone @add="addEmptyBlockIfAllowed" :disabled="!canAdd" />
    </div>

       <CopyPastePopup
        class="popUp"
        v-model="clipboardText"
        @submit="handleClipboardSubmit"
        @cancel="handleClipboardCancel"
      />

    <ReaderViewWindow @save="openSaveDialog"/>

    <SavePopUp
      :isOpen="saveDialogOpen"
      v-model="documentTitle"
      @confirm="handleSaveConfirm"
      @cancel="handleSaveCancel"
    />

    <ConfirmSavePopUp />

    <DeletePopup/>
    <ErrorPopup/>
    <CropPopup @crop="handleCropComplete" />
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
  align-items: center;
  justify-content: center;
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
