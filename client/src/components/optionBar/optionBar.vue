

<template>
  <div class="editor-toolbar">
    <div class="toolbar-main-container">
      
      <!-- Clipboard and content type navigation -->
      <div class="toolbar-left-group">
        <button class="action-button-minimal" title="Presse-papiers" type="button" @click="popupStore.openPopup()">
          <img class="icon-standard" :src="iconClipboard" alt="Aller au presse papier" />
        </button>

        <div class="toolbar-vertical-divider"></div>

        <!-- Content type tabs: text, image, shapes -->
        <nav class="content-type-nav" aria-label="Type de contenu">
          <button
            :class="['tab-item', { 'tab-item--active': activeTab === 'text' }]"
            type="button"
            @click="activeTab = 'text'"
          >
            <img class="tab-item-icon" :src="iconText" alt="Texte" />
            <span class="tab-item-label">TEXTE</span>
          </button>

          <button
            :class="['tab-item', { 'tab-item--active': activeTab === 'image' }]"
            type="button"
            @click="activeTab = 'image'"
          >
            <img class="tab-item-icon" :src="iconImage" alt="Illustration" />
            <span class="tab-item-label">IMAGE</span>
          </button>

          <button
            :class="['tab-item', { 'tab-item--active': activeTab === 'form' }]"
            type="button"
            @click="activeTab = 'form'"
          >
            <img class="tab-item-icon" :src="iconShape" alt="Formes" />
            <span class="tab-item-label">FORMES</span>
          </button>
        </nav>
      </div>

      <!-- Edit/view mode toggle and save button -->
      <div class="toolbar-right-group">
        <IconToggleGroup
          :personIcon="iconEditMode"
          :visibilityIcon="iconViewMode"
          :leftActive="!popupStore.isReaderOpen"
          :rightActive="popupStore.isReaderOpen"
          @change="handleIconChange"
        />

        <button class="save-action-button" type="button" @click="emit('save')">
          <img class="save-action-icon" :src="iconSave" alt="Enregistrer" />
          <span class="save-action-label">ENREGISTRER</span>
        </button>
      </div>

    </div>

    <!-- Contextual toolbars based on active tab -->
    <div v-if="activeTab === 'text'" class="contextual-toolbar-wrapper">
      <TextOptionBar />
    </div>
    <div v-if="activeTab === 'image'" class="contextual-toolbar-wrapper">
      <ImageOptionBar />
    </div>
    <div v-if="activeTab === 'form'" class="contextual-toolbar-wrapper">
      <ShapeOptionBar />
    </div>

  </div>
</template>

<script setup lang="ts">
// Icons for toolbar buttons
import iconClipboard from "../../assets/optionBarImage/contentPaste.svg";
import iconSave from "../../assets/optionBarImage/floppyDisk.svg";
import iconImage from "../../assets/optionBarImage/imageIcon.svg";
import iconEditMode from "../../assets/optionBarImage/personEdit.svg";
import iconText from "../../assets/optionBarImage/textField.svg";
import iconViewMode from "../../assets/optionBarImage/visibility.svg";
import iconShape from "../../assets/optionBarImage/shapeIcon.svg";

import IconToggleGroup from "./shared/iconToggleGroup.vue";
import TextOptionBar from "./text/textOptionBar.vue";
import ShapeOptionBar from "./formOptionBar.vue";
import ImageOptionBar from "./image/imageOptionBar.vue";
import { ref, watch } from 'vue'
import { usePopupStore } from '../../stores/popupStore'
import { useImageCropStore } from '../../stores/imageCropStore'
import { useShapeStore } from '../../stores/shapeStore'
import { useTextFormatStore } from '../../stores/textFormatStore'

// Active contextual toolbar tab.
const activeTab = ref<'text' | 'image' | 'form'>('text')
// Shared UI stores for popup mode and current selection context.
const popupStore = usePopupStore()
const imageCropStore = useImageCropStore()
const shapeStore = useShapeStore()
const textFormatStore = useTextFormatStore()
const emit = defineEmits<{
  save: []
}>()

// Toggle between edit and reader modes from icon group.
function handleIconChange(value: { left: boolean; right: boolean }) {
  if (value.right) {
    popupStore.openReader()
  } else {
    popupStore.closeReader()
  }
}

// Auto-switch to text tab when a text editor gets focus.
watch(() => textFormatStore.hasTextFocus, (newValue) => {
  if (newValue) {
    activeTab.value = 'text'
  }
})

// Auto-switch to image tab when an image gets selected.
watch(() => imageCropStore.selectedImageId, (newValue) => {
  if (newValue) {
    activeTab.value = 'image'
  }
})

// Auto-switch to shape tab when a shape gets selected.
watch(() => shapeStore.hasSelectedShape, (newValue) => {
  if (newValue) {
    activeTab.value = 'form'
  }
})

</script>

<style scoped>
.editor-toolbar {
  width: 100%;
  max-width: 1468px;
  height: auto;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  z-index: 999;
}

.toolbar-main-container {
  display: flex;
  justify-content: space-between;
  width: 99%;
  padding: 9px 0;
}

.toolbar-left-group {
  display: flex;
  align-items: center;
  gap: 24.5px;
}

.icon-standard {
  width: 24px;
  height: 24px;
  font-weight: lighter;
  display: block;
  filter: brightness(0);
}

.toolbar-vertical-divider {
  width: 1px;
  height: 24px;
  background-color: #d0d0d0;
}

.content-type-nav {
  display: flex;
  align-items: center;
  gap: 25px;
}


.tab-item {
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

.tab-item--active {
  color: #dc2626;
}

.tab-item--active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #dc2626;
}

.tab-item--active .tab-item-icon {
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(6329%)
    hue-rotate(357deg) brightness(92%) contrast(102%);
}

.tab-item-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.tab-item-label {
  text-transform: uppercase;
  font-family: 'Segoe UI', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1;
  text-align: center;
}

.toolbar-right-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-action-button {
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

.save-action-icon {
  width: 18px;
  height: 18px;
  filter: brightness(0) invert(1);
}

.save-action-label {
  font-family: 'Segoe UI', sans-serif;
  font-style: normal;
  font-weight: 700;
  display: flex;
  align-items: center;
  text-align: center;
}

.contextual-toolbar-wrapper {
  width: 100%;
  max-width: 1468px;
  height: auto;
  background: transparent;
  align-items: center;
  box-sizing: border-box;
  z-index: 998;
}

.action-button-minimal {
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

.action-button-minimal:hover { background: #E0E0E0; }
.action-button-minimal.active { background: rgba(220, 38, 38, 0.15); }
.action-button-minimal.active .icon-standard {
  filter: brightness(0) saturate(100%) invert(14%) sepia(88%) saturate(6329%) hue-rotate(357deg) brightness(92%) contrast(102%);
}
</style>