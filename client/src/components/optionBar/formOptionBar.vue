<template>
  <div class="shapeOptionBar">
    <div ref="shapeMenuRef" class="shape-button-group">
      <button
        class="shape-select-button"
        type="button"
        :title="selectedShapeLabel"
        @click="addShape(selectedShape)"
      >
        <img class="shape-select-icon" :src="selectedShapeIcon" :alt="selectedShapeLabel" />
        <span class="shape-select-label">{{ selectedShapeLabel }}</span>
      </button>
      <button
        class="shape-select-caret-button"
        type="button"
        title="Choisir une forme"
        aria-haspopup="menu"
        :aria-expanded="isShapeMenuOpen"
        @click="toggleShapeMenu"
      >
        <span class="shape-select-caret-outside" aria-hidden="true"></span>
      </button>

      <div v-if="isShapeMenuOpen" class="shape-menu" role="menu" aria-label="Choisir une forme">
        <button v-if="selectedShape !== 'circle'" class="shape-menu-item" type="button" role="menuitem" @click="selectShape('circle')">
          <img class="shape-menu-icon" :src="circleIcon" alt="Rond" />
          <span class="shape-menu-label">Rond</span>
        </button>
        <button v-if="selectedShape !== 'triangle'" class="shape-menu-item" type="button" role="menuitem" @click="selectShape('triangle')">
          <img class="shape-menu-icon" :src="triangleIcon" alt="Triangle" />
          <span class="shape-menu-label">Triangle</span>
        </button>
        <button v-if="selectedShape !== 'square'" class="shape-menu-item" type="button" role="menuitem" @click="selectShape('square')">
          <img class="shape-menu-icon" :src="squareIcon" alt="Carre" />
          <span class="shape-menu-label">Carre</span>
        </button>
      </div>
    </div>

    <div class="separator"></div>

    <div ref="fillColorRoot" class="color-button-group">
      <button class="color-select-button" type="button" title="Couleur de remplissage">
        <svg class="color-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" :fill="fillColor">
          <path d="m247-904 57-56 343 343q23 23 23 57t-23 57L457-313q-23 23-57 23t-57-23L153-503q-23-23-23-57t23-57l190-191-96-96Zm153 153L209-560h382L400-751Zm303.5 447.5Q680-327 680-360q0-21 12.5-45t27.5-45q9-12 19-25t21-25q11 12 21 25t19 25q15 21 27.5 45t12.5 45q0 33-23.5 56.5T760-280q-33 0-56.5-23.5ZM80 0v-160h800V0H80Z"/>
        </svg>
      </button>
      <button
        class="color-caret-button"
        type="button"
        title="Choisir une couleur"
        aria-haspopup="menu"
        :aria-expanded="showFillColorPicker"
        @click="toggleFillColorPicker"
      >
        <span class="color-caret" aria-hidden="true"></span>
      </button>

      <div v-if="showFillColorPicker" class="colorMenu" role="menu">
        <div class="swatches">
          <button class="swatch" v-for="c in presetColors" :key="'fill-' + c" :style="{ background: c }" @click="selectFillColor(c)" :aria-label="c"></button>
        </div>
      </div>
    </div>

    <div ref="strokeColorRoot" class="color-button-group">
      <button class="color-select-button" type="button" title="Couleur du contour">
        <svg class="color-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" :fill="strokeColor">
          <path d="M280-120v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80ZM120-120v-720h720v80H200v640h-80Z"/>
        </svg>
      </button>
      <button
        class="color-caret-button"
        type="button"
        title="Choisir une couleur"
        aria-haspopup="menu"
        :aria-expanded="showStrokeColorPicker"
        @click="toggleStrokeColorPicker"
      >
        <span class="color-caret" aria-hidden="true"></span>
      </button>

      <div v-if="showStrokeColorPicker" class="colorMenu" role="menu">
        <div class="swatches">
          <button class="swatch" v-for="c in presetColors" :key="'stroke-' + c" :style="{ background: c }" @click="selectStrokeColor(c)" :aria-label="c"></button>
        </div>
      </div>
    </div>

    <div ref="strokeWidthMenuRef" class="stroke-width-group">
      <button class="stroke-width-button" type="button" title="Épaisseur du contour">
        <div class="stroke-width-preview" :style="{ height: strokeWidth + 'px' }"></div>
        <span class="stroke-width-label">{{ strokeWidth }}px</span>
      </button>
      <button
        class="stroke-width-caret-button"
        type="button"
        title="Choisir l'épaisseur"
        aria-haspopup="menu"
        :aria-expanded="isStrokeWidthMenuOpen"
        @click="toggleStrokeWidthMenu"
      >
        <span class="stroke-width-caret" aria-hidden="true"></span>
      </button>

      <div v-if="isStrokeWidthMenuOpen" class="stroke-width-menu" role="menu" aria-label="Choisir l'épaisseur">
        <button 
          v-for="width in availableStrokeWidths" 
          :key="width"
          class="stroke-width-menu-item" 
          type="button" 
          role="menuitem" 
          @click="selectStrokeWidth(width)"
        >
          <div class="stroke-width-preview" :style="{ height: width + 'px' }"></div>
          <span class="stroke-width-menu-label">{{ width }}px</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useShapeStore } from '../../stores/shapeStore'
import squareIcon from "../../assets/formOptionBar/square.svg"
import circleIcon from "../../assets/formOptionBar/circle.svg"
import triangleIcon from "../../assets/formOptionBar/triangle.svg"

type ShapeType = 'square' | 'circle' | 'triangle'

const shapeStore = useShapeStore()
const isShapeMenuOpen = ref(false)
const shapeMenuRef = ref<HTMLElement | null>(null)
const selectedShape = ref<ShapeType>('square')

const fillColor = ref('#3B82F6')
const strokeColor = ref('#1F2937')
const strokeWidth = ref(2)
const strokeWidthOptions = [1, 2, 3, 4, 5]

const showFillColorPicker = ref(false)
const showStrokeColorPicker = ref(false)
const fillColorRoot = ref<HTMLElement | null>(null)
const strokeColorRoot = ref<HTMLElement | null>(null)

const isStrokeWidthMenuOpen = ref(false)
const strokeWidthMenuRef = ref<HTMLElement | null>(null)

const presetColors = ['#000000', '#3b82f6', '#dc2626', '#10b981', '#6b7280', '#f59e0b', '#92400e', '#7c3aed']

const selectedShapeIcon = computed(() => {
  if (selectedShape.value === 'circle') return circleIcon
  if (selectedShape.value === 'triangle') return triangleIcon
  return squareIcon
})

const selectedShapeLabel = computed(() => {
  if (selectedShape.value === 'circle') return 'Rond'
  if (selectedShape.value === 'triangle') return 'Triangle'
  return 'Carre'
})

const availableStrokeWidths = computed(() => {
  return strokeWidthOptions.filter(w => w !== strokeWidth.value)
})

function addShape(shape: ShapeType) {
  shapeStore.setActiveShape(shape)
  shapeStore.requestAddShape()

  setTimeout(() => {
    shapeStore.clearActiveShape()
  }, 150)

  isShapeMenuOpen.value = false
}

function selectShape(shape: ShapeType) {
  selectedShape.value = shape
  isShapeMenuOpen.value = false
}

function toggleShapeMenu() {
  isShapeMenuOpen.value = !isShapeMenuOpen.value
}

function toggleFillColorPicker() {
  showFillColorPicker.value = !showFillColorPicker.value
  showStrokeColorPicker.value = false
}

function toggleStrokeColorPicker() {
  showStrokeColorPicker.value = !showStrokeColorPicker.value
  showFillColorPicker.value = false
}

function selectFillColor(color: string) {
  fillColor.value = color
  showFillColorPicker.value = false
}

function selectStrokeColor(color: string) {
  strokeColor.value = color
  showStrokeColorPicker.value = false
}

function toggleStrokeWidthMenu() {
  isStrokeWidthMenuOpen.value = !isStrokeWidthMenuOpen.value
}

function selectStrokeWidth(width: number) {
  strokeWidth.value = width
  isStrokeWidthMenuOpen.value = false
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  
  if (shapeMenuRef.value && !shapeMenuRef.value.contains(target)) {
    isShapeMenuOpen.value = false
  }
  
  if (fillColorRoot.value && !fillColorRoot.value.contains(target)) {
    showFillColorPicker.value = false
  }
  
  if (strokeColorRoot.value && !strokeColorRoot.value.contains(target)) {
    showStrokeColorPicker.value = false
  }
  
  if (strokeWidthMenuRef.value && !strokeWidthMenuRef.value.contains(target)) {
    isStrokeWidthMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

</script>

<style scoped>
.shapeOptionBar {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #F3F4F6;
  border-bottom: 0.5px solid #c2c2c2;
  box-sizing: border-box;
  padding: 0 16px;
}

.shape-button-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
}

.shape-select-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.shape-select-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.shape-select-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
}

.shape-select-caret-button {
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

.shape-select-caret-outside {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #4B5563;
}

.shape-menu {
  position: absolute;
  top: 40px;
  min-width: 95px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.shape-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.shape-menu-item:hover {
  background: #F3F4F6;
}

.shape-menu-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.shape-menu-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: #D1D5DB;
  margin: 0 4px;
}

.color-button-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
}

.color-select-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.color-select-button:hover {
  background: #F9FAFB;
}

.color-caret-button {
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

.color-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #4B5563;
}

.color-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.stroke-width-group {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
}

.stroke-width-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.stroke-width-button:hover {
  background: #F9FAFB;
}

.stroke-width-caret-button {
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

.stroke-width-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #4B5563;
}

.stroke-width-menu {
  position: absolute;
  top: 40px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.stroke-width-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.stroke-width-menu-item:hover {
  background: #F3F4F6;
}

.stroke-width-preview {
  width: 30px;
  background-color: #1F2937;
  border-radius: 2px;
}

.stroke-width-menu-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  color: #1F2937;
}

.stroke-width-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
  font-weight: 500;
}

.colorMenu {
  position: absolute;
  top: 40px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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
  padding: 0;
  transition: transform 120ms ease;
}

.swatch:hover {
  transform: scale(1.15);
}


</style>
