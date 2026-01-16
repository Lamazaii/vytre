<template>
  <div class="textOptionBar">
    <!-- Formatting buttons: bold, italic, underline -->
    <div class="formatGroup">
      <!-- Bold (Ctrl+B) -->
      <button class="formatButton" :class="{ active: bold }" @mousedown.prevent @click="applyBold" title="Bold">
        <img :src="bold ? boldIconActive : boldIcon" alt="Bold" />
      </button>

      <!-- Italic (Ctrl+I) -->
      <button class="formatButton" :class="{ active: italic }" @mousedown.prevent @click="applyItalic" title="Italic">
        <img :src="italic ? italicIconActive : italicIcon" alt="Italic" />
      </button>

      <!-- Underline (Ctrl+U) -->
      <button class="formatButton" :class="{ active: underline }" @mousedown.prevent @click="applyUnderline" title="Underline">
        <img :src="underline ? underlineIconActive : underlineIcon" alt="Underline" />
      </button>

      <div class="divider"></div>

      <button class="formatButton" :class="{ active: addText }" @click="onAddText" title="Add text">
        <img :src="addText ? addTextIconActive : addTextIcon" alt="Add text" />
      </button>
    </div>

    <!-- Font size and color controls -->
    <div class="textControls">
      <select class="fontSize" v-model="fontSize" @change="handleSizeChange" aria-label="Text size">
        <option value="Small">Petit</option>
        <option value="Medium">Moyen</option>
        <option value="Large">Grand</option>
      </select>

      <!-- Color picker -->
      <div class="colorPicker" ref="colorRoot">
        <button class="colorButton" @click="toggleColorPicker" :aria-expanded="showColor" aria-haspopup="true" title="Color">
          <span class="colorPreview" :style="{ background: color }"></span>
        </button>

        <div v-if="showColor" class="colorMenu" role="menu">
          <div class="swatches">
            <button class="swatch" v-for="c in presetColors" :key="c" :style="{ background: c }" @click="selectColor(c)" :aria-label="c"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
// SVG icons for formatting buttons
import boldIcon from "../../assets/textOptionBar/bold.svg"
import boldIconActive from "../../assets/textOptionBar/boldActive.svg"
import italicIcon from "../../assets/textOptionBar/italic.svg"
import italicIconActive from "../../assets/textOptionBar/italicActive.svg"
import underlineIcon from "../../assets/textOptionBar/underline.svg"
import underlineIconActive from "../../assets/textOptionBar/underlineActive.svg"
import addTextIcon from "../../assets/textOptionBar/addText.svg"
import addTextIconActive from "../../assets/textOptionBar/addTextActive.svg"

import { storeToRefs } from 'pinia'
import { useTextFormatStore } from '../../stores/textFormatStore'
import { useBlocksStore } from '../../stores/blockStores'

const textFormatStore = useTextFormatStore()
const blocksStore = useBlocksStore()

// Formatting state: bold, italic, underline, fontSize
const { bold, italic, underline, fontSize } = storeToRefs(textFormatStore)
const { applyBold, applyItalic, applyUnderline, applyColor, applyFontSize, updateStatesFromCommand } = textFormatStore

const addText = ref(false)
const color = ref('#000000')
const showColor = ref(false)
const colorRoot = ref<HTMLElement | null>(null)

// Preset colors
const presetColors = ['#000000', '#3b82f6', '#dc2626', '#10b981', '#6b7280', '#f59e0b', '#92400e', '#7c3aed']

function handleSizeChange() {
  applyFontSize(fontSize.value)
}

function toggleColorPicker() {
  showColor.value = !showColor.value
}

function selectColor(c: string) {
  color.value = c
  applyColor(c)
  showColor.value = false
}

function onAddText() {
  addText.value = !addText.value
  if (addText.value) {
    blocksStore.addTextZone()
    addText.value = false
  }
}

function onDocClick(e: MouseEvent) {
  const root = colorRoot.value
  if (!root) return
  const target = e.target as Node
  if (!root.contains(target)) {
    showColor.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('selectionchange', updateStatesFromCommand)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('selectionchange', updateStatesFromCommand)
})
</script>

<style scoped>
.textOptionBar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  height: 40px;
  width: 100%;
  background-color: #F3F4F6;
  border-bottom: 0.5px solid #c2c2c2;
  box-sizing: border-box;
  padding: 0 16px;
  margin: 0;
}

.formatGroup {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: transparent;
  border-radius: 6px;
}

.formatButton {
  min-width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.formatButton:hover {
  background: #E0E0E0;
}

.formatButton.active {
  background: rgba(220, 38, 38, 0.15);
}

.formatButton img {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}

.divider {
  width: 1px;
  height: 24px;
  background: #919191;
  margin: 0 6px;
}

.textControls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fontSize {
  height: 30px;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #fff;
}

.colorButton {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
}

.colorPreview {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.colorPicker {
  position: relative;
  display: flex;
  align-items: center;
  gap : 10px;
}

.colorMenu {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.swatches {
  display: flex;
  gap: 6px;
  margin-left: 6px;
  margin-right: 6px;
}

.swatch {
  width: 17px;
  height: 17px; 
  border-radius: 3px;
  border: 1px solid #ddd;
  cursor: pointer;
}
</style>