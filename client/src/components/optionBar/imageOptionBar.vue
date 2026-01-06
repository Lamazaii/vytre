<template>
  <div class="imageOptionBar">
    <div class="formatGroup">
      <button class="formatButton" :class="{ active: imageCropStore.isCropperOpen }" @click="onCropClick" title="Crop an image">
        <img :src="imageCropStore.isCropperOpen ? cropIconActive : cropIcon" alt="Crop" />
        <span class="labelButton">Rogner</span>
      </button>

      <button class="formatButton" :class="{ active: addArrow }" @click="addArrow = !addArrow" title="Add an arrow">
        <img :src="addArrow ? arrowIconActive : arrowIcon" alt="Add arrow" />
        <span class="labelButton">Ajouter une flèche</span>
      </button>

    </div>
  </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'
import { useImageCropStore } from '../../stores/imageCropStore'
import { useErrorPopupStore } from '../../stores/errorPopupStore'
import cropIcon from "../../assets/imageOptionBar/crop.svg"
import cropIconActive from "../../assets/imageOptionBar/cropActive.svg"
import arrowIcon from "../../assets/imageOptionBar/arrow.svg"
import arrowIconActive from "../../assets/imageOptionBar/arrowActive.svg"

const imageCropStore = useImageCropStore()
const errorPopupStore = useErrorPopupStore()

const addArrow = ref(false)

function onCropClick() {
  if (!imageCropStore.selectedImageId) {
    errorPopupStore.show('Veuillez sélectionner une image à rogner.')
    return
  }
  imageCropStore.requestCrop()
}

</script>

<style scoped>
.imageOptionBar {
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
}

.formatGroup {
  display: flex;
  align-items: center;
  gap: 30px;
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
  gap: 8px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 160ms ease;
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
  white-space: nowrap;
  font-family: 'Segoe UI';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: #4B5563;
}

.formatButton.active .labelButton {
  color: #dc2626;
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
