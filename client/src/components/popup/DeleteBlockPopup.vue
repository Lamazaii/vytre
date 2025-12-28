<template>
  <div v-if="isVisible" class="popup-overlay">
    <div class="popup-container">
      <div class="popup-header">
        <button class="close-btn" @click="onCancel">✕</button>
        <div class="header-content">
          <img :src="warningIcon" alt="Warning" class="warning-icon" />
          <h2>SUPPRIMER LE BLOC ?</h2>
        </div>
      </div>
      <div class="popup-body">
        <p>Êtes-vous sûr de vouloir supprimer ce bloc ?</p>
        <p class="warning">Cette action est irréversible</p>
      </div>
      <div class="popup-footer">
        <button class="btn btn-cancel" @click="onCancel">Annuler</button>
        <button class="btn btn-confirm" @click="onConfirm">
          <img :src="trashWhite" alt="Trash" class="delete-icon" /> SUPPRIMER
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlocksStore } from '../../stores/blockStores'
import { computed } from 'vue'
import warningIcon from '../../assets/popUpDeleteBlock/warningIcon.svg'
import trashWhite from '../../assets/popUpDeleteBlock/trashWhite.svg'

const store = useBlocksStore()

const isVisible = computed(() => store.deletePopupVisible)

function onCancel() {
  store.cancelDelete()
}

function onConfirm() {
  store.confirmDelete()
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
}

.popup-header {
  background-color: #DC2626;
  color: white;
  padding: 16px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 0.8;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.warning-icon {
  width: 24px;
  height: 24px;
}

.popup-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.popup-body {
  padding: 24px 20px;
  text-align: center;
  font-size: 13px;
  color: #000000;
}

.popup-body p {
  margin: 8px 0;
}

.popup-body .warning {
  color: #ff3333;
  font-size: 12px;
}

.popup-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #333;
  min-width: 100px;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

.btn-confirm {
  background-color: #DC2626;
  color: white;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-confirm:hover {
  background-color: #b91c1c;
}

.delete-icon {
  width: 18px;
  height: 18px;
}
</style>