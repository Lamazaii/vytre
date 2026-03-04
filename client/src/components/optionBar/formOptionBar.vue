<template>
  <div class="shapeOptionBar">
    <ShapeSelector />

    <div class="separator"></div>

    <ColorPicker 
      v-model="shapeStore.fillColor" 
      title="Couleur de remplissage"
      :icon-path="fillIconPath"
      :preset-colors="presetColors"
    />

    <ColorPicker 
      v-model="shapeStore.strokeColor" 
      title="Couleur du contour"
      :icon-path="strokeIconPath"
      :preset-colors="presetColors"
    />

    <SelecteurEpaisseur 
      v-model="shapeStore.strokeWidth" 
    />
  </div>
</template>

<script setup lang="ts">
import ShapeSelector from './ShapeSelector.vue'
import ColorPicker from './ColorPicker.vue'
import SelecteurEpaisseur from './SelecteurEpaisseur.vue'
import { useShapeStore } from '../../stores/shapeStore'

const shapeStore = useShapeStore()

const presetColors = ['#000000', '#3b82f6', '#dc2626', '#10b981', '#6b7280', '#f59e0b', '#92400e', '#7c3aed']

const fillIconPath = "m247-904 57-56 343 343q23 23 23 57t-23 57L457-313q-23 23-57 23t-57-23L153-503q-23-23-23-57t23-57l190-191-96-96Zm153 153L209-560h382L400-751Zm303.5 447.5Q680-327 680-360q0-21 12.5-45t27.5-45q9-12 19-25t21-25q11 12 21 25t19 25q15 21 27.5 45t12.5 45q0 33-23.5 56.5T760-280q-33 0-56.5-23.5ZM80 0v-160h800V0H80Z"

const strokeIconPath = "M280-120v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm160 0v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80ZM120-120v-720h720v80H200v640h-80Z"
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
</style>
