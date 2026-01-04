<script setup lang="ts">
import CopyPastePopup from './components/popup/CopyPastePopup.vue';
  import Element from './components/blockElement/element.vue';
  import AddBlockZone from './components/addBlock/addBlockZone.vue';
  import OptionBar from './components/optionBar/optionBar.vue';
  import TitleBar from './components/titleBar/titleBar.vue';
  import ReaderViewWindow from './components/readerView/readerViewWindow.vue';
  import DeleteBlockPopup from './components/popup/DeleteBlockPopup.vue';
  import ErrorPopup from './components/popup/ErrorPopup.vue';
  import { useBlocksStore } from './stores/blockStores';
  import { storeToRefs } from 'pinia'

  const blocksStore = useBlocksStore()
  const { selectedIndex, canAdd } = storeToRefs(blocksStore)

function toggleSelect(i: number) {
  blocksStore.toggleSelect(i)
}

function setModified(i: number, value: boolean) {
  blocksStore.setModified(i, value)
}

function addEmptyBlockIfAllowed() {
  blocksStore.addEmptyBlockIfAllowed()
}

function removeBlock(i: number) {
  blocksStore.removeBlock(i)
}

</script>

<template>
  <div class="app">
    <div class="header">
      <TitleBar/>
    </div>
    <div class="OptionBarSpacer">
      <OptionBar />
    </div>
    

    <div class = "block">
      <Element
      v-for="(block,i) in blocksStore.blocks"
      :key="i"
      @modified="(v)=>setModified(i,v)"
      :numero="block.numero"
      :description="block.description"
      :modelValue="block.repetitionCount"
      :images="block.imageStrings"
      :blockIndex="i"
      @update:modelValue="(v) => { if (blocksStore.blocks[i]) blocksStore.blocks[i].repetitionCount = v }"
      @update:description="(v) => { if (blocksStore.blocks[i]) blocksStore.blocks[i].description = v }"
      @update:images="(v) => { if (blocksStore.blocks[i]) blocksStore.blocks[i].imageStrings = v }"
      :active="selectedIndex === i"
      :modified="block.modified"
      :canDelete="i !== 0"
      @select="toggleSelect(i)"
      @delete="removeBlock(i)"
      />
     </div>

    <div class= "addBlock"> 
         <AddBlockZone @add="addEmptyBlockIfAllowed" :disabled="!canAdd" />
    </div>

       <CopyPastePopup class="popUp"/>

    <ReaderViewWindow/>

    <DeleteBlockPopup/>
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

</style>
