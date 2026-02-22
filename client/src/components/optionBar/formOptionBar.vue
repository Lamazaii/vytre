<template>
  <div class="imageOptionBar">
    <div class="formatGroup">
      <button class="formatButton" :class="{ active: activeShape === 'square' }" @click="onSquareClick" title="Carré">
        <img :src="activeShape === 'square' ? squareIconActive : squareIcon" alt="Carré" />
        <span class="labelButton">Carré</span>
      </button>

      <button class="formatButton" :class="{ active: activeShape === 'circle' }" @click="onCircleClick" title="Rond">
        <img :src="activeShape === 'circle' ? circleIconActive : circleIcon" alt="Rond" />
        <span class="labelButton">Rond</span>
      </button>

      <button class="formatButton" :class="{ active: activeShape === 'triangle' }" @click="onTriangleClick" title="Triangle">
        <img :src="activeShape === 'triangle' ? triangleIconActive : triangleIcon" alt="Triangle" />
        <span class="labelButton">Triangle</span>
      </button>
    </div>
  </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'
import { useShapeStore } from '../../stores/shapeStore'
import squareIcon from "../../assets/imageOptionBar/square.svg"
import squareIconActive from "../../assets/imageOptionBar/squareActive.svg"
import circleIcon from "../../assets/imageOptionBar/circle.svg"
import circleIconActive from "../../assets/imageOptionBar/circleActive.svg"
import triangleIcon from "../../assets/imageOptionBar/triangle.svg"
import triangleIconActive from "../../assets/imageOptionBar/triangleActive.svg"

const shapeStore = useShapeStore()
const activeShape = ref<'square' | 'circle' | 'triangle' | null>(null)

function onSquareClick() {
  activeShape.value = 'square'
  shapeStore.setActiveShape('square')
  shapeStore.requestAddShape()

  setTimeout(() => {
    activeShape.value = null
    shapeStore.clearActiveShape()
  }, 150)
}

function onCircleClick() {
  activeShape.value = 'circle'
  shapeStore.setActiveShape('circle')
  shapeStore.requestAddShape()

  setTimeout(() => {
    activeShape.value = null
    shapeStore.clearActiveShape()
  }, 150)
}

function onTriangleClick() {
  activeShape.value = 'triangle'
  shapeStore.setActiveShape('triangle')
  shapeStore.requestAddShape()
  
  setTimeout(() => {
    activeShape.value = null
    shapeStore.clearActiveShape()
  }, 150)
}

</script>

<style scoped>
.imageOptionBar {
  display: flex;
  height: 40px;
  background-color: #F3F4F6;
  border-bottom: 0.5px solid #c2c2c2;
  box-sizing: border-box;
  padding: 0 16px;
}

.formatGroup {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: transparent;
  gap : 6px;
}

.formatButton {
  min-width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.formatButton:hover {
  background: #E0E0E0;
}

.formatButton.active {
  background: rgba(220, 38, 38, 0.15);
}


.btnLabel {
  white-space: nowrap;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 32px;
  text-align: center;
  color: #4B5563;


}

.labelButton {
  font-family: 'Segoe UI';
  font-size: 12px;
  color: #4B5563;
}

.formatButton.active .labelButton {
  color: #dc2626;
}

.formatButton img {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}


.formatImg { display:block; width:16px; height:16px; object-fit:contain }

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


</style>
