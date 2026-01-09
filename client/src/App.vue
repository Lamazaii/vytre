<script setup lang="ts">
import { ref } from 'vue'
import Menu from './components/applications/menu.vue'
import Editor from './components/applications/editor.vue'

const currentMode = ref<'menu' | 'editor' | 'reader'>('menu')

function selectMode(mode: 'editor' | 'reader') {
  currentMode.value = mode
}
</script>

<template>
  <Menu v-if="currentMode === 'menu'" @selectMode="selectMode" />
  <Editor v-else-if="currentMode === 'editor'" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app.no-scroll {
  overflow: hidden;
}
</style>
