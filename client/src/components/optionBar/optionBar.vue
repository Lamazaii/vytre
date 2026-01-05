<template>
  <header class="optionBar">
    <div class="optionBarStart">

      <button class="clipboardButton" title="Presse-papiers" type="button" @click="popupStore.openPopup()">
        <img class="optionBarIcon" :src="clipBoardIcon" alt="Aller au presse papier" />
      </button>

      <div class="optionBarSeparator"></div>

      <nav class="optionBarTabs" aria-label="Type de contenu">
        <button
          :class="['tabButton', { tabButtonActive: activeTab === 'text' }]"
          type="button"
          @click="activeTab = 'text'"
        >
          <img class="tabButtonIcon" :src="textIcon" alt="Texte" />
          <span class="tabButtonLabel">TEXTE</span>
        </button>

        <button
          :class="['tabButton', { tabButtonActive: activeTab === 'image' }]"
          type="button"
          @click="activeTab = 'image'"
        >
          <img class="tabButtonIcon" :src="imageIcon" alt="Illustration" />
          <span class="tabButtonLabel">IMAGE</span>
        </button>
      </nav>

    </div>


    <div class="optionBarActions">

      <IconToggleGroup
        :personIcon="personEditIcon"
        :visibilityIcon="visibilityIcon"
        :leftActive="!popupStore.isReaderOpen"
        :rightActive="popupStore.isReaderOpen"
        @change="handleIconChange"
      />

      <button class="saveButton" type="button" @click="emit('save')">
        <img class="saveButtonIcon" :src="floppyDiskIcon" alt="Enregistrer" />
        <span class="saveButtonLabel" >ENREGISTRER</span>
      </button>

    </div>
    
    <div v-if="activeTab === 'text'" class="optionsWrapper">
      <TextOptionBar />
    </div>
    <div v-if="activeTab === 'image'" class="optionsWrapper">
      <ImageOptionBar />
    </div>
  </header>
</template>

<script setup lang="ts">
import clipBoardIcon from "../../assets/optionBarImage/contentPaste.svg";
import floppyDiskIcon from "../../assets/optionBarImage/floppyDisk.svg";
import imageIcon from "../../assets/optionBarImage/imageIcon.svg";
import personEditIcon from "../../assets/optionBarImage/personEdit.svg";
import textIcon from "../../assets/optionBarImage/textField.svg";
import visibilityIcon from "../../assets/optionBarImage/visibility.svg";
import IconToggleGroup from "./iconToggleGroup.vue";
import TextOptionBar from "./textOptionBar.vue";
import ImageOptionBar from "./imageOptionBar.vue";
import { ref } from 'vue'
import { usePopupStore } from '../../stores/popupStore'

const activeTab = ref<'text' | 'image'>('text')
const popupStore = usePopupStore()
const emit = defineEmits<{
  save: []
}>()

function handleIconChange(value: { left: boolean; right: boolean }) {
  if (value.right) {
    popupStore.openReader()
  } else {
    popupStore.closeReader()
  }
}

</script>

<style scoped>
.optionBar {
  position: fixed;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1468px;
  height: 54px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 10px;
  box-sizing: border-box;
  z-index: 999;
}

.optionBarStart {
  display: flex;
  align-items: center;
  gap: 24.5px;
}

.optionBarIcon {
  width: 24px;
  height: 24px;
  font-weight: lighter;
  display: block;
  filter: brightness(0);
}

.optionBarSeparator {
  width: 1px;
  height: 24px;
  background-color: #d0d0d0;
}

.optionBarTabs {
  display: flex;
  align-items: center;
  gap: 25px;
}

.tabButton {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: #000000;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0;
  position: relative;
  cursor: pointer;
  transition: color 0.2s ease;
}

.tabButtonActive {
  color: #dc2626;
}

.tabButtonActive::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #dc2626;
}

.tabButtonActive .tabButtonIcon {
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(6329%)
    hue-rotate(357deg) brightness(92%) contrast(102%);
}

.tabButtonIcon {
  width: 20px;
  height: 20px;
  display: block;
}

.tabButtonLabel {
  text-transform: uppercase;
  font-family: 'Segoe UI', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1;
  text-align: center;
}

.optionBarActions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.iconButton {
  width: 36px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: not-allowed;
  padding: 0;
}

.iconButtonIcon {
  width: 18px;
  height: 18px;
  opacity: 0.5;
}

.saveButton {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.4px;
  cursor: pointer;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
  transition: filter 0.15s ease;
}

.saveButtonIcon {
  width: 18px;
  height: 18px;
  filter: brightness(0) invert(1);
}

.saveButtonLabel {
  font-family: 'Segoe UI', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 1;
  display: flex;
  align-items: center;
  text-align: center;
}

.optionsWrapper {
  position: fixed;
  top: 54px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1468px;
  height: auto;
  background: transparent;
  align-items: center;
  box-sizing: border-box;
  z-index: 998;
}


.clipboardButton {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  transition: background-color 160ms ease;
}

.clipboardButton:hover { background: #E0E0E0; }
.clipboardButton.active { background: rgba(220, 38, 38, 0.15); }
.clipboardButton.active .optionBarIcon {
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(6329%) hue-rotate(357deg) brightness(92%) contrast(102%);
}
</style>
