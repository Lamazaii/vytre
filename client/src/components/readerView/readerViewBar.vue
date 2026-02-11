<template>
    <div class="readerViewBar">
      <div class="leftSection"></div>
      <h2 class="title">Prévisualisation du mode lecteur</h2>
      <div class="rightSection">
        <div class="toogleGroupContainer">
          <IconToggleGroup
            :personIcon="personEditIcon"
            :visibilityIcon="visibilityIcon"
            :leftActive="!popupStore.isReaderOpen"
            :rightActive="popupStore.isReaderOpen"
            @change="handleToggleChange"
          />
        </div>
        <button class="closeButton" @click="handleClose" title="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    

</template>

<script setup lang="ts">
import visibilityIcon from "../../assets/optionBarImage/visibility.svg";
import personEditIcon from "../../assets/optionBarImage/personEdit.svg";
import IconToggleGroup from "../optionBar/iconToggleGroup.vue";
import { usePopupStore } from '../../stores/popupStore'

const popupStore = usePopupStore()


function handleToggleChange(value: { left: boolean; right: boolean }) {
  if (value.left) {
    popupStore.closeReader()
  }
}

function handleClose() {
  popupStore.closeReader()
}
</script>

<style scoped>

.readerViewBar {
  height: 54px;
  width: 911px;
  background-color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.leftSection {
  flex: 1;
}

.title {
  font-size: 17px;
  color: #333333;
  margin: 0;
  text-align: center;
  flex: 1;
}

.rightSection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 50px;
}

.closeButton {
  background-color: #dc2626;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #ffffff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.closeButton:hover {
  color:#333333

}

.closeButton:active {
  background-color: #bd2130;
}

</style>