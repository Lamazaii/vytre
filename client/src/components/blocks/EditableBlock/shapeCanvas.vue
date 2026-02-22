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

onMounted(() => {
  if (!canvasElement.value) return

  // Initialiser le canvas Fabric.js
  fabricCanvas.value = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    backgroundColor: '#ffffff',
    selection: props.active
  })

  // Charger les données sauvegardées si elles existent
  if (props.canvasData) {
    try {
      fabricCanvas.value.loadFromJSON(props.canvasData, () => {
        fabricCanvas.value?.renderAll()
      })
    } catch (error) {
      console.error('Erreur lors du chargement du canvas:', error)
    }
  }

  // Écouter les modifications du canvas
  fabricCanvas.value.on('object:modified', saveCanvasState)
  fabricCanvas.value.on('object:added', saveCanvasState)
  fabricCanvas.value.on('object:removed', saveCanvasState)
  
  // Contraindre le mouvement des objets dans les limites du canvas
  fabricCanvas.value.on('object:moving', (e) => {
    const obj = e.target
    if (!obj || !fabricCanvas.value) return
    
    const canvasWidth = fabricCanvas.value.width || props.width
    const canvasHeight = fabricCanvas.value.height || props.height
    
    // Calculer les limites en tenant compte de la taille de l'objet
    const objWidth = (obj.width || 0) * (obj.scaleX || 1)
    const objHeight = (obj.height || 0) * (obj.scaleY || 1)
    
    // Pour les cercles, utiliser le rayon
    const radius = (obj as fabric.Circle).radius || 0
    const scaledRadius = radius * (obj.scaleX || 1)
    
    // Limiter les coordonnées
    if (obj.left !== undefined) {
      // Pour les cercles
      if (radius > 0) {
        obj.left = Math.max(scaledRadius, Math.min(obj.left, canvasWidth - scaledRadius))
      } else {
        // Pour les rectangles et triangles
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
  
  // Contraindre la taille des objets pour ne pas dépasser le canvas
  fabricCanvas.value.on('object:scaling', (e) => {
    const obj = e.target
    if (!obj || !fabricCanvas.value) return
    
    const canvasWidth = fabricCanvas.value.width || props.width
    const canvasHeight = fabricCanvas.value.height || props.height
    
    // Pour les cercles
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
      // Pour les rectangles et triangles
      const objWidth = (obj.width || 0) * (obj.scaleX || 1)
      const objHeight = (obj.height || 0) * (obj.scaleY || 1)
      
      if (obj.scaleX && objWidth > canvasWidth) {
        obj.scaleX = canvasWidth / (obj.width || 1)
      }
      if (obj.scaleY && objHeight > canvasHeight) {
        obj.scaleY = canvasHeight / (obj.height || 1)
      }
    }
    
    // Repositionner si l'objet dépasse après le scaling
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

// Fonction exposée pour ajouter un carré
function addSquare() {
  if (!fabricCanvas.value) return

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: '#DC2626',
    width: 80,
    height: 80,
    selectable: props.active,
    evented: props.active
  })

  fabricCanvas.value.add(rect)
  fabricCanvas.value.setActiveObject(rect)
  fabricCanvas.value.renderAll()
}

// Fonction exposée pour ajouter un cercle
function addCircle() {
  if (!fabricCanvas.value) return

  const circle = new fabric.Circle({
    left: 150,
    top: 150,
    fill: '#DC2626',
    radius: 40,
    selectable: props.active,
    evented: props.active
  })

  fabricCanvas.value.add(circle)
  fabricCanvas.value.setActiveObject(circle)
  fabricCanvas.value.renderAll()
}

// Fonction exposée pour ajouter un triangle
function addTriangle() {
  if (!fabricCanvas.value) return

  const triangle = new fabric.Triangle({
    left: 200,
    top: 200,
    fill: '#DC2626',
    width: 80,
    height: 80,
    selectable: props.active,
    evented: props.active
  })

  fabricCanvas.value.add(triangle)
  fabricCanvas.value.setActiveObject(triangle)
  fabricCanvas.value.renderAll()
}

// Exposer les fonctions au parent via defineExpose
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
