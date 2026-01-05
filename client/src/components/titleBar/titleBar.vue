<template>
  <header class="header">
    <div class="titleBarContent">
      <h1 class="SimpleBar">|</h1>
      <input 
        v-model="blocksStore.documentTitle" 
        class="documentTitle" 
        type="text" 
        placeholder="Titre du document"
      @keydown.enter="handleEnter" 
      @focus="handleFocus"
      />
    </div>
  </header> 
</template>

<script setup lang="ts">
import { useBlocksStore } from '../../stores/blockStores'

const blocksStore = useBlocksStore()

function handleEnter(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target) {
    target.blur();
  }
}

function handleFocus(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target) {
    target.select();
  }
}
</script>

<style scoped>

.header {
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  height: 45px;
  width: 100%;
  z-index: 1000;
}

.titleBarContent {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-height: 45px;
}

.SimpleBar {
  font-size: 24px;
  font-weight: 900;
  color: #E30613;
  display: block;
  line-height: 1;
  height: 29px;
}

.documentTitle {
  margin: 0;
  padding: 4px 8px;
  font-weight: 300;
  color: #ffffff;
  font-size: 16px;
  line-height: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  min-width: 200px;
  width: auto;
  border-radius: 4px;
  box-sizing: border-box;
}

.documentTitle:focus {
  background: rgba(255, 255, 255, 0.1);
  border : 2px solid #E30613;
}

</style>
