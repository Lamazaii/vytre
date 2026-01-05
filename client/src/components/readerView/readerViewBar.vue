<template>
    <div class="readerViewBar">
      <div class="toogleGroupContainer">
        <IconToggleGroup
          :personIcon="personEditIcon"
          :visibilityIcon="visibilityIcon"
          :leftActive="!popupStore.isReaderOpen"
          :rightActive="popupStore.isReaderOpen"
          @change="handleToggleChange"
        />
      </div>

        <div class="SaveButtonSpacer">
          <button class="saveButton" type="button" @click="emit('save')">
                <img class="saveButtonIcon" :src="floppyDiskIcon" alt="Enregistrer" />
                <span class="saveButtonLabel" >ENREGISTRER</span>
            </button>
        </div>
    </div>

</template>

<script setup lang="ts">
import floppyDiskIcon from "../../assets/optionBarImage/floppyDisk.svg";
import visibilityIcon from "../../assets/optionBarImage/visibility.svg";
import personEditIcon from "../../assets/optionBarImage/personEdit.svg";
import IconToggleGroup from "../optionBar/iconToggleGroup.vue";
import { usePopupStore } from '../../stores/popupStore'

const popupStore = usePopupStore()
const emit = defineEmits<{
  save: []
}>()

function handleToggleChange(value: { left: boolean; right: boolean }) {
  if (value.left) {
    popupStore.closeReader()
  }
}
</script>

<style scoped>

.readerViewBar {
  height: 54px;
  width: 911px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: right;
  align-items: center;
  gap : 50px;
}

.saveButton {
  display: inline-flex;
  margin-right: 10px;
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
  font-size: 16px;
  display: flex;
  align-items: center;
  text-align: center;
}

</style>