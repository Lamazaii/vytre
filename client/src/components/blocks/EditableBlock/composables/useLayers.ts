import { type Ref } from 'vue'
import { fabric } from 'fabric'

export function useLayers(
  canvasRef: Ref<fabric.Canvas | null>,
  saveCanvas: () => void,
  getSelectedImage: () => fabric.Image | null,
  getSelectedShape: () => fabric.Object | null,
  getSelectedText: () => fabric.Textbox | null
) {
  function bringSelectedImageForward() {
    if (!canvasRef.value) return false
    const selectedImage = getSelectedImage()
    if (!selectedImage) return false

    canvasRef.value.bringForward(selectedImage)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  function sendSelectedImageToBack() {
    if (!canvasRef.value) return false
    const selectedImage = getSelectedImage()
    if (!selectedImage) return false

    canvasRef.value.sendBackwards(selectedImage)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  function bringSelectedShapeForward() {
    if (!canvasRef.value) return false
    const selectedShape = getSelectedShape()
    if (!selectedShape) return false

    canvasRef.value.bringForward(selectedShape)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  function sendSelectedShapeToBack() {
    if (!canvasRef.value) return false
    const selectedShape = getSelectedShape()
    if (!selectedShape) return false

    canvasRef.value.sendBackwards(selectedShape)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

  function bringSelectedTextForward() {
    if (!canvasRef.value) return false
    const selectedText = getSelectedText()
    if (!selectedText) return false

    canvasRef.value.bringForward(selectedText)
    canvasRef.value.renderAll()
    saveCanvas()
    return true
  }

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