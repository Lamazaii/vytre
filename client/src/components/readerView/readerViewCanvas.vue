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

const canvasElement = ref<HTMLCanvasElement | null>(null)
const fabricCanvas = ref<fabric.Canvas | null>(null)
const canvasId = `reader-${Math.random()}`

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
      
      fabricCanvas.value.renderAll()
    })
  } catch (error) {
    console.error('Erreur lors du chargement du canvas en mode lecture:', error)
  }
})

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
  align-items: center;
  margin-top: 8px;
}

canvas {
  border-radius: 4px;
  background-color: #ffffff;
}
</style>
