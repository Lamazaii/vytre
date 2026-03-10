<template>
  <div class="shapeOptionBar">
    <ShapeSelector />

    <div class="separator"></div>

    <ColorPicker 
      v-model="shapeStore.fillColor" 
      title="Couleur de remplissage"
      :icon-path="fillIconPath"
      :preset-colors="presetColors"
      :allow-transparent="true"
    />

    <ColorPicker 
      v-model="shapeStore.strokeColor" 
      title="Couleur du contour"
      :icon-path="strokeIconPath"
      :preset-colors="presetColors"
      :allow-transparent="true"
    />

    <SelecteurEpaisseur 
      v-model="shapeStore.strokeWidth" 
    />

    <div class="organize-button-group" :class="{ disabled: !hasSelectedShape }">
      <button
        class="organize-select-button"
        type="button"
        title="Organiser"
        :disabled="!hasSelectedShape"
        @click="toggleLayerMenu"
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
        :disabled="!hasSelectedShape"
        @click="toggleLayerMenu"
      >
        <span class="organize-caret" aria-hidden="true"></span>
      </button>

      <div v-if="isLayerMenuOpen && hasSelectedShape" class="layerDropdown" role="menu" aria-label="Ordre des formes">
        <button class="layerMenuItem" @click="onBringForwardMenuClick" title="Avancer" type="button">
          <img class="layerMenuIcon" :src="flipToFrontIcon" alt="Avancer" />
          <span class="layerMenuLabel">Avancer</span>
        </button>

        <button class="layerMenuItem" @click="onSendToBackMenuClick" title="Reculer" type="button">
          <img class="layerMenuIcon" :src="flipToBackIcon" alt="Reculer" />
          <span class="layerMenuLabel">Reculer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ShapeSelector from './ShapeSelector.vue'
import ColorPicker from '../shared/ColorPicker.vue'
import SelecteurEpaisseur from '../shared/SelecteurEpaisseur.vue'
import { useShapeStore } from '../../../stores/shapeStore'
import organizationIcon from '../../../assets/optionBarImage/organisation.svg'
import flipToFrontIcon from '../../../assets/optionBarImage/flip_to_front.svg'
import flipToBackIcon from '../../../assets/optionBarImage/flip_to_back.svg'

const shapeStore = useShapeStore()
const isLayerMenuOpen = ref(false)
const hasSelectedShape = computed(() => shapeStore.hasSelectedShape)

const presetColors = ['#000000', '#3b82f6', '#dc2626', '#10b981', '#6b7280', '#f59e0b', '#92400e', '#7c3aed']

const fillIconPath = "m247-904 57-56 343 343q23 23 23 57t-23 57L457-313q-23 23-57 23t-57-23L153-503q-23-23-23-57t23-57l190-191-96-96Zm153 153L209-560h382L400-751Zm303.5 447.5Q680-327 680-360q0-21 12.5-45t27.5-45q9-12 19-25t21-25q11 12 21 25t19 25q15 21 27.5 45t12.5 45q0 33-23.5 56.5T760-280q-33 0-56.5-23.5ZM80 0v-160h800V0H80Z"

const strokeIconPath = "M280-120v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80ZM120-120v-720h720v80H200v640h-80Z"

function toggleLayerMenu() {
  if (!hasSelectedShape.value) {
    return
  }

  isLayerMenuOpen.value = !isLayerMenuOpen.value
}

function closeLayerMenu() {
  isLayerMenuOpen.value = false
}

watch(hasSelectedShape, (isSelected) => {
  if (!isSelected) {
    closeLayerMenu()
  }
})

function onBringForwardMenuClick() {
  shapeStore.requestBringShapeForward()
  closeLayerMenu()
}

function onSendToBackMenuClick() {
  shapeStore.requestSendShapeToBack()
  closeLayerMenu()
}
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

.separator {
  width: 1px;
  height: 24px;
  background-color: #D1D5DB;
  margin: 0 4px;
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
  border-top: 5px solid #4B5563;
}

.organize-button-group.disabled .organize-select-icon {
  filter: grayscale(1) brightness(0.7);
  opacity: 0.55;
}

.organize-button-group.disabled .organize-select-label {
  color: #9CA3AF;
}

.organize-button-group.disabled .organize-caret {
  border-top-color: #9CA3AF;
}

.organize-caret-button:disabled {
  cursor: not-allowed;
}

.layerDropdown {
  position: absolute;
  top: 36px;
  left: 0;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
}

.layerMenuItem {
  width: 100%;
  height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.layerMenuItem:hover {
  background: #f8f8f8;
}

.layerMenuLabel {
  font-family: 'Segoe UI';
  font-size: 12px;
  color: #4B5563;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layerMenuIcon {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
  filter: grayscale(1) brightness(0);
}
</style>
