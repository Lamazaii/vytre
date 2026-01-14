<template>
  <div class="titleBar" :class="{ 'titleBar--readonly': isReadOnly, 'titleBar--menu': isMenu }">

    <button v-if="!isReadOnly && !isMenu" class="homeButton" @click="$emit('home')" aria-label="Retour au menu">
      <img :src="homeIcon" alt="Home" class="homeIcon" />
    </button>

    <div class = "SimpleBar"></div>

    <div class="inputZone">
      <div v-if="customTitle" class="customTitle">{{ customTitle }}</div>
      <input
      v-else
      maxlength="80"
      id="documentTitleInput"
      name="documentTitle"
      v-model="blocksStore.documentTitle" 
      :class="{ 'documentTitle--readonly': isReadOnly }"
      type="text" 
      placeholder="Titre du document"
      :readonly="isReadOnly"
      :disabled="isReadOnly"
      @keydown.enter="handleEnter" 
      @focus="handleFocus"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { useBlocksStore } from '../../stores/blockStores'
import homeIcon from '../../assets/menu/home.svg'

defineProps<{
  isReadOnly?: boolean
  isMenu?: boolean
  customTitle?: string
}>()

defineEmits<{
  (e: 'home'): void
}>()

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

.titleBar {
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px;
  width: 100%;
  max-width: 1468px;
  gap : 5px;
  position: relative;
}

.titleBar--readonly {
  height: 35px;
}

.titleBar--menu {
  min-height: 45px;
  max-width: 100%;
}

.titleBar--readonly .titleBarContent {
  max-height: 35px;
}

.inputZone {
  display: flex;
  align-items: center;
}

.homeButton {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: opacity 0.2s;
  width: 30px;
  height: 30px;
  position: absolute;
  left: 10px;
}

.homeButton:hover {
  opacity: 0.7;
}

.homeIcon {
  width: 25px;
  height: 25px;
}

.SimpleBar{
  background-color :#dc2626;
  height : 26px;
  width : 4px;
}

.titleBar--readonly .SimpleBar {
  font-size: 16px;
  display:flex;
  align-items: center;
}

.customTitle {
  color: #ffffff;
}

#documentTitleInput {
  font-weight: 300;
  color: #ffffff;
  font-size: 16px;
  line-height: 1;
  background: transparent;
  border: none;
  font-family: inherit;
  border-radius: 4px;
  box-sizing: border-box;
  width: auto;  
  min-width: 100px; 
  max-width: 100%; 
  field-sizing: content;
}

.titleBar--readonly .documentTitle,
#documentTitleInput--readonly {
  font-size: 13px;
  min-width: auto;
  cursor: default;
}

.documentTitle:focus {
  background: rgba(255, 255, 255, 0.1);
  border : 2px solid #E30613;
}

.documentTitle--readonly:focus {
  background: transparent;
  border: none;
}

</style>
