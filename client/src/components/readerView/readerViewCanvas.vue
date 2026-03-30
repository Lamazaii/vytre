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

function calculateRequiredHeight(): number {
  if (!fabricCanvas.value) return minHeight
  
  const objects = fabricCanvas.value.getObjects()
  if (objects.length === 0) return minHeight
  
  let minTop = Infinity
  let maxBottom = 0
  
  objects.forEach((obj) => {
    const boundingRect = obj.getBoundingRect()
    const top = boundingRect.top
    const bottom = boundingRect.top + boundingRect.height
    
    if (top < minTop) {
      minTop = top
    }
    if (bottom > maxBottom) {
      maxBottom = bottom
    }
  })
  
  // Calculate required height: content height + padding
  const contentHeight = maxBottom - minTop
  const requiredHeight = contentHeight + (padding * 2)
  
  return Math.max(minHeight, requiredHeight)
}

function repositionObjects() {
  if (!fabricCanvas.value) return
  
  const objects = fabricCanvas.value.getObjects()
  if (objects.length === 0) return
  
  // Find the highest position
  let minTop = Infinity
  objects.forEach((obj) => {
    const boundingRect = obj.getBoundingRect()
    if (boundingRect.top < minTop) {
      minTop = boundingRect.top
    }
  })
  
  // Move all objects up if necessary
  const offset = minTop - padding
  if (offset > 0) {
    objects.forEach((obj) => {
      obj.set({ top: (obj.top || 0) - offset })
      obj.setCoords()
    })
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

  try {
    fabricCanvas.value.loadFromJSON(props.canvasData, () => {
      if (!fabricCanvas.value) return
      
      fabricCanvas.value.forEachObject((obj: fabric.Object) => {
        obj.selectable = false
        obj.evented = false
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
