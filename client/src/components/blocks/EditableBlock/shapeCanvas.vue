<template>
  <div class="shapeCanvasWrapper">
    <canvas ref="canvasElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { fabric } from 'fabric'
import { useImageCropStore } from '../../../stores/imageCropStore'
import { useShapeStore } from '../../../stores/shapeStore'
import { useTextFormatStore } from '../../../stores/textFormatStore'
import { objectDefaults } from './utils/canvasConfig'
import { createDeleteControl, deleteSelectedObjects } from './utils/canvasControls'
import { handleObjectMoving, handleObjectScaling } from './utils/canvasConstraints'

interface Props {
  width?: number
  height?: number
  blockIndex?: number
  canvasData?: string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 700,
  height: 400,
  active: false
})

const emit = defineEmits<{
  'update:canvasData': [data: string]
  'modified': [value: boolean]
  'update:hasObjects': [value: boolean]
}>()

// Canvas DOM reference and Fabric instance.
const canvasElement = ref<HTMLCanvasElement | null>(null)
let canvas: fabric.Canvas | null = null
// Shared stores for cross-toolbar selection and formatting sync.
const imageCropStore = useImageCropStore()
const shapeStore = useShapeStore()
const textFormatStore = useTextFormatStore()

// Handle delete/backspace shortcuts when canvas is active.
function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  if (!props.active) return

  const target = event.target as HTMLElement | null
  if (target) {
    const tagName = target.tagName
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
  }

  deleteSelectedObjects(canvas)
}

// Persist canvas JSON and notify parent state.
function saveCanvas() {
  if (!canvas) return
  const json = JSON.stringify(canvas.toJSON())
  emit('update:canvasData', json)
  emit('modified', true)
  checkHasObjects()
}

// Notify parent whether canvas contains at least one object.
function checkHasObjects() {
  if (!canvas) return
  const objectCount = canvas.getObjects().length
  emit('update:hasObjects', objectCount > 0)
}

// Factory for shape creation using current toolbar style values.
function createShape(type: 'rect' | 'circle' | 'triangle') {
  if (!canvas) return

  const canvasWidth = canvas.width || props.width
  const canvasHeight = canvas.height || props.height
  let shape: fabric.Object

  if (type === 'rect') {
    const size = 100
    shape = new fabric.Rect({
      left: (canvasWidth - size) / 2,
      top: (canvasHeight - size) / 2,
      width: size,
      height: size,
      fill: shapeStore.fillColor,
      stroke: shapeStore.strokeColor,
      strokeWidth: shapeStore.strokeWidth,
      ...objectDefaults
    })
  } else if (type === 'circle') {
    const radius = 50
    shape = new fabric.Circle({
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      radius: radius,
      fill: shapeStore.fillColor,
      stroke: shapeStore.strokeColor,
      strokeWidth: shapeStore.strokeWidth,
      originX: 'center',
      originY: 'center',
      ...objectDefaults
    })
  } else {
    const size = 100
    shape = new fabric.Triangle({
      left: (canvasWidth - size) / 2,
      top: (canvasHeight - size) / 2,
      width: size,
      height: size,
      fill: shapeStore.fillColor,
      stroke: shapeStore.strokeColor,
      strokeWidth: shapeStore.strokeWidth,
      ...objectDefaults
    })
  }

  canvas.add(shape)
  canvas.setActiveObject(shape)
  canvas.renderAll()
}

// Public helpers exposed to parent component.
function addSquare() {
  createShape('rect')
}

function addCircle() {
  createShape('circle')
}

function addTriangle() {
  createShape('triangle')
}

// Insert an editable text object centered in the drawing area.
function addTextZone() {
  if (!canvas) return

  const canvasWidth = canvas.width || props.width
  const canvasHeight = canvas.height || props.height
  const text = new fabric.Textbox('Nouvelle zone de texte', {
    left: 0,
    top: 0,
    width: Math.min(280, Math.max(180, canvasWidth - 40)),
    fontSize: 18,
    fill: '#111827',
    fontFamily: 'Arial',
    lockScalingY: true,
    ...objectDefaults,
  })

  const textWidth = (text.width || 0) * (text.scaleX || 1)
  const textHeight = (text.height || 0) * (text.scaleY || 1)
  text.set({
    left: Math.max(0, (canvasWidth - textWidth) / 2),
    top: Math.max(0, (canvasHeight - textHeight) / 2),
  })

  canvas.add(text)
  handleObjectMoving(text, canvasWidth, canvasHeight)
  text.setCoords()
  canvas.setActiveObject(text)
  text.enterEditing()
  text.selectAll()
  canvas.renderAll()
}

// Keep text visual size fixed by converting scale into width.
function normalizeTextboxScale(textbox: fabric.Textbox) {
  const currentScaleX = textbox.scaleX || 1
  const baseWidth = textbox.width || 0
  if (currentScaleX !== 1 && baseWidth > 0) {
    textbox.set({
      width: Math.max(60, baseWidth * currentScaleX),
      scaleX: 1,
    })
  }

  if ((textbox.scaleY || 1) !== 1) {
    textbox.set({ scaleY: 1 })
  }

  textbox.setCoords()
}

// Insert image object and fit it inside the canvas bounds.
function addImage(imageSrc: string) {
  if (!canvas) return

  fabric.Image.fromURL(imageSrc, (img) => {
    if (!canvas) return

    const canvasWidth = canvas.width || props.width
    const canvasHeight = canvas.height || props.height

    const maxSize = 300
    const scale = Math.min(
      maxSize / (img.width || 1),
      maxSize / (img.height || 1),
      1 
    )

    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    img.set({
      left: (canvasWidth - (img.width || 0) * scale) / 2,
      top: (canvasHeight - (img.height || 0) * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      crossOrigin: 'anonymous',
      ...objectDefaults
    })

    ;(img as any).imageId = imageId
    ;(img as any).originalSrc = imageSrc

    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.renderAll()
  })
}

// Return active image object when selection is an image.
function getSelectedImage() {
  if (!canvas) return null
  const activeObject = canvas.getActiveObject()
  if (activeObject && activeObject.type === 'image') {
    return activeObject as fabric.Image
  }
  return null
}

// Return active shape object when selection is a shape.
function getSelectedShape() {
  if (!canvas) return null
  const activeObject = canvas.getActiveObject()
  if (activeObject && (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle')) {
    return activeObject as fabric.Object
  }
  return null
}

// Replace selected image while preserving transform values.
function replaceSelectedImage(newImageSrc: string) {
  const selectedImage = getSelectedImage()
  if (!selectedImage || !canvas) return

  const imageId = (selectedImage as any).imageId
  const currentProps = {
    left: selectedImage.left,
    top: selectedImage.top,
    scaleX: selectedImage.scaleX,
    scaleY: selectedImage.scaleY,
    angle: selectedImage.angle
  }

  fabric.Image.fromURL(newImageSrc, (newImg) => {
    if (!canvas) return

    newImg.set({
      ...currentProps,
      crossOrigin: 'anonymous',
      ...objectDefaults
    })

    ;(newImg as any).imageId = imageId
    ;(newImg as any).originalSrc = newImageSrc

    canvas.remove(selectedImage)
    canvas.add(newImg)
    canvas.setActiveObject(newImg)
    canvas.renderAll()
  })
}

// Move selected image one step forward in object stack.
function bringSelectedImageForward() {
  if (!canvas) return false
  const selectedImage = getSelectedImage()
  if (!selectedImage) return false

  canvas.bringForward(selectedImage)
  canvas.renderAll()
  saveCanvas()
  return true
}

// Move selected image one step backward in object stack.
function sendSelectedImageToBack() {
  if (!canvas) return false
  const selectedImage = getSelectedImage()
  if (!selectedImage) return false

  canvas.sendBackwards(selectedImage)
  canvas.renderAll()
  saveCanvas()
  return true
}

// Move selected shape one step forward in object stack.
function bringSelectedShapeForward() {
  if (!canvas) return false
  const selectedShape = getSelectedShape()
  if (!selectedShape) return false

  canvas.bringForward(selectedShape)
  canvas.renderAll()
  saveCanvas()
  return true
}

// Move selected shape one step backward in object stack.
function sendSelectedShapeToBack() {
  if (!canvas) return false
  const selectedShape = getSelectedShape()
  if (!selectedShape) return false

  canvas.sendBackwards(selectedShape)
  canvas.renderAll()
  saveCanvas()
  return true
}

// Sync selection context (image vs shape) with corresponding stores.
function handleSelection(e: any) {
  const selected = e.selected?.[0]
  if (selected && selected.type === 'image') {
    const imageId = (selected as any).imageId || selected.cacheKey
    if (imageId && props.blockIndex !== undefined) {
      imageCropStore.selectImage(imageId, props.blockIndex)
    }
    textFormatStore.clearTextFocus()
  } else if (selected && selected.type === 'textbox') {
    // Activate text formatting toolbar for Fabric textbox with multi-style support
    textFormatStore.setFabricTextbox(selected as fabric.Textbox, canvas)
    imageCropStore.clearSelection()
  } else if (selected && (selected.type === 'rect' || selected.type === 'circle' || selected.type === 'triangle')) {
    // Keep toolbar controls in sync with selected shape style.
    const fill = selected.fill || '#000000'
    const stroke = selected.stroke || '#1F2937'
    const strokeWidth = selected.strokeWidth || 2
    shapeStore.updateStylesFromSelection(fill as string, stroke as string, strokeWidth as number)
    imageCropStore.clearSelection()
    textFormatStore.clearTextFocus()
  } else {
    imageCropStore.clearSelection()
    textFormatStore.clearTextFocus()
  }
}

// Clear shape/image selection state when selection is removed.
function handleSelectionCleared() {
  imageCropStore.clearSelection()
  shapeStore.clearShapeSelection()
  textFormatStore.setFabricTextbox(null, null)
}

// Keep text toolbar state synced while editing a Fabric textbox.
function handleTextboxStateUpdate(e: any) {
  const target = e?.target as fabric.Object | undefined
  if (!target || target.type !== 'textbox') return
  textFormatStore.updateFabricStatesFromObject(target as fabric.Textbox)
}

// Initialize Fabric canvas, events, and optional JSON restore.
onMounted(() => {
  if (!canvasElement.value) return

  canvas = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    selection: props.active,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
  })

  fabric.Object.prototype.controls.deleteControl = createDeleteControl()
  fabric.ActiveSelection.prototype.controls.deleteControl = createDeleteControl()
  fabric.Textbox.prototype.controls.deleteControl = createDeleteControl()

  canvas.on('object:added', saveCanvas)
  canvas.on('object:modified', saveCanvas)
  canvas.on('object:removed', saveCanvas)

  canvas.on('object:moving', (e) => {
    const obj = e.target
    if (!obj || !canvas) return

    const canvasWidth = canvas.width || props.width
    const canvasHeight = canvas.height || props.height

    handleObjectMoving(obj, canvasWidth, canvasHeight)
  })

  canvas.on('object:scaling', (e) => {
    const obj = e.target
    if (!obj || !canvas) return

    const canvasWidth = canvas.width || props.width
    const canvasHeight = canvas.height || props.height

    if (obj.type === 'textbox') {
      normalizeTextboxScale(obj as fabric.Textbox)
    }

    handleObjectScaling(obj, canvasWidth, canvasHeight)
  })

  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', handleSelectionCleared)
  canvas.on('text:selection:changed', handleTextboxStateUpdate)
  canvas.on('text:editing:entered', handleTextboxStateUpdate)
  canvas.on('text:editing:exited', handleTextboxStateUpdate)
  canvas.on('text:changed', handleTextboxStateUpdate)

  globalThis.addEventListener('keydown', handleKeyDown)

  if (props.canvasData) {
    canvas.loadFromJSON(props.canvasData, () => {
      canvas?.getObjects().forEach((obj) => {
        Object.assign(obj, objectDefaults)
        if (obj.type === 'textbox') {
          ;(obj as fabric.Textbox).set({ lockScalingY: true })
          normalizeTextboxScale(obj as fabric.Textbox)
        }
        obj.setCoords()
      })
      canvas?.renderAll()
      checkHasObjects()
    })
  } else {
    checkHasObjects()
  }
})

// Dispose canvas instance and global listeners.
onBeforeUnmount(() => {
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
  globalThis.removeEventListener('keydown', handleKeyDown)
})

// Toggle object interactivity when block active state changes.
watch(() => props.active, (isActive) => {
  if (canvas) {
    canvas.selection = isActive
    canvas.forEachObject((obj: fabric.Object) => {
      obj.selectable = isActive
      obj.evented = isActive
    })
    
    if (!isActive) {
      canvas.discardActiveObject()
      imageCropStore.clearSelection()
    }
    
    canvas.renderAll()
  }
})

// Apply fill updates from toolbar to selected shape.
watch(() => shapeStore.fillColor, (newColor) => {
  if (!canvas || !props.active) return
  
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return
  
  // Ignore images; styles apply only to geometric shapes.
  if (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') {
    // Avoid unnecessary render/save cycles.
    if (activeObject.fill !== newColor) {
      activeObject.set({ fill: newColor })
      canvas.renderAll()
      saveCanvas()
    }
  }
})

// Apply stroke color updates from toolbar to selected shape.
watch(() => shapeStore.strokeColor, (newColor) => {
  if (!canvas || !props.active) return
  
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return
  
  // Ignore images; styles apply only to geometric shapes.
  if (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') {
    // Avoid unnecessary render/save cycles.
    if (activeObject.stroke !== newColor) {
      activeObject.set({ stroke: newColor })
      canvas.renderAll()
      saveCanvas()
    }
  }
})

// Apply stroke width updates from toolbar to selected shape.
watch(() => shapeStore.strokeWidth, (newWidth) => {
  if (!canvas || !props.active) return
  
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return
  
  // Ignore images; styles apply only to geometric shapes.
  if (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') {
    // Avoid unnecessary render/save cycles.
    if (activeObject.strokeWidth !== newWidth) {
      activeObject.set({ strokeWidth: newWidth })
      canvas.renderAll()
      saveCanvas()
    }
  }
})

defineExpose({
  addSquare,
  addCircle,
  addTriangle,
  addTextZone,
  addImage,
  getSelectedImage,
  getSelectedShape,
  replaceSelectedImage,
  bringSelectedImageForward,
  sendSelectedImageToBack,
  bringSelectedShapeForward,
  sendSelectedShapeToBack,
})
</script>

<style scoped>
.shapeCanvasWrapper {
  width: 700px;
  border: 2px dashed #C6C6C6;
  border-radius: 4px;
  padding: 8px;
  background-color: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  background-color: #ffffff;
}
</style>
