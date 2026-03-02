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
      <button class="color-button" type="button" title="Couleur de remplissage" @click="toggleFillColorPicker">
        <div class="color-preview" :style="{ backgroundColor: fillColor }"></div>
        <span class="color-label" aria-label="Text size">Remplissage</span>
      </button>

      <div v-if="showFillColorPicker" class="colorMenu" role="menu">
        <div class="swatches">
          <button class="swatch" v-for="c in presetColors" :key="'fill-' + c" :style="{ background: c }" @click="selectFillColor(c)" :aria-label="c"></button>
        </div>
      </div>
    </div>

    <div ref="strokeColorRoot" class="color-button-group">
      <button class="color-button" type="button" title="Couleur du contour" @click="toggleStrokeColorPicker">
        <div class="color-preview" :style="{ backgroundColor: strokeColor }"></div>
        <span class="color-label">Contour</span>
      </button>

      <div v-if="showStrokeColorPicker" class="colorMenu" role="menu">
        <div class="swatches">
          <button class="swatch" v-for="c in presetColors" :key="'stroke-' + c" :style="{ background: c }" @click="selectStrokeColor(c)" :aria-label="c"></button>
        </div>
      </div>
    </div>

    <div class="stroke-width-group">
      <button class="stroke-width-button" type="button" title="Épaisseur du contour">
        <span class="stroke-width-label">{{ strokeWidth }}px</span>
      </button>
    </div>
  </div>
</template>


<script setup lang="ts">

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useShapeStore } from '../../stores/shapeStore'
import squareIcon from "../../assets/formOptionBar/square.svg"
import circleIcon from "../../assets/formOptionBar/circle.svg"
import triangleIcon from "../../assets/formOptionBar/triangle.svg"

const shapeStore = useShapeStore()
const isShapeMenuOpen = ref(false)
const shapeMenuRef = ref<HTMLElement | null>(null)
const selectedShape = ref<'square' | 'circle' | 'triangle'>('square')

// Couleurs et épaisseur par défaut
const fillColor = ref('#3B82F6')
const strokeColor = ref('#1F2937')
const strokeWidth = ref(2)

// Sélecteurs de couleur
const showFillColorPicker = ref(false)
const showStrokeColorPicker = ref(false)
const fillColorRoot = ref<HTMLElement | null>(null)
const strokeColorRoot = ref<HTMLElement | null>(null)

// Couleurs prédéfinies
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

function addShape(shape: 'square' | 'circle' | 'triangle') {
  shapeStore.setActiveShape(shape)
  shapeStore.requestAddShape()

  setTimeout(() => {
    shapeStore.clearActiveShape()
  }, 150)

  isShapeMenuOpen.value = false
}

function selectShape(shape: 'square' | 'circle' | 'triangle') {
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

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  
  // Fermer le menu des formes
  if (shapeMenuRef.value && !shapeMenuRef.value.contains(target)) {
    isShapeMenuOpen.value = false
  }
  
  // Fermer le sélecteur de couleur de remplissage
  if (fillColorRoot.value && !fillColorRoot.value.contains(target)) {
    showFillColorPicker.value = false
  }
  
  // Fermer le sélecteur de couleur de contour
  if (strokeColorRoot.value && !strokeColorRoot.value.contains(target)) {
    showStrokeColorPicker.value = false
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
  gap: 4px;
  padding: 6px 8px;
}

.shape-select-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
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
  left: 0;
  min-width: 150px;
  padding: 6px;
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
  gap: 8px;
  padding: 6px 8px;
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
  width: 18px;
  height: 18px;
  display: block;
}

.shape-menu-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
}

/* Séparateur */
.separator {
  width: 1px;
  height: 24px;
  background-color: #D1D5DB;
  margin: 0 4px;
}

/* Boutons de couleur */
.color-button-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}

.color-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.color-button:hover {
  background: #F9FAFB;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #D1D5DB;
}

.color-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
}

/* Bouton épaisseur du contour */
.stroke-width-group {
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
}

.stroke-width-button {
  height: 30px;
  display: inline-flex;
  align-items: center;
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

.stroke-width-label {
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #1F2937;
  font-weight: 500;
}

/* Menu de sélection de couleur */
.colorMenu {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 28px;
  padding: 0 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
