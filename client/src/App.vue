<script setup lang="ts">
import CopyPastePopup from './components/popup/ClipBoardPopup/CopyPastePopup.vue';
import SavePopUp from './components/popup/SavePopUp.vue';
import Element from './components/blockElement/element.vue';
import AddBlockZone from './components/addBlock/addBlockZone.vue';
import OptionBar from './components/optionBar/optionBar.vue';
import TitleBar from './components/titleBar/titleBar.vue';
import ReaderViewWindow from './components/readerView/readerViewWindow.vue';
import DeletePopup from './components/popup/DeletePopup.vue';
import ErrorPopup from './components/popup/ErrorPopup.vue';
import { ref } from 'vue'
import { useBlocksStore } from './stores/blockStores';
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'

const blocksStore = useBlocksStore()

const { blocks, selectedIndex, canAdd, documentTitle } = storeToRefs(blocksStore)
const saveDialogOpen = ref(false)
const clipboardText = ref('')

function setModified(i: number, value: boolean) {
  blocksStore.setModified(i, value)
}

function openSaveDialog() {
  saveDialogOpen.value = true
}

function handleSaveCancel() {
  saveDialogOpen.value = false
}

function handleSaveConfirm(value: string) {
  if (value.trim()) {
    blocksStore.documentTitle = value.trim()
  }
  saveDialogOpen.value = false
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

    <DeletePopup/>
    <ErrorPopup/>
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
