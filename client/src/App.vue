<script setup lang="ts">
import CopyPastePopup from './components/popup/CopyPastePopup.vue';
  import Element from './components/blockElement/element.vue';
  import AddBlockZone from './components/addBlock/addBlockZone.vue';
  import OptionBar from './components/optionBar/optionBar.vue';
  import TitleBar from './components/titleBar/titleBar.vue';
  import { ref, computed } from 'vue';
  import type { Blocks } from './types/Blocks';

  const blocks = ref<Array<Blocks & { modified?: boolean }>>([
    {
      numero: 1,
      titre: 'Titre du Bloc Éditable',
      description: '',
      modified: false
    },
  ]);

  const selectedIndex = ref<number | null>(null)

  function toggleSelect(i: number) {
    selectedIndex.value = selectedIndex.value === i ? null : i
  }

  function setModified(i: number, value: boolean) {
    if (!blocks.value[i]) return
    blocks.value[i] = { ...blocks.value[i], modified: value }
    console.log(`setModified: index=${i} modified=${value}`)
  }

  const canAdd = computed(() => {
    if (blocks.value.length === 0) return true
    const last = blocks.value[blocks.value.length - 1]
    const result = !!(last && last.modified)
    return result
  })

  function addEmptyBlockIfAllowed() {
    if (!canAdd.value) {
      alert('Modifier un bloc avant d\'en ajouter un nouveau.')
      return
    }
    blocks.value.push({ numero: blocks.value.length + 1, titre: 'Nouveau bloc', description: '', modified: false })
  }

  function renumberBlocks() {
    blocks.value = blocks.value.map((block: Blocks & { modified?: boolean }, i: number) => ({ ...block, numero: i + 1 }))
  
  };
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
      v-for="(block,i) in blocks"
      :key="i"
      @modified="(v)=>setModified(i,v)"
      :numero="block.numero"
      :titre="block.titre"
      :description="block.description"
      :active="selectedIndex === i"
      :modified="block.modified"
      @select="toggleSelect(i)"
      />
     </div>

    <div class= "addBlock"> 
         <AddBlockZone @add="addEmptyBlockIfAllowed" :disabled="!canAdd" />
    </div>

       <CopyPastePopup class="popUp"/>
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
  width: 1468px;
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
