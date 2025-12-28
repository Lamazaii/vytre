<script setup lang="ts">
import CopyPastePopup from './components/popup/CopyPastePopup.vue';
  import Element from './components/blockElement/element.vue';
  import AddBlockZone from './components/addBlock/addBlockZone.vue';
  import OptionBar from './components/optionBar/optionBar.vue';
  import TitleBar from './components/titleBar/titleBar.vue';
  import { ref } from 'vue';
  import ReaderViewWindow from './components/readerView/readerViewWindow.vue';
  import { useBlocksStore } from './stores/blockStores';

  const blocksStore = useBlocksStore()

  const selectedIndex = ref<number | null>(null)

  function toggleSelect(i: number) {
    selectedIndex.value = selectedIndex.value === i ? null : i
  }

  function setModified(i: number, value: boolean) {
    blocksStore.setModified(i, value)
  }

  const canAdd = blocksStore.canAdd

  function addEmptyBlockIfAllowed() {
    blocksStore.addEmptyBlockIfAllowed()
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
      @update:modelValue="(v) => { if (blocksStore.blocks[i]) blocksStore.blocks[i].repetitionCount = v }"
      @update:description="(v) => { if (blocksStore.blocks[i]) blocksStore.blocks[i].description = v }"
      @update:images="(v) => { if (blocksStore.blocks[i]) blocksStore.blocks[i].imageStrings = v }"
      :active="selectedIndex === i"
      :modified="block.modified"
      @select="toggleSelect(i)"
      />
     </div>

    <div class= "addBlock"> 
         <AddBlockZone @add="addEmptyBlockIfAllowed" :disabled="!canAdd" />
    </div>

       <CopyPastePopup class="popUp"/>

    <ReaderViewWindow/>

  </div>

</template>

<style scoped>

:global(body) {
  margin: 0;
  padding: 0;
}

:global(#app) {
  width: 100%;
  height: 100%;
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
  width: 100%;
  max-width: 1468px;
  height: 717px;
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

.popUp {
  display: flex;
  padding-top: 158px;
}
</style>
