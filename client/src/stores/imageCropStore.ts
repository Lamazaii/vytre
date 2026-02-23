import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Pinia store to manage image cropping state
 * Handles image selection, crop requests, and cropper modal state
 */
export const useImageCropStore = defineStore('imageCrop', () => {
  // ID of the currently selected image to crop
  const selectedImageId = ref<string | null>(null)
  
  // Index of the block containing the selected image
  const blockIndex = ref<number | null>(null)
  
  // Timestamp of the last crop request (used to trigger crop operations)
  const cropRequestTimestamp = ref(0)
  
  // Flag indicating whether the cropper modal is currently open
  const isCropperOpen = ref(false)
  
  // Source URL or base64 string of the image to be cropped
  const imageToCropSrc = ref<string | null>(null)

  /**
   * Selects an image for cropping
   * @param imageId - Unique identifier of the image
   * @param blockIdx - Index of the block containing the image
   */
  function selectImage(imageId: string, blockIdx: number) {
    selectedImageId.value = imageId
    blockIndex.value = blockIdx
  }

  /**
   * Clears the current image selection
   */
  function clearSelection() {
    selectedImageId.value = null
    blockIndex.value = null
  }

  /**
   * Requests a crop operation by updating the timestamp
   * This triggers reactivity in components watching this value
   */
  function requestCrop() {
    cropRequestTimestamp.value = Date.now()
  }

  /**
   * Opens the cropper modal with the specified image source
   * @param imageSrc - URL or base64 string of the image to crop
   */
  function openCropper(imageSrc: string) {
    imageToCropSrc.value = imageSrc
    isCropperOpen.value = true
  }

  /**
   * Closes the cropper modal and clears the image source
   */
  function closeCropper() {
    isCropperOpen.value = false
    imageToCropSrc.value = null
  }

  return {
    selectedImageId,
    blockIndex,
    cropRequestTimestamp,
    isCropperOpen,
    imageToCropSrc,
    selectImage,
    clearSelection,
    requestCrop,
    openCropper,
    closeCropper
  }
})
