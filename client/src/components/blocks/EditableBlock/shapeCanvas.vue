<template>
  <div class="shapeCanvasWrapper">
    <canvas ref="canvasElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { fabric } from 'fabric'
import { useImageCropStore } from '../../../stores/imageCropStore'

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
}>()

const canvasElement = ref<HTMLCanvasElement | null>(null)
let canvas: fabric.Canvas | null = null
const imageCropStore = useImageCropStore()

const objectDefaults = {
  selectable: true,
  evented: true,
  hasControls: true,
  hasBorders: true,
  lockRotation: false,
  lockScalingX: false,
  lockScalingY: false,
  lockMovementX: false,
  lockMovementY: false,
  lockSkewingX: false,
  lockSkewingY: false,
  transparentCorners: false,
  cornerSize: 10,
  cornerColor: 'rgba(178, 204, 255, 1)',
  cornerStrokeColor: 'rgba(102, 153, 255, 1)',
  borderColor: 'rgba(102, 153, 255, 1)',
  borderScaleFactor: 1,
  rotatingPointOffset: 30,
}

function createDeleteControl() {
  return new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderDeleteIcon
  })
}

function deleteObject(_eventData: MouseEvent, _transform: any) {
  const target = _transform.target
  const canvas = target.canvas

  if (target.type === 'activeSelection') {
    const activeSelection = target as fabric.ActiveSelection
    
    activeSelection.forEachObject((obj: fabric.Object) => {
      canvas.remove(obj)
    })
    
    canvas.discardActiveObject()
  } else {
    canvas.remove(target)
  }
  
  canvas.requestRenderAll()
  return true
}

function renderDeleteIcon(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: fabric.Object
) {
  const size = 20
  ctx.save()
  ctx.translate(left, top)
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0))
  
  ctx.beginPath()
  ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
  ctx.fillStyle = '#DC2626'
  ctx.fill()

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  const crossSize = size * 0.4
  ctx.beginPath()
  ctx.moveTo(-crossSize / 2, -crossSize / 2)
  ctx.lineTo(crossSize / 2, crossSize / 2)
  ctx.moveTo(crossSize / 2, -crossSize / 2)
  ctx.lineTo(-crossSize / 2, crossSize / 2)
  ctx.stroke()
  
  ctx.restore()
}

function deleteSelectedObjects() {
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  if (activeObject.type === 'activeSelection') {
    const activeSelection = activeObject as fabric.ActiveSelection

    activeSelection.forEachObject((obj: fabric.Object) => {
      canvas?.remove(obj)
    })

    canvas.discardActiveObject()
  } else {
    canvas.remove(activeObject)
  }

  canvas.requestRenderAll()
}

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

  deleteSelectedObjects()
}

function constrainObjectPosition(
  obj: fabric.Object,
  canvasWidth: number,
  canvasHeight: number,
  radius: number
) {
  const scaledWidth = (obj.width || 0) * (obj.scaleX || 1)
  const scaledHeight = (obj.height || 0) * (obj.scaleY || 1)
  const scaledRadius = radius * (obj.scaleX || 1)

  if (obj.left !== undefined) {
    if (radius > 0) {
      obj.left = Math.max(scaledRadius, Math.min(obj.left, canvasWidth - scaledRadius))
    } else {
      obj.left = Math.max(0, Math.min(obj.left, canvasWidth - scaledWidth))
    }
  }

  if (obj.top !== undefined) {
    if (radius > 0) {
      obj.top = Math.max(scaledRadius, Math.min(obj.top, canvasHeight - scaledRadius))
    } else {
      obj.top = Math.max(0, Math.min(obj.top, canvasHeight - scaledHeight))
    }
  }
}

function saveCanvas() {
  if (!canvas) return
  const json = JSON.stringify(canvas.toJSON())
  emit('update:canvasData', json)
  emit('modified', true)
}

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
      fill: '#DC2626',
      ...objectDefaults
    })
  } else if (type === 'circle') {
    const radius = 50
    shape = new fabric.Circle({
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      radius: radius,
      fill: '#DC2626',
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
      fill: '#DC2626',
      ...objectDefaults
    })
  }

  canvas.add(shape)
  canvas.setActiveObject(shape)
  canvas.renderAll()
}

function addSquare() {
  createShape('rect')
}

function addCircle() {
  createShape('circle')
}

function addTriangle() {
  createShape('triangle')
}

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

function getSelectedImage() {
  if (!canvas) return null
  const activeObject = canvas.getActiveObject()
  if (activeObject && activeObject.type === 'image') {
    return activeObject as fabric.Image
  }
  return null
}

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

function bringSelectedImageForward() {
  if (!canvas) return false
  const selectedImage = getSelectedImage()
  if (!selectedImage) return false

  canvas.bringForward(selectedImage)
  canvas.renderAll()
  saveCanvas()
  return true
}

function sendSelectedImageToBack() {
  if (!canvas) return false
  const selectedImage = getSelectedImage()
  if (!selectedImage) return false

  canvas.sendBackwards(selectedImage)
  canvas.renderAll()
  saveCanvas()
  return true
}

function handleSelection(e: any) {
  const selected = e.selected?.[0]
  if (selected && selected.type === 'image') {
    const imageId = (selected as any).imageId || selected.cacheKey
    if (imageId && props.blockIndex !== undefined) {
      imageCropStore.selectImage(imageId, props.blockIndex)
    }
  } else {
    imageCropStore.clearSelection()
  }
}

function handleSelectionCleared() {
  imageCropStore.clearSelection()
}

onMounted(() => {
  if (!canvasElement.value) return

  canvas = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    backgroundColor: '#ffffff',
    selection: props.active,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
  })

  fabric.Object.prototype.controls.deleteControl = createDeleteControl()
  fabric.ActiveSelection.prototype.controls.deleteControl = createDeleteControl()

  canvas.on('object:added', saveCanvas)
  canvas.on('object:modified', saveCanvas)
  canvas.on('object:removed', saveCanvas)

  canvas.on('object:moving', (e) => {
    const obj = e.target
    if (!obj || !canvas) return

    const canvasWidth = canvas.width || props.width
    const canvasHeight = canvas.height || props.height

    const objWidth = (obj.width || 0) * (obj.scaleX || 1)
    const objHeight = (obj.height || 0) * (obj.scaleY || 1)

    const radius = (obj as fabric.Circle).radius || 0
    const scaledRadius = radius * (obj.scaleX || 1)

    if (obj.left !== undefined) {
      if (radius > 0) {
        obj.left = Math.max(scaledRadius, Math.min(obj.left, canvasWidth - scaledRadius))
      } else {
        obj.left = Math.max(0, Math.min(obj.left, canvasWidth - objWidth))
      }
    }

    if (obj.top !== undefined) {
      if (radius > 0) {
        obj.top = Math.max(scaledRadius, Math.min(obj.top, canvasHeight - scaledRadius))
      } else {
        obj.top = Math.max(0, Math.min(obj.top, canvasHeight - objHeight))
      }
    }
  })

  canvas.on('object:scaling', (e) => {
    const obj = e.target
    if (!obj || !canvas) return

    const canvasWidth = canvas.width || props.width
    const canvasHeight = canvas.height || props.height

    const radius = (obj as fabric.Circle).radius || 0
    if (radius > 0) {
      const maxScale = Math.min(canvasWidth, canvasHeight) / (2 * radius)

      if (obj.scaleX && obj.scaleX > maxScale) {
        obj.scaleX = maxScale
      }
      if (obj.scaleY && obj.scaleY > maxScale) {
        obj.scaleY = maxScale
      }
    } else {
      const objWidth = (obj.width || 0) * (obj.scaleX || 1)
      const objHeight = (obj.height || 0) * (obj.scaleY || 1)

      if (obj.scaleX && objWidth > canvasWidth) {
        obj.scaleX = canvasWidth / (obj.width || 1)
      }
      if (obj.scaleY && objHeight > canvasHeight) {
        obj.scaleY = canvasHeight / (obj.height || 1)
      }
    }

    constrainObjectPosition(obj, canvasWidth, canvasHeight, radius)
  })

  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', handleSelectionCleared)

  globalThis.addEventListener('keydown', handleKeyDown)

  if (props.canvasData) {
    canvas.loadFromJSON(props.canvasData, () => {
      canvas?.getObjects().forEach((obj) => {
        Object.assign(obj, objectDefaults)
        obj.setCoords()
      })
      canvas?.renderAll()
    })
  }
})

onBeforeUnmount(() => {
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
  globalThis.removeEventListener('keydown', handleKeyDown)
})

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

defineExpose({
  addSquare,
  addCircle,
  addTriangle,
  addImage,
  getSelectedImage,
  replaceSelectedImage,
  bringSelectedImageForward,
  sendSelectedImageToBack,
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
