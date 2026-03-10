import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ShapeType = 'square' | 'circle' | 'triangle' | null

export const useShapeStore = defineStore('shape', () => {
  const activeShape = ref<ShapeType>(null)
  const addShapeRequest = ref(0)
  const addImageRequest = ref(0)
  const bringImageForwardRequest = ref(0)
  const sendImageToBackRequest = ref(0)
  const bringShapeForwardRequest = ref(0)
  const sendShapeToBackRequest = ref(0)
  const hasSelectedShape = ref(false)

  const fillColor = ref('#000000')
  const strokeColor = ref('#1F2937')
  const strokeWidth = ref(2)

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

  function requestBringShapeForward() {
    bringShapeForwardRequest.value++
  }

  function requestSendShapeToBack() {
    sendShapeToBackRequest.value++
  }

  function updateStylesFromSelection(fill: string, stroke: string, width: number) {
    fillColor.value = fill
    strokeColor.value = stroke
    strokeWidth.value = width
    hasSelectedShape.value = true
  }

  function clearShapeSelection() {
    hasSelectedShape.value = false
  }

  return {
    activeShape,
    addShapeRequest,
    addImageRequest,
    bringImageForwardRequest,
    sendImageToBackRequest,
    bringShapeForwardRequest,
    sendShapeToBackRequest,
    hasSelectedShape,
    fillColor,
    strokeColor,
    strokeWidth,
    setActiveShape,
    clearActiveShape,
    requestAddShape,
    requestAddImage,
    requestBringImageForward,
    requestSendImageToBack,
    requestBringShapeForward,
    requestSendShapeToBack,
    updateStylesFromSelection,
    clearShapeSelection
  }
})
