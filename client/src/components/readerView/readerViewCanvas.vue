<template>
  <div class="canvasViewer" v-if="canvasData">
    <canvas ref="canvasElement" :id="`reader-canvas-${canvasId}`"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { fabric } from 'fabric'

interface Props {
  canvasData?: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 700,
  height: 400
})

// Canvas refs for DOM node and Fabric viewer instance.
const canvasElement = ref<HTMLCanvasElement | null>(null)
const fabricCanvas = ref<fabric.Canvas | null>(null)
// Unique id for potential multi-canvas rendering.
const canvasId = `reader-${Math.random()}`
const minHeight = 100
const padding = 5
const arrowHeadMargin = 25

function calculateRequiredHeight(): number {
  if (!fabricCanvas.value) return minHeight

  const objects = fabricCanvas.value.getObjects()
  if (objects.length === 0) return minHeight

  let maxBottom = 0

  objects.forEach((obj) => {
    if ((obj as any).isArrow) {
      const s = (obj as any).arrowStart
      const e = (obj as any).arrowEnd
      if (s) maxBottom = Math.max(maxBottom, s.y)
      if (e) maxBottom = Math.max(maxBottom, e.y)
    } else {
      const boundingRect = obj.getBoundingRect()
      maxBottom = Math.max(maxBottom, boundingRect.top + boundingRect.height)
    }
  })

  return Math.max(minHeight, maxBottom + padding + arrowHeadMargin)
}

function repositionObjects() {
  if (!fabricCanvas.value) return
  
  const objects = fabricCanvas.value.getObjects()
  if (objects.length === 0) return
  
  // Find the highest position
  let minTop = Infinity
  objects.forEach((obj) => {
    if ((obj as any).isArrow) {
      const s = (obj as any).arrowStart
      const e = (obj as any).arrowEnd
      if (s) minTop = Math.min(minTop, s.y)
      if (e) minTop = Math.min(minTop, e.y)
    } else {
      const boundingRect = obj.getBoundingRect()
      if (boundingRect.top < minTop) minTop = boundingRect.top
    }
  })
  
  // Move all objects up if necessary
  const offset = minTop - padding - arrowHeadMargin
  if (offset > 0) {
    objects.forEach((obj) => {
      obj.set({ top: (obj.top || 0) - offset })
      obj.setCoords()
      if ((obj as any).isArrow) {
        const s = (obj as any).arrowStart
        const e = (obj as any).arrowEnd
        if (s) (obj as any).arrowStart = { x: s.x, y: s.y - offset }
        if (e) (obj as any).arrowEnd = { x: e.x, y: e.y - offset }
      }
    })
  }
}

function drawArrows(ctx: CanvasRenderingContext2D) {
  if (!fabricCanvas.value) return

  const allObjects = fabricCanvas.value.getObjects()
  for (const obj of allObjects) {
    if (obj.type !== 'path' || !(obj as any).isArrow) continue

    const start = (obj as any).arrowStart as { x: number; y: number }
    const end = (obj as any).arrowEnd as { x: number; y: number }
    if (!start || !end) continue

    const startStyle = (obj as any).arrowStartStyle || 'stroke'
    const endStyle = (obj as any).arrowEndStyle || 'stroke'
    const color = (obj as any).arrowColor || '#000000'
    const strokeWidth = (obj as fabric.Path).strokeWidth || 2

    const arrowHeadSize = Math.max(10, Math.min(20, 8 + strokeWidth * 1.5))
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 5) continue

    const angle = Math.atan2(dy, dx)
    const startOffset = startStyle !== 'none' ? arrowHeadSize : 0
    const endOffset = endStyle !== 'none' ? arrowHeadSize : 0
    const lineStartX = start.x + Math.cos(angle) * startOffset
    const lineStartY = start.y + Math.sin(angle) * startOffset
    const lineEndX = end.x - Math.cos(angle) * endOffset
    const lineEndY = end.y - Math.sin(angle) * endOffset

    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'butt'
    ctx.beginPath()
    ctx.moveTo(lineStartX, lineStartY)
    ctx.lineTo(lineEndX, lineEndY)
    ctx.stroke()
    ctx.restore()

    // End arrowhead
    ctx.save()
    ctx.translate(end.x, end.y)
    ctx.rotate(angle)
    if (endStyle === 'filled') {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
      ctx.lineTo(0, 0)
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
      ctx.closePath()
      ctx.fill()
    } else if (endStyle === 'open') {
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5)
      ctx.beginPath()
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
      ctx.lineTo(0, 0)
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else if (endStyle === 'stroke') {
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5)
      ctx.beginPath()
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
      ctx.lineTo(0, 0)
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
      ctx.stroke()
    }
    ctx.restore()

    // Start arrowhead
    ctx.save()
    ctx.translate(start.x, start.y)
    ctx.rotate(angle + Math.PI)
    if (startStyle === 'filled') {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
      ctx.lineTo(0, 0)
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
      ctx.closePath()
      ctx.fill()
    } else if (startStyle === 'open') {
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5)
      ctx.beginPath()
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
      ctx.lineTo(0, 0)
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else if (startStyle === 'stroke') {
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5)
      ctx.beginPath()
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
      ctx.lineTo(0, 0)
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
      ctx.stroke()
    }
    ctx.restore()
  }
}

// Initialize non-interactive Fabric canvas for read-only display.
onMounted(() => {
  if (!canvasElement.value || !props.canvasData) return

  fabricCanvas.value = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    backgroundColor: '#ffffff',
    selection: false,
    interactive: false
  })

  const canvas = fabricCanvas.value
  canvas.on('after:render', () => drawArrows(canvas.getContext()))

  try {
    const jsonData = JSON.parse(props.canvasData)
    canvas.loadFromJSON(props.canvasData, () => {
      if (!fabricCanvas.value) return

      fabricCanvas.value.forEachObject((obj: fabric.Object, index: number) => {
        obj.selectable = false
        obj.evented = false

        if (jsonData.objects && jsonData.objects[index]) {
          const jsonObj = jsonData.objects[index]
          if (jsonObj.isArrow) {
            ;(obj as any).isArrow = jsonObj.isArrow
            ;(obj as any).arrowStart = jsonObj.arrowStart
            ;(obj as any).arrowEnd = jsonObj.arrowEnd
            ;(obj as any).arrowStartStyle = jsonObj.arrowStartStyle
            ;(obj as any).arrowEndStyle = jsonObj.arrowEndStyle
            ;(obj as any).arrowColor = jsonObj.arrowColor || jsonObj.stroke || '#000000'
            ;(obj as fabric.Path).set({ stroke: 'rgba(0,0,0,0)' })
          }
        }
      })

      // Reposition objects to remove empty space at the top
      repositionObjects()

      // Adapt height to content
      const newHeight = calculateRequiredHeight()
      fabricCanvas.value.setHeight(newHeight)

      fabricCanvas.value.renderAll()
    })
  } catch (error) {
    console.error('Erreur lors du chargement du canvas en mode lecture:', error)
  }
})

//
onBeforeUnmount(() => {
  if (fabricCanvas.value) {
    fabricCanvas.value.dispose()
  }
})
</script>

<style scoped>
.canvasViewer {
  width: 700px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

canvas {
  border-radius: 4px;
  background-color: #ffffff;
}
</style>
