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
      <div class="organize-button-group" :class="{ disabled: !hasSelectedImage }">
        <button
          class="organize-select-button"
          type="button"
          title="Organiser"
          :disabled="!hasSelectedImage"
          @click="toggleLayerMenu"
        >
          <img class="organize-select-icon" :src="organizationIcon" alt="Organiser" />
          <span class="organize-select-label">Organiser</span>
        </button>

        <button
          class="organize-caret-button"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="isLayerMenuOpen"
          title="Afficher le menu organiser"
          :disabled="!hasSelectedImage"
          @click="toggleLayerMenu"
        >
          <span class="organize-caret" aria-hidden="true"></span>
        </button>

        <div v-if="isLayerMenuOpen && hasSelectedImage" class="layerDropdown" role="menu" aria-label="Ordre des images">
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
import flipToFrontIcon from "../../assets/optionBarImage/flip_to_front.svg"
import flipToBackIcon from "../../assets/optionBarImage/flip_to_back.svg"
import organizationIcon from "../../assets/optionBarImage/organisation.svg"
import { useImageCropStore } from '../../../stores/imageCropStore'
import { useErrorPopupStore } from '../../../stores/errorPopupStore'
import { useShapeStore } from '../../../stores/shapeStore'
import { useBlocksStore } from '../../../stores/blockStores'
import cropIcon from "../../../assets/imageOptionBar/crop.svg"
import cropIconActive from "../../../assets/imageOptionBar/cropActive.svg"
import imageIcon from "../../../assets/blockImage/imageIcon.svg"
import flipToFrontIcon from "../../../assets/optionBarImage/flip_to_front.svg"
import flipToBackIcon from "../../../assets/optionBarImage/flip_to_back.svg"
import squareIcon from "../../../assets/formOptionBar/square.svg"

const imageCropStore = useImageCropStore()
const errorPopupStore = useErrorPopupStore()
const shapeStore = useShapeStore()
const blocksStore = useBlocksStore()
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
  // Vérifier si un bloc est sélectionné
  if (blocksStore.selectedIndex === null) {
    errorPopupStore.show('Veuillez sélectionner un bloc avant d\'ajouter une image.')
    return
  }
  
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
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  gap: 6px;
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
