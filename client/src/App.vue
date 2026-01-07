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

const { blocks, selectedIndex, canAdd } = storeToRefs(blocksStore)
const saveDialogOpen = ref(false)
const documentTitle = ref('Titre du document actuel')
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
  documentTitle.value = value || documentTitle.value
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
  <div class="app">
    <div class="header">
      <TitleBar/>
    </div>
    <div class="OptionBarSpacer">
      <OptionBar @save="openSaveDialog" />
    </div>

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
  </div>
</template>

<style scoped>

:global(body) {
  margin: 0;
  padding: 0;
}


:global(#app) {
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  background-color: #777777;
}
.header {
  width: 100%;
  height: 45px;
  max-width: 1468px;
}

.app {
  font-family: 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative;
  width: auto;
  max-width: 1468px;
  height: auto;
  min-height: 717px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #F3F4F6;
  margin: 0;
  padding: 0;
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

</style>
