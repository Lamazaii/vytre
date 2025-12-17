<script setup lang="ts">
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
      @select="toggleSelect(i)"
      />
     </div>

    <div class= "addBlock"> 
         <AddBlockZone @add="addEmptyBlockIfAllowed" :disabled="!canAdd" />
    </div>

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

</style>
