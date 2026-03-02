import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ShapeType = 'square' | 'circle' | 'triangle' | null

export const useShapeStore = defineStore('shape', () => {
  const activeShape = ref<ShapeType>(null)
  const addShapeRequest = ref(0)
  const addImageRequest = ref(0)
  const bringImageForwardRequest = ref(0)
  const sendImageToBackRequest = ref(0)

  function setActiveShape(shape: ShapeType) {
    activeShape.value = shape
  }

  function clearActiveShape() {
    activeShape.value = null
  }

  function requestAddShape() {
    addShapeRequest.value++
  }

  function requestAddImage() {
    addImageRequest.value++
  }

  function requestBringImageForward() {
    bringImageForwardRequest.value++
  }

  function requestSendImageToBack() {
    sendImageToBackRequest.value++
  }

  return {
    activeShape,
    addShapeRequest,
    addImageRequest,
    bringImageForwardRequest,
    sendImageToBackRequest,
    setActiveShape,
    clearActiveShape,
    requestAddShape,
    requestAddImage,
    requestBringImageForward,
    requestSendImageToBack
  }
})
