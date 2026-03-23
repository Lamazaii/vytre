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

// Configure Fabric.js to serialize custom arrow properties
const originalPathToObject = fabric.Path.prototype.toObject
fabric.Path.prototype.toObject = function(propertiesToInclude?: string[]) {
  const obj = originalPathToObject.call(this, propertiesToInclude)
  if ((this as any).isArrow) {
    obj.isArrow = (this as any).isArrow
    obj.arrowStart = (this as any).arrowStart
    obj.arrowEnd = (this as any).arrowEnd
  }
  return obj
}

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

// Arrow two-click drawing state.
let isDrawingArrow = false
let arrowStartPoint: { x: number; y: number } | null = null
let arrowPreviewPointer: { x: number; y: number } | null = null

// Arrow endpoint modification state.
let modifyingArrow: fabric.Path | null = null
let modifyingEnd: 'start' | 'end' | null = null

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

function isArrowObject(obj: fabric.Object): obj is fabric.Path {
  return obj.type === 'path' && (obj as any).isArrow === true
}

function applyArrowStyle(arrow: fabric.Path, color: string, width: number) {
  arrow.set({
    stroke: color,
    strokeWidth: width,
  })
}

// Create an arrow object between two canvas-space points.
function createArrowBetweenPoints(start: { x: number; y: number }, end: { x: number; y: number }) {
  if (!canvas) return

  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance < 5) return

  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  // Create arrow as a single path object
  const arrowHeadSize = 12
  const arrowPath = `M 0,0 L ${distance},0 M ${distance - arrowHeadSize},${-arrowHeadSize * 0.6} L ${distance},0 L ${distance - arrowHeadSize},${arrowHeadSize * 0.6}`

  const arrow = new fabric.Path(arrowPath, {
    stroke: shapeStore.fillColor,
    strokeWidth: shapeStore.strokeWidth,
    fill: 'transparent',
    left: start.x,
    top: start.y,
    angle: angle,
    originX: 'left',
    originY: 'center',
    ...objectDefaults,
  })

  ;(arrow as any).isArrow = true
  ;(arrow as any).arrowStart = start
  ;(arrow as any).arrowEnd = end

  canvas.add(arrow)
  canvas.setActiveObject(arrow)
  canvas.renderAll()
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

// Create a default arrow when the button is clicked.
function addArrow() {
  if (!canvas) return
  
  const canvasWidth = canvas.width || props.width
  const canvasHeight = canvas.height || props.height
  
  // Create a shorter horizontal arrow in the center of the canvas
  const defaultStart = { x: canvasWidth * 0.35, y: canvasHeight * 0.5 }
  const defaultEnd = { x: canvasWidth * 0.65, y: canvasHeight * 0.5 }
  
  createArrowBetweenPoints(defaultStart, defaultEnd)
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
  if (activeObject && (
    activeObject.type === 'rect' ||
    activeObject.type === 'circle' ||
    activeObject.type === 'triangle' ||
    isArrowObject(activeObject)
  )) {
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
  } else if (selected && isArrowObject(selected)) {
    // Hide selection box for arrows - they show green endpoints instead
    selected.hasControls = false
    selected.hasBorders = false
    
    const fill = selected.stroke || '#000000'
    const width = selected.strokeWidth || 2
    shapeStore.updateStylesFromSelection(fill as string, fill as string, width as number, 'arrow')
    imageCropStore.clearSelection()
    textFormatStore.clearTextFocus()
  } else if (selected && (selected.type === 'rect' || selected.type === 'circle' || selected.type === 'triangle')) {
    // Keep toolbar controls in sync with selected shape style.
    const fill = selected.fill || '#000000'
    const stroke = selected.stroke || '#1F2937'
    const strokeWidth = selected.strokeWidth || 2
    const shapeType = selected.type === 'rect' ? 'square' : selected.type === 'circle' ? 'circle' : 'triangle'
    shapeStore.updateStylesFromSelection(fill as string, stroke as string, strokeWidth as number, shapeType)
    imageCropStore.clearSelection()
    textFormatStore.clearTextFocus()
  } else {
    imageCropStore.clearSelection()
  }
}

// Clear shape/image selection state when selection is removed.
function handleSelectionCleared() {
  imageCropStore.clearSelection()
  shapeStore.clearShapeSelection()
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

  canvas.on('object:added', saveCanvas)
  canvas.on('object:modified', (e) => {
    // Reset tracking on drag end
    if (e.target && isArrowObject(e.target)) {
      const arrow = e.target as fabric.Path
      ;(arrow as any).lastLeft = undefined
      ;(arrow as any).lastTop = undefined
    }
    saveCanvas()
  })
  canvas.on('object:removed', saveCanvas)

  canvas.on('object:moving', (e) => {
    // Real-time endpoint updates during arrow drag
    if (e.target && isArrowObject(e.target)) {
      const arrow = e.target as fabric.Path
      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }
      
      // Initialize tracking on first move
      if ((arrow as any).lastLeft === undefined) {
        ;(arrow as any).lastLeft = arrow.left || 0
        ;(arrow as any).lastTop = arrow.top || 0
      }
      
      // Get current position
      const currentLeft = arrow.left || 0
      const currentTop = arrow.top || 0
      const lastLeft = (arrow as any).lastLeft || 0
      const lastTop = (arrow as any).lastTop || 0
      
      // Calculate delta and update endpoints immediately
      const deltaX = currentLeft - lastLeft
      const deltaY = currentTop - lastTop
      
      ;(arrow as any).arrowStart = { x: start.x + deltaX, y: start.y + deltaY }
      ;(arrow as any).arrowEnd = { x: end.x + deltaX, y: end.y + deltaY }
      ;(arrow as any).lastLeft = currentLeft
      ;(arrow as any).lastTop = currentTop
      
      return
    }

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

    handleObjectScaling(obj, canvasWidth, canvasHeight)
  })

  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', handleSelectionCleared)

  // First click sets the start point; second click finalises the arrow.
  canvas.on('mouse:down', (e: any) => {
    const pointer = canvas!.getPointer(e.e)

    // Check if clicking on an arrow endpoint to modify it
    const allObjects = canvas!.getObjects()
    for (const obj of allObjects) {
      if (isArrowObject(obj)) {
        const arrow = obj as fabric.Path
        const start = (arrow as any).arrowStart as { x: number; y: number }
        const end = (arrow as any).arrowEnd as { x: number; y: number }

        const distToStart = Math.sqrt((pointer.x - start.x) ** 2 + (pointer.y - start.y) ** 2)
        const distToEnd = Math.sqrt((pointer.x - end.x) ** 2 + (pointer.y - end.y) ** 2)
        const tolerance = 12

        if (distToStart < tolerance) {
          modifyingArrow = arrow
          modifyingEnd = 'start'
          canvas!.setActiveObject(arrow)
          return
        }
        if (distToEnd < tolerance) {
          modifyingArrow = arrow
          modifyingEnd = 'end'
          canvas!.setActiveObject(arrow)
          return
        }
      }
    }

    if (!isDrawingArrow) return
    if (e.e.button !== 0) return
    if (!arrowStartPoint) {
      arrowStartPoint = { x: pointer.x, y: pointer.y }
      arrowPreviewPointer = { x: pointer.x, y: pointer.y }
      canvas!.requestRenderAll()
    } else {
      const startPoint = { ...arrowStartPoint }
      const endPoint = { x: pointer.x, y: pointer.y }
      isDrawingArrow = false
      arrowStartPoint = null
      arrowPreviewPointer = null
      canvas!.defaultCursor = 'default'
      canvas!.hoverCursor = 'move'
      canvas!.selection = props.active
      createArrowBetweenPoints(startPoint, endPoint)
    }
  })

  // Update preview endpoint as the mouse moves after the first click or when modifying arrow.
  canvas.on('mouse:move', (e: any) => {
    const pointer = canvas!.getPointer(e.e)

    // Check if near an arrow endpoint for visual feedback
    let nearEndpoint = false
    const allObjects = canvas!.getObjects()
    for (const obj of allObjects) {
      if (isArrowObject(obj)) {
        const arrow = obj as fabric.Path
        const start = (arrow as any).arrowStart as { x: number; y: number }
        const end = (arrow as any).arrowEnd as { x: number; y: number }

        const distToStart = Math.sqrt((pointer.x - start.x) ** 2 + (pointer.y - start.y) ** 2)
        const distToEnd = Math.sqrt((pointer.x - end.x) ** 2 + (pointer.y - end.y) ** 2)

        if (distToStart < 12 || distToEnd < 12) {
          nearEndpoint = true
          break
        }
      }
    }

    canvas!.defaultCursor = nearEndpoint ? 'crosshair' : 'default'

    // Handle arrow endpoint modification live
    if (modifyingArrow && modifyingEnd) {
      const arrow = modifyingArrow

      if (modifyingEnd === 'start') {
        ;(arrow as any).arrowStart = { x: pointer.x, y: pointer.y }
      } else {
        ;(arrow as any).arrowEnd = { x: pointer.x, y: pointer.y }
      }

      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }
      const dx = end.x - start.x
      const dy = end.y - start.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      if (distance > 5) {
        const arrowHeadSize = 12
        const arrowPathStr = `M 0,0 L ${distance},0 M ${distance - arrowHeadSize},${-arrowHeadSize * 0.6} L ${distance},0 L ${distance - arrowHeadSize},${arrowHeadSize * 0.6}`

        // Remove old and create new arrow with updated path
        canvas!.remove(arrow)

        const newArrow = new fabric.Path(arrowPathStr, {
          stroke: arrow.stroke || shapeStore.fillColor,
          strokeWidth: arrow.strokeWidth || 2,
          fill: 'transparent',
          left: start.x,
          top: start.y,
          angle: angle,
          originX: 'left',
          originY: 'center',
          ...objectDefaults,
        })

        ;(newArrow as any).isArrow = true
        ;(newArrow as any).arrowStart = start
        ;(newArrow as any).arrowEnd = end

        canvas!.add(newArrow)
        modifyingArrow = newArrow
        canvas!.setActiveObject(newArrow)
        canvas!.renderAll()
      }
      return
    }

    if (!isDrawingArrow || !arrowStartPoint) return
    arrowPreviewPointer = canvas!.getPointer(e.e)
    canvas!.requestRenderAll()
  })

  // Draw a dashed preview line directly onto the canvas context.
  canvas.on('after:render', () => {
    const ctx = canvas!.getContext()
    
    // Draw circles at arrow endpoints only when selected
    const activeObj = canvas!.getActiveObject()
    if (activeObj && isArrowObject(activeObj)) {
      const arrow = activeObj as fabric.Path
      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }

      ctx.fillStyle = 'rgba(102, 153, 255, 1)'
      ctx.strokeStyle = 'rgba(102, 153, 255, 1)'
      ctx.lineWidth = 2

      // Draw circle at start endpoint
      ctx.beginPath()
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw circle at end endpoint
      ctx.beginPath()
      ctx.arc(end.x, end.y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    if (!isDrawingArrow || !arrowStartPoint || !arrowPreviewPointer) return
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(arrowStartPoint.x, arrowStartPoint.y)
    ctx.lineTo(arrowPreviewPointer.x, arrowPreviewPointer.y)
    ctx.strokeStyle = shapeStore.fillColor
    ctx.lineWidth = shapeStore.strokeWidth
    ctx.lineCap = 'round'
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.restore()
  })

  // End arrow endpoint modification.
  canvas.on('mouse:up', () => {
    if (modifyingArrow && modifyingEnd) {
      saveCanvas()
    }
    modifyingArrow = null
    modifyingEnd = null
  })

  globalThis.addEventListener('keydown', handleKeyDown)

  if (props.canvasData) {
    const jsonData = JSON.parse(props.canvasData)
    canvas.loadFromJSON(props.canvasData, () => {
      const objects = canvas?.getObjects() || []
      objects.forEach((obj, index) => {
        Object.assign(obj, objectDefaults)
        obj.setCoords()
        
        // Restore custom arrow properties after JSON deserialization
        if (jsonData.objects && jsonData.objects[index]) {
          const jsonObj = jsonData.objects[index]
          if (jsonObj.isArrow) {
            ;(obj as any).isArrow = jsonObj.isArrow
            ;(obj as any).arrowStart = jsonObj.arrowStart
            ;(obj as any).arrowEnd = jsonObj.arrowEnd
          }
        }
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
  if (!isActive) {
    if (isDrawingArrow) {
      isDrawingArrow = false
      arrowStartPoint = null
      arrowPreviewPointer = null
      if (canvas) {
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
      }
    }
    modifyingArrow = null
    modifyingEnd = null
  }
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

  if (isArrowObject(activeObject)) {
    applyArrowStyle(activeObject, newColor, shapeStore.strokeWidth)
    canvas.renderAll()
    saveCanvas()
    return
  }
  
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

  if (isArrowObject(activeObject)) {
    applyArrowStyle(activeObject, shapeStore.fillColor, newWidth)
    canvas.renderAll()
    saveCanvas()
    return
  }
  
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
  addArrow,
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
