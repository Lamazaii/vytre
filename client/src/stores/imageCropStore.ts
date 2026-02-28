import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageCropStore = defineStore('imageCrop', () => {
  const selectedImageId = ref<string | null>(null)
  const blockIndex = ref<number | null>(null)
  const cropRequestTimestamp = ref(0)
  const isCropperOpen = ref(false)
  const imageToCropSrc = ref<string | null>(null)
  const croppedImageData = ref<string | null>(null)

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

  function openCropper(imageSrc: string) {
    imageToCropSrc.value = imageSrc
    isCropperOpen.value = true
  }

  function closeCropper() {
    isCropperOpen.value = false
    imageToCropSrc.value = null
  }

  function setCroppedImage(imageData: string) {
    croppedImageData.value = imageData
  }

  function clearCroppedImage() {
    croppedImageData.value = null
  }

  return {
    selectedImageId,
    blockIndex,
    cropRequestTimestamp,
    isCropperOpen,
    imageToCropSrc,
    croppedImageData,
    selectImage,
    clearSelection,
    requestCrop,
    openCropper,
    closeCropper,
    setCroppedImage,
    clearCroppedImage
  }
})
