<script setup lang="ts">
import { ref } from 'vue'
import Menu from './components/applications/menu.vue'
import Editor from './components/applications/editor.vue'
import Lector from './components/applications/lector.vue'

// Current application view: menu, editor, or reader
const currentMode = ref<'menu' | 'editor' | 'reader'>('menu')

// Switch active view based on navigation events from child components
function selectMode(mode: 'editor' | 'reader' | 'menu') {
  currentMode.value = mode
}
</script>

<template>
  <Menu v-if="currentMode === 'menu'" @selectMode="selectMode" />
  <Editor v-else-if="currentMode === 'editor'" @selectMode="selectMode" />
  <Lector v-else-if="currentMode === 'reader'" @selectMode="selectMode" class="lector"/>
</template>

<style>
.lector {
  max-width: 911px;
  width : 911px;
  height: 772px;
  min-height: 772px;
  max-height: 772px;
}

#app.no-scroll {
  overflow: hidden;
}
</style>
