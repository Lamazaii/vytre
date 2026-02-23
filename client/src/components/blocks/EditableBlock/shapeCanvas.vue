<template>
  <div class="shapeCanvasWrapper">
    <canvas ref="canvasElement" :id="`canvas-${canvasId}`"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { fabric } from 'fabric'

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
const fabricCanvas = ref<fabric.Canvas | null>(null)
const canvasId = `shape-canvas-${props.blockIndex || Math.random()}`

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

onMounted(() => {
  if (!canvasElement.value) return

  fabricCanvas.value = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    backgroundColor: '#ffffff',
    selection: props.active
  })

  fabric.Object.prototype.controls.deleteControl = createDeleteControl()
  fabric.ActiveSelection.prototype.controls.deleteControl = createDeleteControl()

  if (props.canvasData) {
    try {
      fabricCanvas.value.loadFromJSON(props.canvasData, () => {
        fabricCanvas.value?.renderAll()
      })
    } catch (error) {
      console.error('Canvas loading error:', error)
    }
  }

  fabricCanvas.value.on('object:modified', saveCanvasState)
  fabricCanvas.value.on('object:added', saveCanvasState)
  fabricCanvas.value.on('object:removed', saveCanvasState)

  fabricCanvas.value.on('object:moving', (e) => {
    const obj = e.target
    if (!obj || !fabricCanvas.value) return
    
    const canvasWidth = fabricCanvas.value.width || props.width
    const canvasHeight = fabricCanvas.value.height || props.height

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
  
  fabricCanvas.value.on('object:scaling', (e) => {
    const obj = e.target
    if (!obj || !fabricCanvas.value) return
    
    const canvasWidth = fabricCanvas.value.width || props.width
    const canvasHeight = fabricCanvas.value.height || props.height
    
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
})

function constrainObjectPosition(obj: fabric.Object, canvasWidth: number, canvasHeight: number, radius: number) {
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

onBeforeUnmount(() => {
  if (fabricCanvas.value) {
    fabricCanvas.value.dispose()
  }
})

watch(() => props.active, (isActive) => {
  if (fabricCanvas.value) {
    fabricCanvas.value.selection = isActive
    fabricCanvas.value.forEachObject((obj: fabric.Object) => {
      obj.selectable = isActive
      obj.evented = isActive
    })
    fabricCanvas.value.renderAll()
  }
})

function saveCanvasState() {
  if (!fabricCanvas.value) return
  
  const json = JSON.stringify(fabricCanvas.value.toJSON())
  emit('update:canvasData', json)
  emit('modified', true)
}

function addSquare() {
  if (!fabricCanvas.value) return

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: '#DC2626',
    width: 80,
    height: 80,
    selectable: true,
    evented: true
  })

  fabricCanvas.value.add(rect)
  fabricCanvas.value.setActiveObject(rect)
  fabricCanvas.value.requestRenderAll()
}

function addCircle() {
  if (!fabricCanvas.value) return

  const circle = new fabric.Circle({
    left: 150,
    top: 150,
    fill: '#DC2626',
    radius: 40,
    selectable: true,
    evented: true
  })

  fabricCanvas.value.add(circle)
  fabricCanvas.value.setActiveObject(circle)
  fabricCanvas.value.requestRenderAll()
}

function addTriangle() {
  if (!fabricCanvas.value) return

  const triangle = new fabric.Triangle({
    left: 200,
    top: 200,
    fill: '#DC2626',
    width: 80,
    height: 80,
    selectable: true,
    evented: true
  })

  fabricCanvas.value.add(triangle)
  fabricCanvas.value.setActiveObject(triangle)
  fabricCanvas.value.requestRenderAll()
}

defineExpose({
  addSquare,
  addCircle,
  addTriangle,
  getCanvas: () => fabricCanvas.value
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
