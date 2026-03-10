<template>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useShapeStore } from '../../../stores/shapeStore'
import { useBlocksStore } from '../../../stores/blockStores'
import { useErrorPopupStore } from '../../../stores/errorPopupStore'
import squareIcon from "../../../assets/formOptionBar/square.svg"
import circleIcon from "../../../assets/formOptionBar/circle.svg"
import triangleIcon from "../../../assets/formOptionBar/triangle.svg"

type ShapeType = 'square' | 'circle' | 'triangle'

// Stores for shape commands, block selection, and validation feedback.
const shapeStore = useShapeStore()
const blocksStore = useBlocksStore()
const errorPopupStore = useErrorPopupStore()
// Dropdown state and currently selected shape preset.
const isShapeMenuOpen = ref(false)
const shapeMenuRef = ref<HTMLElement | null>(null)
const selectedShape = ref<ShapeType>('square')

// Resolve icon for currently selected shape.
const selectedShapeIcon = computed(() => {
  if (selectedShape.value === 'circle') return circleIcon
  if (selectedShape.value === 'triangle') return triangleIcon
  return squareIcon
})

// Resolve display label for currently selected shape.
const selectedShapeLabel = computed(() => {
  if (selectedShape.value === 'circle') return 'Rond'
  if (selectedShape.value === 'triangle') return 'Triangle'
  return 'Carre'
})

function addShape(shape: ShapeType) {
  // Shape insertion requires an active block.
  if (blocksStore.selectedIndex === null) {
    errorPopupStore.show('Veuillez sélectionner un bloc avant d\'ajouter une forme.')
    isShapeMenuOpen.value = false
    return
  }

  shapeStore.setActiveShape(shape)
  shapeStore.requestAddShape()

  setTimeout(() => {
    shapeStore.clearActiveShape()
  }, 150)

  isShapeMenuOpen.value = false
}

// Update dropdown selection without creating object yet.
function selectShape(shape: ShapeType) {
  selectedShape.value = shape
  isShapeMenuOpen.value = false
}

// Toggle shape picker menu visibility.
function toggleShapeMenu() {
  isShapeMenuOpen.value = !isShapeMenuOpen.value
}

// Close the menu when clicking outside selector container.
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  
  if (shapeMenuRef.value && !shapeMenuRef.value.contains(target)) {
    isShapeMenuOpen.value = false
  }
}

// Register/unregister document click listener.
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
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
</style>
