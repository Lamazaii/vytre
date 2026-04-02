import { type Ref } from 'vue'
import { fabric } from 'fabric'

// Composable for managing layer ordering (z-index) of canvas objects
export function useLayers(
  canvasRef: Ref<fabric.Canvas | null>,
  saveCanvas: () => void,
  getSelectedImage: () => fabric.Image | null,
  getSelectedShape: () => fabric.Object | null,
  getSelectedText: () => fabric.Textbox | null
) {
  // Moves selected image one layer forward
  function bringSelectedImageForward() {
    if (!canvasRef.value) return false
    const selectedImage = getSelectedImage()
    if (!selectedImage) return false

    canvasRef.value.bringForward(selectedImage)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  // Moves selected image one layer backward
  function sendSelectedImageToBack() {
    if (!canvasRef.value) return false
    const selectedImage = getSelectedImage()
    if (!selectedImage) return false

    canvasRef.value.sendBackwards(selectedImage)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  // Moves selected shape one layer forward
  function bringSelectedShapeForward() {
    if (!canvasRef.value) return false
    const selectedShape = getSelectedShape()
    if (!selectedShape) return false

    canvasRef.value.bringForward(selectedShape)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  // Moves selected shape one layer backward
  function sendSelectedShapeToBack() {
    if (!canvasRef.value) return false
    const selectedShape = getSelectedShape()
    if (!selectedShape) return false

    canvasRef.value.sendBackwards(selectedShape)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  // Moves selected text one layer forward
  function bringSelectedTextForward() {
    if (!canvasRef.value) return false
    const selectedText = getSelectedText()
    if (!selectedText) return false

    canvasRef.value.bringForward(selectedText)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  // Moves selected text one layer backward
  function sendSelectedTextToBack() {
    if (!canvasRef.value) return false
    const selectedText = getSelectedText()
    if (!selectedText) return false

    canvasRef.value.sendBackwards(selectedText)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  return {
    bringSelectedImageForward,
    sendSelectedImageToBack,
    bringSelectedShapeForward,
    sendSelectedShapeToBack,
    bringSelectedTextForward,
    sendSelectedTextToBack,
  }
}