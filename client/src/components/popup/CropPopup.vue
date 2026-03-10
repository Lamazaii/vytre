<template>
  <!-- Crop modal overlay - only displays if isOpen and imageSrc are defined -->
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
            - ref: reference to access cropping result
            - src: source image to crop
            - stencil-props: selection area configuration (aspectRatio: null = free ratio)
            - min/max width/height: size constraints for the selection area
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

// Pinia store to manage crop popup state.
const imageCropStore = useImageCropStore()

// Reactive modal visibility from the store.
const isOpen = computed(() => imageCropStore.isCropperOpen)

// Current image source to crop (URL or base64).
const imageSrc = computed(() => {
  return imageCropStore.imageToCropSrc || null
})

// Events emitted to parent when crop is confirmed or popup closed.
const emit = defineEmits(['crop', 'close'])

// Cropper instance ref used to read crop result.
const cropperRef = ref<any>(null)
  
/**
 * Closes the crop popup
 * - Updates state in the store
 * - Emits 'close' event to parent
 */
function handleClose() {
  imageCropStore.isCropperOpen = false
  emit('close')
}

/**
 * Confirms the crop and generates the cropped image
 * 1. Retrieves the cropper result via getResult()
 * 2. Extracts the canvas containing the cropped image
 * 3. Converts the canvas to base64 via toDataURL()
 * 4. Emits the cropped image to the parent component
 * 5. Closes the popup
 */
function handleConfirm() {
  if (cropperRef.value) {
    // getResult() returns an object with canvas and crop coordinates
    const { canvas } = cropperRef.value.getResult()
    
    if (canvas) {
      // Converts canvas to base64 format (data:image/png;base64,...)
      const croppedImage = canvas.toDataURL()
      
      // Sends cropped image to parent component (typically EditableBlock)
      emit('crop', croppedImage)
      
      // Closes popup after confirmation
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
