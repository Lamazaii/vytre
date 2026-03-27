<template>
  <div class="textOptionBar">
    <!-- Formatting buttons: bold, italic, underline -->
    <div class="formatGroup">
      <button class="formatButton" :class="{ active: bold }" @mousedown.prevent @click="applyBold" title="Bold">
        <img :src="bold ? boldIconActive : boldIcon" alt="Bold" />
      </button>

      <button class="formatButton" :class="{ active: italic }" @mousedown.prevent @click="applyItalic" title="Italic">
        <img :src="italic ? italicIconActive : italicIcon" alt="Italic" />
      </button>

      <button class="formatButton" :class="{ active: underline }" @mousedown.prevent @click="applyUnderline" title="Underline">
        <img :src="underline ? underlineIconActive : underlineIcon" alt="Underline" />
      </button>

      <div class="divider"></div>

      <button class="formatButton" @click="onAddText" title="Add text">
        <img :src="addTextIcon" alt="Add text" />
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

    <div class="divider"></div>

    <div class="organize-button-group" :class="{ disabled: !hasSelectedTextbox }">
      <button
        class="organize-select-button"
        type="button"
        title="Organiser"
        :disabled="!hasSelectedTextbox"
        @click="toggleLayerMenu"
        @mousedown.prevent
      >
        <img class="organize-select-icon" :src="organizationIcon" alt="Organiser" />
        <span class="organize-select-label">Organiser</span>
      </button>

      <button
        class="organize-caret-button"
        type="button"
        title="Afficher le menu organiser"
        aria-haspopup="menu"
        :aria-expanded="isLayerMenuOpen"
        :disabled="!hasSelectedTextbox"
        @click="toggleLayerMenu"
        @mousedown.prevent
      >
        <span class="organize-caret" aria-hidden="true"></span>
      </button>

      <div v-if="isLayerMenuOpen && hasSelectedTextbox" class="layerDropdown" role="menu" aria-label="Ordre du texte">
        <button class="layerMenuItem" @click="onBringForwardMenuClick" @mousedown.prevent title="Avancer" type="button">
          <img class="layerMenuIcon" :src="flipToFrontIcon" alt="Avancer" />
          <span class="layerMenuLabel">Avancer</span>
        </button>

        <button class="layerMenuItem" @click="onSendToBackMenuClick" @mousedown.prevent title="Reculer" type="button">
          <img class="layerMenuIcon" :src="flipToBackIcon" alt="Reculer" />
          <span class="layerMenuLabel">Reculer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
// SVG icons for formatting buttons
import boldIcon from "../../../assets/textOptionBar/bold.svg"
import boldIconActive from "../../../assets/textOptionBar/boldActive.svg"
import italicIcon from "../../../assets/textOptionBar/italic.svg"
import italicIconActive from "../../../assets/textOptionBar/italicActive.svg"
import underlineIcon from "../../../assets/textOptionBar/underline.svg"
import underlineIconActive from "../../../assets/textOptionBar/underlineActive.svg"
import addTextIcon from "../../../assets/textOptionBar/addText.svg"
import organizationIcon from '../../../assets/optionBarImage/organisation.svg'
import flipToFrontIcon from '../../../assets/optionBarImage/flip_to_front.svg'
import flipToBackIcon from '../../../assets/optionBarImage/flip_to_back.svg'

import { storeToRefs } from 'pinia'
import { useTextFormatStore } from '../../../stores/textFormatStore'
import { useShapeStore } from '../../../stores/shapeStore'
import { useBlocksStore } from '../../../stores/blockStores'

// Stores for text formatting commands and block-level text zone actions.
const textFormatStore = useTextFormatStore()
const shapeStore = useShapeStore()

// Reactive formatting flags mirrored from the text format store.
const { bold, italic, underline, fontSize, color, fabricTextbox } = storeToRefs(textFormatStore)
const { applyBold, applyItalic, applyUnderline, applyColor, applyFontSize, updateStatesFromCommand, requestBringTextForward, requestSendTextToBack } = textFormatStore

// Local UI state for add-text toggle and color picker.
const showColor = ref(false)
const colorRoot = ref<HTMLElement | null>(null)

// Layer menu state
const isLayerMenuOpen = ref(false)
const hasSelectedTextbox = computed(() => !!fabricTextbox.value)

function toggleLayerMenu() {
  if (!hasSelectedTextbox.value) return
  isLayerMenuOpen.value = !isLayerMenuOpen.value
}

function closeLayerMenu() {
  isLayerMenuOpen.value = false
}

watch(hasSelectedTextbox, (isSelected) => {
  if (!isSelected) {
    closeLayerMenu()
  }
})

function onBringForwardMenuClick() {
  requestBringTextForward()
  closeLayerMenu()
}

function onSendToBackMenuClick() {
  requestSendTextToBack()
  closeLayerMenu()
}

// Preset color palette displayed in picker.
const presetColors = ['#000000', '#3b82f6', '#dc2626', '#10b981', '#6b7280', '#f59e0b', '#92400e', '#7c3aed']

// Apply selected font size through text formatting store.
function handleSizeChange() {
  applyFontSize(fontSize.value)
}

// Toggle color menu visibility.
function toggleColorPicker() {
  showColor.value = !showColor.value
}

// Apply selected text color and close menu.
function selectColor(c: string) {
  applyColor(c)
  showColor.value = false
}

// Add a new text zone to the selected block.
function onAddText() {
  shapeStore.setActiveShape('text')
  shapeStore.requestAddShape()
  // Also request adding a text zone at the block level so unit tests and
  // block-state handlers respond immediately.
  const blocks = useBlocksStore()
  blocks.addTextZone()
}

// Close color menu when user clicks outside picker root.
function onDocClick(e: MouseEvent) {
  const root = colorRoot.value
  if (!root) return
  const target = e.target as Node
  if (!root.contains(target)) {
    showColor.value = false
  }
}

// Register/unregister document-level listeners.
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
  transition: transform 120ms ease;
}

.swatch:hover {
  transform: scale(1.15);
}

.organize-button-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.organize-select-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease, opacity 160ms ease;
}

.organize-select-button:hover {
  background: #f8f8f8;
}

.organize-select-button:disabled {
  cursor: not-allowed;
  background: #ffffff;
  opacity: 0.5;
}

.organize-select-icon {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
  filter: grayscale(1) brightness(0);
}

.organize-select-label {
  font-family: 'Segoe UI';
  font-size: 12px;
  color: #4B5563;
}

.organize-caret-button {
  width: 22px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.organize-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #4B5563;
}

.layerDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.layerMenuItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.layerMenuItem:hover {
  background: #F3F4F6;
}

.layerMenuIcon {
  width: 16px;
  height: 16px;
}

.layerMenuLabel {
  font-family: 'Segoe UI';
  font-size: 12px;
  color: #374151;
}
</style>