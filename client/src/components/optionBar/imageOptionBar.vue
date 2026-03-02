<template>
  <div class="imageOptionBar">
    <div class="formatGroup">
      <button class="formatButton" @click="onAddImageClick" title="Ajouter une image">
        <img :src="imageIcon" alt="Ajouter" />
        <span class="labelButton">Ajouter</span>
      </button>
    </div>
    <div class="formatGroup">
      <button
        class="formatButton cropButton"
        :class="{ active: hasSelectedImage && imageCropStore.isCropperOpen }"
        @click="onCropClick"
        title="Rogner une image"
        :disabled="!hasSelectedImage"
      >
        <img :src="imageCropStore.isCropperOpen ? cropIconActive : cropIcon" alt="Crop" />
        <span class="labelButton">Rogner</span>
      </button>
    </div>

    <div class="formatGroup layerGroup">
      <button
        class="burgerButton"
        :class="{ isEnabled: hasSelectedImage }"
        @click="toggleLayerMenu"
        :aria-expanded="isLayerMenuOpen"
        aria-haspopup="menu"
        title="Organiser"
        type="button"
        :disabled="!hasSelectedImage"
      >
        <img class="burgerLogo" :src="organisationIcon" alt="Organiser" />
        <span class="labelButton">Organiser</span>
      </button>

      <div v-if="isLayerMenuOpen && hasSelectedImage" class="layerDropdown" role="menu" aria-label="Ordre des images">
        <button class="layerMenuItem" @click="onBringForwardMenuClick" title="Avancer" type="button">
          <span class="layerIcon layerIcon--forward" aria-hidden="true"></span>
          <span class="layerMenuLabel">Avancer</span>
        </button>

        <button class="layerMenuItem" @click="onSendToBackMenuClick" title="Reculer" type="button">
          <span class="layerIcon layerIcon--backward" aria-hidden="true"></span>
          <span class="layerMenuLabel">Reculer</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useImageCropStore } from '../../stores/imageCropStore'
import { useErrorPopupStore } from '../../stores/errorPopupStore'
import { useShapeStore } from '../../stores/shapeStore'
import cropIcon from "../../assets/imageOptionBar/crop.svg"
import cropIconActive from "../../assets/imageOptionBar/cropActive.svg"
import imageIcon from "../../assets/blockImage/imageIcon.svg"
import organisationIcon from "../../assets/optionBarImage/organisation.svg"

const imageCropStore = useImageCropStore()
const errorPopupStore = useErrorPopupStore()
const shapeStore = useShapeStore()
const isLayerMenuOpen = ref(false)
const hasSelectedImage = computed(() => Boolean(imageCropStore.selectedImageId))

function toggleLayerMenu() {
  if (!hasSelectedImage.value) {
    return
  }

  isLayerMenuOpen.value = !isLayerMenuOpen.value
}

function closeLayerMenu() {
  isLayerMenuOpen.value = false
}

watch(hasSelectedImage, (isSelected) => {
  if (!isSelected) {
    closeLayerMenu()
  }
})

function onAddImageClick() {
  shapeStore.requestAddImage()
}

function onCropClick() {
  if (!imageCropStore.selectedImageId) {
    errorPopupStore.show('Veuillez sélectionner une image à rogner.')
    return
  }
  imageCropStore.requestCrop()
}

function onBringForwardClick() {
  if (!imageCropStore.selectedImageId) {
    errorPopupStore.show('Veuillez sélectionner une image à avancer.')
    return
  }
  shapeStore.requestBringImageForward()
}

function onBringForwardMenuClick() {
  onBringForwardClick()
}

function onSendToBackClick() {
  if (!imageCropStore.selectedImageId) {
    errorPopupStore.show('Veuillez sélectionner une image à reculer.')
    return
  }
  shapeStore.requestSendImageToBack()
}

function onSendToBackMenuClick() {
  onSendToBackClick()
}

</script>

<style scoped>
.imageOptionBar {
  display: flex;
  height: 40px;
  background-color: #F3F4F6;
  border-bottom: 0.5px solid #c2c2c2;
  box-sizing: border-box;
  padding: 0 8px;
  align-items: center;
}

.formatGroup {
  display: flex;
  align-items: center;
  padding: 0 4px;
  background: transparent;
}

.layerGroup {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 6px;
}

.burgerButton {
  min-width: 92px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  padding: 0 8px;
  cursor: pointer;
  color: #6B7280;
  transition: background-color 160ms ease;
}

.burgerButton:hover,
.burgerButton[aria-expanded='true'] {
  background: #ffffff;
}

.burgerButton:disabled {
  cursor: not-allowed;
}

.burgerButton:disabled:hover {
  background: transparent;
}

.burgerButton .labelButton {
  color: #9CA3AF;
}

.burgerButton.isEnabled {
  color: #4B5563;
}

.burgerButton.isEnabled .labelButton {
  color: #4B5563;
}

.burgerLogo {
  width: 16px;
  height: 16px;
  display: block;
  object-fit: contain;
  filter: grayscale(1) brightness(0.65);
}

.burgerButton.isEnabled .burgerLogo {
  filter: grayscale(1) brightness(0);
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
  background: #ffffff;
}

.cropButton:not(:disabled):not(.active) img {
  filter: grayscale(1) brightness(0);
}

.formatButton:disabled {
  cursor: not-allowed;
}

.formatButton:disabled:hover {
  background: transparent;
}

.formatButton:disabled .labelButton {
  color: #9CA3AF;
}

.formatButton:disabled img {
  filter: grayscale(1) brightness(0.7);
  opacity: 0.55;
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

.layerDropdown {
  position: static;
  width: auto;
  display: flex;
  flex-direction: row;
  gap: 6px;
  background: transparent;
}

.layerMenuItem {
  min-width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.layerMenuItem:hover {
  background: #ffffff;
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

.layerIcon {
  position: relative;
  width: 8px;
  height: 8px;
  display: inline-block;
}

.layerIcon::before,
.layerIcon::after {
  content: '';
  position: absolute;
  border: 1px solid #000000;
  background: transparent;
}

.layerIcon--forward::before {
  width: 5px;
  height: 3px;
  left: 0px;
  top: 4px;
}

.layerIcon--forward::after {
  width: 5px;
  height: 3px;
  left: 2px;
  top: 1px;
}

.layerIcon--backward::before {
  width: 5px;
  height: 3px;
  left: 2px;
  top: 4px;
}

.layerIcon--backward::after {
  width: 5px;
  height: 3px;
  left: 0px;
  top: 1px;
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
