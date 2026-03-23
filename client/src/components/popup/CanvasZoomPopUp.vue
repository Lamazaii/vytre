<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="close">
        <div class="box-wrapper" @click.stop>
          <div class="canvas-scroll-area">
            <canvas ref="canvasElement" :id="`zoom-canvas-${canvasId}`"></canvas>
          </div>
          
          <button class="close-button" @click="close" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { fabric } from 'fabric';

interface Props {
  isOpen: boolean;
  canvasData?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const close = () => {
  emit('close');
};

const canvasElement = ref<HTMLCanvasElement | null>(null);
const fabricCanvas = ref<fabric.Canvas | null>(null);
const canvasId = `zoom-${Math.random()}`;

const baseWidth = 700;
const scaleFactor = 1.8; // Agrandissement à 180%
const padding = 5;
const minHeight = 100;

function calculateRequiredHeight(): number {
  if (!fabricCanvas.value) return minHeight;
  
  const objects = fabricCanvas.value.getObjects();
  if (objects.length === 0) return minHeight;
  
  let minTop = Infinity;
  let maxBottom = 0;
  
  objects.forEach((obj) => {
    const boundingRect = obj.getBoundingRect();
    const top = boundingRect.top;
    const bottom = boundingRect.top + boundingRect.height;
    
    if (top < minTop) minTop = top;
    if (bottom > maxBottom) maxBottom = bottom;
  });
  
  const contentHeight = maxBottom - minTop;
  const requiredHeight = contentHeight + (padding * 2);
  
  return Math.max(minHeight, requiredHeight);
}

function repositionObjects() {
  if (!fabricCanvas.value) return;
  const objects = fabricCanvas.value.getObjects();
  if (objects.length === 0) return;
  
  let minTop = Infinity;
  objects.forEach((obj) => {
    const boundingRect = obj.getBoundingRect();
    if (boundingRect.top < minTop) minTop = boundingRect.top;
  });
  
  const offset = minTop - padding;
  if (offset > 0) {
    objects.forEach((obj) => {
      obj.set({ top: (obj.top || 0) - offset });
      obj.setCoords();
    });
  }
}

const initCanvas = () => {
  if (!canvasElement.value || !props.canvasData) return;
  
  if (fabricCanvas.value) {
    fabricCanvas.value.dispose();
  }

  fabricCanvas.value = new fabric.Canvas(canvasElement.value, {
    width: baseWidth,
    height: minHeight,
    backgroundColor: '#ffffff',
    selection: false,
    interactive: false
  });

  try {
    fabricCanvas.value.loadFromJSON(props.canvasData, () => {
      if (!fabricCanvas.value) return;
      
      repositionObjects();
      const rawHeight = calculateRequiredHeight();
      
      fabricCanvas.value.forEachObject((obj: fabric.Object) => {
        obj.selectable = false;
        obj.evented = false;
      });
      
      fabricCanvas.value.setZoom(scaleFactor);
      fabricCanvas.value.setHeight(rawHeight * scaleFactor);
      fabricCanvas.value.setWidth(baseWidth * scaleFactor);
      
      fabricCanvas.value.renderAll();
    });
  } catch (error) {
    console.error('Erreur lors du zoom canvas:', error);
  }
};

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    initCanvas();
  } else {
    if (fabricCanvas.value) {
      fabricCanvas.value.dispose();
      fabricCanvas.value = null;
    }
  }
});

onBeforeUnmount(() => {
  if (fabricCanvas.value) {
    fabricCanvas.value.dispose();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000; 
  padding: 20px;
}

.box-wrapper {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  /* Espace pour le bouton en haut à droite */
  padding-top: 50px;
}

.canvas-scroll-area {
  overflow: auto;
  padding: 10px;
  flex: 1;
  border-radius: 8px;
}

.canvas-scroll-area::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.canvas-scroll-area::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
.canvas-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  border: none;
  border-radius: 20%; 
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  background-color: #dc2626; 
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.close-button:hover {
  transform: scale(1.1);
  background-color: #dc2626;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
