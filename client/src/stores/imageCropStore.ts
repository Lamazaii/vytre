import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageCropStore = defineStore('imageCrop', () => {
  const selectedImageId = ref<string | null>(null)
  const blockIndex = ref<number | null>(null)
  const cropRequestTimestamp = ref(0)
  const isCropperOpen = ref(false)

  function selectImage(imageId: string, blockIdx: number) {
    selectedImageId.value = imageId
    blockIndex.value = blockIdx
  }

  function clearSelection() {
    selectedImageId.value = null
    blockIndex.value = null
  }

  function requestCrop() {
    cropRequestTimestamp.value = Date.now()
  }

  return {
    selectedImageId,
    blockIndex,
    cropRequestTimestamp,
    isCropperOpen,
    selectImage,
    clearSelection,
    requestCrop
  }
})
