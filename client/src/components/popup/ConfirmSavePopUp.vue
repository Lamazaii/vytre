<template>
  <!-- Success confirmation modal -->
  <div v-if="isOpen" class="popup-overlay" role="dialog" aria-modal="true">
    <div class="popup-container">
      <div class="popup-header">
        <!-- Success header with icon -->
        <div class="header-content">
          <img :src="tickicon" alt="Tick icon" class="tick-icon" />
          <h2>{{ store.title }}</h2>
        </div>
        <button class="close-btn" @click="close" aria-label="Fermer">✕</button>
      </div>
      <div class="popup-body">
        <!-- Success message -->
        <p class="message">{{ message }}</p>
      </div>
      <div class="popup-footer">
        <!-- Confirm button -->
        <button class="btn btn-confirm" @click="close">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfirmSavePopupStore } from '../../stores/confirmSavePopupStore'
import tickicon from '../../assets/savePopUp/tickIcon.svg'

// Success popup store
const store = useConfirmSavePopupStore()
// Reactive popup state
const isOpen = computed(() => store.isOpen)
const message = computed(() => store.message)
const close = () => store.close()
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

.popup-container {
  background-color: #ffffff;
  border-radius: 6px;
  width: 90%;
  max-width: 420px;
  overflow: hidden;
}

.popup-header {
  background-color: #000000;
  color: white;
  height : 60px;
  width : auto;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tick-icon {
  width: 22px;
  height: 22px;
  color: green;
}

.popup-header h2 {
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover { background: rgba(255,255,255,0.16); }

.popup-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  width: auto;
  text-align: center;
  color: #111827;
}

.message {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.popup-footer {
  height : 65px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  background-color: #615a5a;
  color: white;
  transition: background-color 0.2s ease;
}

.btn:hover { background-color: #b91c1c; }
</style>
