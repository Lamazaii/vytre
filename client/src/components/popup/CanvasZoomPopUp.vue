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

// Canvas dimensions and scaling
const baseWidth = 700;
const scaleFactor = 1.8; // 180% zoom
const padding = 5;
const arrowHeadMargin = 25;
const minHeight = 100;

function calculateRequiredHeight(): number {
  if (!fabricCanvas.value) return minHeight;

  const objects = fabricCanvas.value.getObjects();
  if (objects.length === 0) return minHeight;

  let maxBottom = 0;

  objects.forEach((obj) => {
    if ((obj as any).isArrow) {
      const s = (obj as any).arrowStart;
      const e = (obj as any).arrowEnd;
      if (s) maxBottom = Math.max(maxBottom, s.y);
      if (e) maxBottom = Math.max(maxBottom, e.y);
    } else {
      const boundingRect = obj.getBoundingRect();
      maxBottom = Math.max(maxBottom, boundingRect.top + boundingRect.height);
    }
  });

  return Math.max(minHeight, maxBottom + padding + arrowHeadMargin);
}

function repositionObjects() {
  if (!fabricCanvas.value) return;
  const objects = fabricCanvas.value.getObjects();
  if (objects.length === 0) return;

  let minTop = Infinity;
  objects.forEach((obj) => {
    if ((obj as any).isArrow) {
      const s = (obj as any).arrowStart;
      const e = (obj as any).arrowEnd;
      if (s) minTop = Math.min(minTop, s.y);
      if (e) minTop = Math.min(minTop, e.y);
    } else {
      const boundingRect = obj.getBoundingRect();
      if (boundingRect.top < minTop) minTop = boundingRect.top;
    }
  });

  const offset = minTop - padding - arrowHeadMargin;
  if (offset > 0) {
    objects.forEach((obj) => {
      obj.set({ top: (obj.top || 0) - offset });
      obj.setCoords();
      if ((obj as any).isArrow) {
        const s = (obj as any).arrowStart;
        const e = (obj as any).arrowEnd;
        if (s) (obj as any).arrowStart = { x: s.x, y: s.y - offset };
        if (e) (obj as any).arrowEnd = { x: e.x, y: e.y - offset };
      }
    });
  }
}

function drawArrows(ctx: CanvasRenderingContext2D) {
  if (!fabricCanvas.value) return;

  const zoom = fabricCanvas.value.getZoom();
  const allObjects = fabricCanvas.value.getObjects();
  for (const obj of allObjects) {
    if (obj.type !== 'path' || !(obj as any).isArrow) continue;

    const start = (obj as any).arrowStart as { x: number; y: number };
    const end = (obj as any).arrowEnd as { x: number; y: number };
    if (!start || !end) continue;

    const startStyle = (obj as any).arrowStartStyle || 'stroke';
    const endStyle = (obj as any).arrowEndStyle || 'stroke';
    const color = (obj as any).arrowColor || '#000000';
    const strokeWidth = ((obj as fabric.Path).strokeWidth || 2) * zoom;

    const arrowHeadSize = Math.max(10, Math.min(20, 8 + (strokeWidth / zoom) * 1.5)) * zoom;
    const sx = start.x * zoom;
    const sy = start.y * zoom;
    const ex = end.x * zoom;
    const ey = end.y * zoom;
    const dx = ex - sx;
    const dy = ey - sy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 5) continue;

    const angle = Math.atan2(dy, dx);
    const startOffset = startStyle !== 'none' ? arrowHeadSize : 0;
    const endOffset = endStyle !== 'none' ? arrowHeadSize : 0;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(angle) * startOffset, sy + Math.sin(angle) * startOffset);
    ctx.lineTo(ex - Math.cos(angle) * endOffset, ey - Math.sin(angle) * endOffset);
    ctx.stroke();
    ctx.restore();

    // End arrowhead
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(angle);
    if (endStyle === 'filled') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6);
      ctx.closePath();
      ctx.fill();
    } else if (endStyle === 'open') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5);
      ctx.beginPath();
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (endStyle === 'stroke') {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5);
      ctx.beginPath();
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // Start arrowhead
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle + Math.PI);
    if (startStyle === 'filled') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6);
      ctx.closePath();
      ctx.fill();
    } else if (startStyle === 'open') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5);
      ctx.beginPath();
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (startStyle === 'stroke') {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.5, strokeWidth * 0.5);
      ctx.beginPath();
      ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6);
      ctx.stroke();
    }
    ctx.restore();
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

  const canvas = fabricCanvas.value;
  canvas.on('after:render', () => drawArrows(canvas.getContext()));

  try {
    const jsonData = JSON.parse(props.canvasData);
    canvas.loadFromJSON(props.canvasData, () => {
      if (!fabricCanvas.value) return;

      fabricCanvas.value.forEachObject((obj: fabric.Object, index: number) => {
        obj.selectable = false;
        obj.evented = false;

        if (jsonData.objects && jsonData.objects[index]) {
          const jsonObj = jsonData.objects[index];
          if (jsonObj.isArrow) {
            (obj as any).isArrow = jsonObj.isArrow;
            (obj as any).arrowStart = jsonObj.arrowStart;
            (obj as any).arrowEnd = jsonObj.arrowEnd;
            (obj as any).arrowStartStyle = jsonObj.arrowStartStyle;
            (obj as any).arrowEndStyle = jsonObj.arrowEndStyle;
            (obj as any).arrowColor = jsonObj.arrowColor || jsonObj.stroke || '#000000';
            (obj as fabric.Path).set({ stroke: 'rgba(0,0,0,0)' });
          }
        }
      });

      repositionObjects();
      const rawHeight = calculateRequiredHeight();

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
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
