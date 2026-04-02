<template>
  <!-- Image cropper modal - only displays if isOpen and imageSrc are defined -->
  <div v-if="isOpen && imageSrc" class="cropper-modal-overlay">
    <!-- Main cropper card - @click.stop prevents closing on click -->
    <div class="cropper-card" @click.stop>
      
      <!-- Header with title and close button -->
      <div class="cropper-header">
        <div class="cropper-title-group">
          <img :src="cropIconActive" alt="Rogner" class="cropper-title-icon" />
          <h3 class="cropper-title">Rogner l'image</h3>
        </div>
        <button class="cropper-close-button" @click="handleClose" aria-label="Fermer">✕</button>
      </div>

      <!-- Modal body containing the cropping component -->
      <div class="cropper-body">
        <div class="cropper-engine-wrapper">
          <!-- 
            vue-advanced-cropper component 
            - src: source image to crop
            - stencil-props: selection area configuration (free aspect ratio)
            - min/max: size constraints for selection area
          -->
          <cropper
            ref="cropperRef"
            class="cropper-engine"
            :src="imageSrc"
            :stencil-props="{ aspectRatio: null }"
            :min-width="50"
            :min-height="50"
            :max-width="10000"
            :max-height="10000"
          />
        </div>
      </div>

      <!-- Visual separator between body and footer -->
      <div class="cropper-separator"></div>

      <!-- Footer with action buttons -->
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

// Image cropper store
const imageCropStore = useImageCropStore()

// Modal visibility
const isOpen = computed(() => imageCropStore.isCropperOpen)

// Current image source to crop
const imageSrc = computed(() => {
  return imageCropStore.imageToCropSrc || null
})

const emit = defineEmits(['crop', 'close'])

// Cropper instance reference
const cropperRef = ref<any>(null)
  
// Close popup
function handleClose() {
  imageCropStore.isCropperOpen = false
  emit('close')
}

// Confirm crop and convert canvas to base64
function handleConfirm() {
  if (cropperRef.value) {
    // Get cropped canvas result
    const { canvas } = cropperRef.value.getResult()
    
    if (canvas) {
      // Convert to PNG format (preserves transparency)
      const croppedImage = canvas.toDataURL('image/png')
      
      // Emit cropped image to parent
      emit('crop', croppedImage)
      
      // Close popup
      handleClose()
    }
  }
}
</script>

<style scoped>
.cropper-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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
  /* Damier de transparence pour visualiser les zones transparentes */
  background-image: 
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #ffffff;
}

/* Force le fond blanc pour le cropper (override les styles de vue-advanced-cropper) */
.cropper-engine :deep(.vue-advanced-cropper__background),
.cropper-engine :deep(.vue-advanced-cropper__foreground) {
  background: #ffffff !important;
}

/* Applique le motif damier au background du cropper */
.cropper-engine :deep(.vue-advanced-cropper__background) {
  background-image: 
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%) !important;
  background-size: 20px 20px !important;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px !important;
  background-color: #ffffff !important;
}

/* Personnalisation du sélecteur (zone de crop) */
.cropper-engine :deep(.vue-rectangle-stencil__preview) {
  border: 2px solid #dc2626 !important;
}

/* Coins du sélecteur (handlers) */
.cropper-engine :deep(.vue-simple-handler) {
  background: #dc2626 !important;
  border: 2px solid #ffffff !important;
  width: 12px !important;
  height: 12px !important;
}

/* Lignes de guides */
.cropper-engine :deep(.vue-simple-line) {
  border-color: #dc2626 !important;
}

/* Hover sur les handlers */
.cropper-engine :deep(.vue-simple-handler:hover) {
  background: #b91c1c !important;
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
