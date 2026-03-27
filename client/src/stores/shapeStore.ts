import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ShapeType = 'square' | 'circle' | 'triangle' | 'text' | null

export const useShapeStore = defineStore('shape', () => {
  // Currently selected shape type from toolbar.
  const activeShape = ref<ShapeType>(null)
  // Counter-based signals observed by block/canvas watchers.
  const addShapeRequest = ref(0)
  const addImageRequest = ref(0)
  const bringImageForwardRequest = ref(0)
  const sendImageToBackRequest = ref(0)
  const bringShapeForwardRequest = ref(0)
  const sendShapeToBackRequest = ref(0)
  // True when a shape is selected on active canvas.
  const hasSelectedShape = ref(false)

  // Current style values for shape creation and edition.
  const fillColor = ref('#000000')
  const strokeColor = ref('#1F2937')
  const strokeWidth = ref(2)

  // Set selected shape preset.
  function setActiveShape(shape: ShapeType) {
    activeShape.value = shape
  }

  // Clear selected shape preset.
  function clearActiveShape() {
    activeShape.value = null
  }

  // Trigger one shape creation request.
  function requestAddShape() {
    addShapeRequest.value++
  }

  // Trigger one image insertion request.
  function requestAddImage() {
    addImageRequest.value++
  }

  // Trigger forward layer request for selected image.
  function requestBringImageForward() {
    bringImageForwardRequest.value++
  }

  // Trigger backward layer request for selected image.
  function requestSendImageToBack() {
    sendImageToBackRequest.value++
  }

  // Trigger forward layer request for selected shape.
  function requestBringShapeForward() {
    bringShapeForwardRequest.value++
  }

  // Trigger backward layer request for selected shape.
  function requestSendShapeToBack() {
    sendShapeToBackRequest.value++
  }

  // Sync toolbar style values from selected shape object.
  function updateStylesFromSelection(fill: string, stroke: string, width: number) {
    fillColor.value = fill
    strokeColor.value = stroke
    strokeWidth.value = width
    hasSelectedShape.value = true
  }

  // Clear selection flag when no shape is selected.
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
