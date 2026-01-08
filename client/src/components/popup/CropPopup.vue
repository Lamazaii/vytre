<template>
  <div v-if="isOpen && imageSrc" class="cropper-modal-overlay">
    <div class="cropper-card" @click.stop>
      <header class="cropper-header">
        <div class="cropper-title-group">
          <img :src="cropIconActive" alt="Rogner" class="cropper-title-icon" />
          <h3 class="cropper-title">Rogner l'image</h3>
        </div>
        <button class="cropper-close-button" @click="handleClose" aria-label="Fermer">✕</button>
      </header>
      <div class="cropper-body">
        <div class="cropper-engine-wrapper">
          <cropper
            ref="cropperRef"
            class="cropper-engine"
            :src="imageSrc"
            :stencil-props="{ aspectRatio: null }"
          />
        </div>
      </div>
      <div class="cropper-separator"></div>
      <footer class="cropper-footer">
        <button class="cropper-ghost-button" @click="handleClose">Annuler</button>
        <button class="cropper-primary-button" @click="handleConfirm">CONFIRMER</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageCropStore } from '../../stores/imageCropStore'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import cropIconActive from '../../assets/imageOptionBar/cropActive.svg'

const imageCropStore = useImageCropStore()
const cropperRef = ref<any>(null)

const isOpen = computed(() => imageCropStore.isCropperOpen)
const imageSrc = computed(() => {
  // fourni par le store ou via props
  return imageCropStore.imageToCropSrc || null
})

const emit = defineEmits(['crop', 'close'])

function handleClose() {
  imageCropStore.isCropperOpen = false
  emit('close')
}

function handleConfirm() {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult()
    if (canvas) {
      const croppedImage = canvas.toDataURL()
      emit('crop', croppedImage)
      handleClose()
    }
  }
}
</script>

<style scoped>
.cropper-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

.cropper-card {
  width: 600px;
  background: #f2f3f6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cropper-header {
  height: 45px;
  background: #0b0b0b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.cropper-title-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cropper-title-icon {
  width: 22px;
  height: 22px;
}

.cropper-title {
  margin: 0;
  font-size: 18px;
  font-weight: 300;
  font-family: 'Segoe UI', sans-serif;
}

.cropper-close-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
}

.cropper-close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.cropper-body {
  padding: 20px;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-engine-wrapper {
  width: 100%;
  max-width: 560px;
}

.cropper-engine {
  height: 400px;
  width: 100%;
  background: #eee;
}

.cropper-separator {
  height: 2px;
  background: #d1d5db;
  width: 560px;
  margin: 0 auto;
}

.cropper-footer {
  width: 560px;
  display: flex;
  margin: 0 auto;
  padding: 16px 0;
  justify-content: flex-end;
  gap: 12px;
}

.cropper-ghost-button {
  border: none;
  background: transparent;
  color: #6b6b6b;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 10px;
}

.cropper-ghost-button:hover {
  text-decoration: underline;
}

.cropper-primary-button {
  border: none;
  background: #dc2626;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
}

.cropper-primary-button:hover {
  filter: brightness(0.95);
}

.cropper-primary-button:active {
  filter: brightness(0.9);
}
</style>
