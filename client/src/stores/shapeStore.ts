import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ShapeType = 'square' | 'circle' | 'triangle' | 'arrow' | null
export type ArrowHeadStyle = 'none' | 'stroke' | 'open' | 'filled'

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
  // Tracks currently selected shape kind on canvas.
  const selectedShapeType = ref<ShapeType>(null)
  // Tracks currently chosen shape in toolbar selector.
  const toolbarShapeType = ref<ShapeType>('square')

  // Current style values for shape creation and edition.
  const fillColor = ref('#000000')
  const strokeColor = ref('#1F2937')
  const strokeWidth = ref(2)
  // Arrow-specific start/end head rendering styles.
  const arrowStartStyle = ref<ArrowHeadStyle>('stroke')
  const arrowEndStyle = ref<ArrowHeadStyle>('stroke')

  // Set selected shape preset.
  function setActiveShape(shape: ShapeType) {
    activeShape.value = shape
    toolbarShapeType.value = shape
  }

  function setToolbarShape(shape: ShapeType) {
    toolbarShapeType.value = shape
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
  function updateStylesFromSelection(
    fill: string,
    stroke: string,
    width: number,
    shapeType: ShapeType = null,
    selectedArrowStartStyle?: ArrowHeadStyle,
    selectedArrowEndStyle?: ArrowHeadStyle
  ) {
    fillColor.value = fill
    strokeColor.value = stroke
    strokeWidth.value = width
    hasSelectedShape.value = true
    selectedShapeType.value = shapeType
    if (shapeType) {
      toolbarShapeType.value = shapeType
    }
    if (selectedArrowStartStyle) {
      arrowStartStyle.value = selectedArrowStartStyle
    }
    if (selectedArrowEndStyle) {
      arrowEndStyle.value = selectedArrowEndStyle
    }
  }

  // Clear selection flag when no shape is selected.
  function clearShapeSelection() {
    hasSelectedShape.value = false
    selectedShapeType.value = null
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
    selectedShapeType,
    toolbarShapeType,
    fillColor,
    strokeColor,
    strokeWidth,
    arrowStartStyle,
    arrowEndStyle,
    setActiveShape,
    setToolbarShape,
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
