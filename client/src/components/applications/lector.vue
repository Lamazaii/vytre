<script setup lang="ts">
import { useBlocksStore } from '../../stores/blockStores'
import ReaderViewBlock from '../readerView/readerViewBlock.vue'
import TitleBar from '../optionBar/shared/titleBar.vue'

const blocksStore = useBlocksStore()

const emit = defineEmits<{
  (e: 'selectMode', mode: 'editor' | 'menu'): void
}>()

function handleHome() {
  emit('selectMode', 'menu')
}

</script>

<template>
  <div id="app" class="app-lector">
    <TitleBar :isReadOnly="true" @home="handleHome"/>
    <div class="readerWindowContent">
      <div class="blockHeader">
        <div class="headerNumber">N°</div>
        <div class="headerDescription">DÉTAIL DE L'OPÉRATION</div>
      </div>
      <ReaderViewBlock
        v-for="block in blocksStore.blocks"
        :key="block.id"
        :numero="block.step" 
        :description="block.text"
        :modelValue="block.nbOfRepeats"
        :images="block.images"
        :textZones="block.textZones"
        :canvasData="block.canvasData"
      />
    </div>
  </div>
</template>

<style>
@import '../../assets/styles/readerShared.css';

.readerViewBar {
  height: 54px;
  width: 911px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: right;
  align-items: center;
  gap: 50px;
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

.readerWindowContent {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #E5E7EB;
}
</style>