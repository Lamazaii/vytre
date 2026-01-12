<script setup lang="ts">
import { ref } from 'vue'
import Menu from './components/applications/menu.vue'
import Editor from './components/applications/editor.vue'
import Lector from './components/applications/lector.vue'

const currentMode = ref<'menu' | 'editor' | 'reader'>('menu')

function selectMode(mode: 'editor' | 'reader' | 'menu') {
  currentMode.value = mode
}
</script>

<template>
  <Menu v-if="currentMode === 'menu'" @selectMode="selectMode" />
  <Editor v-else-if="currentMode === 'editor'"/>
  <Lector v-else-if="currentMode === 'reader'" @selectMode="selectMode" class="lector"/>
</template>

<style>
.lector {
  max-width: 911px;
  width : 911px;
  height: 100%;
  max-height: 717px;
  min-height: 717px;
}

#app.no-scroll {
  overflow: hidden;
}
</style>
