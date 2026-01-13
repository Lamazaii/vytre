<script setup lang="ts">
import { useBlocksStore } from '../../stores/blockStores'
import ReaderViewBlock from '../readerView/readerViewBlock.vue'
import TitleBar from '../optionBar/titleBar.vue'

const blocksStore = useBlocksStore()

const emit = defineEmits<{
  (e: 'selectMode', mode: 'editor' | 'menu'): void
}>()

</script>

<template>
  <div id="app" class="app-lector">
    <TitleBar :isReadOnly="true"/>
    <div class="readerWindowContent">
      <div class="blockHeader">
        <div class="headerNumber">N°</div>
        <div class="headerDescription">DÉTAIL DE L'OPÉRATION</div>
        <div class="headerRep">RÉP.</div>
      </div>
      <ReaderViewBlock
        v-for="block in blocksStore.blocks"
        :key="block.id"
        :numero="block.step" 
        :description="block.text"
        :modelValue="block.nbOfRepeats"
        :images="block.images"
        :textZones="block.textZones"
      />
    </div>
  </div>
</template>

<style>

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
  height: calc(772px - 54px);
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #E5E7EB;
}

.blockHeader {
  display: flex;
  justify-content: space-between;
  padding: 0px 16px 0px 35px;
  font-weight: bold;
  font-size: 14px;
  color: #545454;
  height: 54px;
  background-color: #E5E7EB;
}

.headerNumber {
  display: flex;
  align-items: center;
  justify-content: center;
}

.headerDescription {
  margin-right: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left : 60px;
}

.headerRep {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>