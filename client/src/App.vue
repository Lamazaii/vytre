<script setup lang="ts">
import CopyPastePopup from './components/popup/CopyPastePopup.vue';
import DeleteBlockPopup from './components/popup/DeleteBlockPopup.vue';
import Element from './components/blockElement/element.vue';
import AddBlockZone from './components/addBlock/addBlockZone.vue';
import OptionBar from './components/optionBar/optionBar.vue';
import TitleBar from './components/titleBar/titleBar.vue';
import { storeToRefs } from 'pinia'
import { useBlocksStore } from './stores/blocksStore'

const store = useBlocksStore()
const { blocks, selectedIndex, canAdd } = storeToRefs(store)

function toggleSelect(i: number) {
  store.toggleSelect(i)
}

function setModified(i: number, value: boolean) {
  store.setModified(i, value)
}

function addEmptyBlockIfAllowed() {
  store.addEmptyBlockIfAllowed()
}

function removeBlock(i: number) {
  store.removeBlock(i)
}
</script>

<template>
  <div class="app">
    <TitleBar/>

    <OptionBar />

    <div class = "block">
      <Element
      v-for="(block,i) in blocks"
      :key="i"
      @modified="(v)=>setModified(i,v)"
      :numero="block.numero"
      :titre="block.titre"
      :description="block.description"
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
    <DeleteBlockPopup />
  </div>

</template>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #777777;
}

#app {
  font-family: 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 1468px;
  height: 717px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 50px;
  background-color: #F3F4F6;
  margin: auto;
}

.addBlock {
  display: flex;
  align-items: center;
  justify-content: center;
}

.popUp {
  display: flex;
  padding-top: 158px;
}

</style>
