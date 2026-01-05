<template>
  <header class="header">
    <div class="headerContent">
      <div class="titleGroup">
        <img class="clipboardIcon" :src="clipboardIcon" alt="Presse-papier" />
        <h1 class="documentTitle">Presse-papier</h1>
      </div>
      <button class="closeButton" @click="$emit('close')" aria-label="Fermer">
        <span class="closeX">✕</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import clipboardIcon from "../../../assets/optionBarImage/contentPasteRed.svg";

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.header {
  background-color: #000000;
  color: rgb(255, 255, 255);
  height: 45px;
  display: flex;
  justify-content: center;
  position: relative;
  width: 500px;
}

.headerContent {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
}

.titleGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}

.closeButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  background: transparent;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
  transition: filter 0.15s ease;
}

.closeButton:hover {
  background: rgba(217, 217, 217, 0.30);
  color: #dc2626;
}

.closeButton:active {
  background: rgba(217, 217, 217, 0.20);
  color: #dc2626;
}

.closeX {
  line-height: 1;
}

.documentTitle {
  margin: 0;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 32px;
  color: #FFFFFF;
}

.titleBar {
  margin: 0 0 4px;
  font-size: 1.2em;
  font-weight: 900;
  color: #E30613;
}

.clipboardIcon {
  width: 21px;
  height: 21px;
}
</style>
