<template>
  <div class="shapeCanvasWrapper">
    <canvas ref="canvasElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from "vue";
import { fabric } from "fabric";
import { useImageCropStore } from "../../../stores/imageCropStore";
import { objectDefaults } from "./utils/canvasConfig";
import {
  createDeleteControl,
  deleteSelectedObjects,
} from "./utils/canvasControls";
import {
  handleObjectMoving,
  handleObjectScaling,
} from "./utils/canvasConstraints";

import { useArrows } from "./composables/useArrows";
import { useShapes } from "./composables/useShapes";
import { useText } from "./composables/useText";
import { useImages } from "./composables/useImages";
import { useLayers } from "./composables/useLayers";
import { useSelection } from "./composables/useSelection";

// Configure Fabric.js to serialize custom arrow properties
const originalPathToObject = fabric.Path.prototype.toObject;
fabric.Path.prototype.toObject = function (propertiesToInclude?: string[]) {
  const obj = originalPathToObject.call(this, propertiesToInclude);
  if ((this as any).isArrow) {
    obj.isArrow = (this as any).isArrow;
    obj.arrowStart = (this as any).arrowStart;
    obj.arrowEnd = (this as any).arrowEnd;
    obj.arrowStartStyle = (this as any).arrowStartStyle;
    obj.arrowEndStyle = (this as any).arrowEndStyle;
  }
  return obj;
};

interface Props {
  width?: number;
  height?: number;
  blockIndex?: number;
  canvasData?: string;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 700,
  height: 400,
  active: false,
});

const emit = defineEmits<{
  "update:canvasData": [data: string];
  modified: [value: boolean];
  "update:hasObjects": [value: boolean];
}>();

const imageCropStore = useImageCropStore();
const canvasElement = ref<HTMLCanvasElement | null>(null);
const canvasRef = shallowRef<fabric.Canvas | null>(null);

function saveCanvas() {
  if (!canvasRef.value) return;
  const json = JSON.stringify(canvasRef.value.toJSON());
  emit("update:canvasData", json);
  emit("modified", true);
  checkHasObjects();
}

function checkHasObjects() {
  if (!canvasRef.value) return;
  const objectCount = canvasRef.value.getObjects().length;
  emit("update:hasObjects", objectCount > 0);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== "Delete" && event.key !== "Backspace") return;
  if (!props.active) return;

  const target = event.target as HTMLElement | null;
  if (target) {
    const tagName = target.tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable) {
      return;
    }
  }

  deleteSelectedObjects(canvasRef.value);
}

const {
  addArrow,
  isDrawingArrow,
  handleArrowMouseDown,
  handleArrowMouseMove,
  handleArrowMouseUp,
  handleArrowRender,
  handleArrowMoving,
  handleArrowModified,
  resetArrowDrawingState,
} = useArrows(canvasRef, props, saveCanvas);

const { addSquare, addCircle, addTriangle, getSelectedShape } = useShapes(
  canvasRef,
  props,
  saveCanvas
);

const { getSelectedText, addTextZone, normalizeTextboxScale, handleTextboxStateUpdate } =
  useText(canvasRef, props);

const { getSelectedImage, addImage, replaceSelectedImage } = useImages(
  canvasRef,
  props
);

const {
  bringSelectedImageForward,
  sendSelectedImageToBack,
  bringSelectedShapeForward,
  sendSelectedShapeToBack,
  bringSelectedTextForward,
  sendSelectedTextToBack,
} = useLayers(
  canvasRef,
  saveCanvas,
  getSelectedImage,
  getSelectedShape,
  getSelectedText
);

const { handleSelection, handleSelectionCleared } = useSelection(canvasRef, props);

onMounted(() => {
  if (!canvasElement.value) return;

  canvasRef.value = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
  });

  const canvas = canvasRef.value;

  fabric.Object.prototype.controls.deleteControl = createDeleteControl();
  fabric.ActiveSelection.prototype.controls.deleteControl = createDeleteControl();
  fabric.Textbox.prototype.controls.deleteControl = createDeleteControl();

  canvas.on("object:added", saveCanvas);
  canvas.on("object:removed", saveCanvas);
  
  canvas.on("object:modified", (e) => {
    handleArrowModified(e);
    saveCanvas();
  });

  canvas.on("object:moving", (e) => {
    if (handleArrowMoving(e)) return;

    const obj = e.target;
    if (!obj || !canvas) return;

    const canvasWidth = canvas.width || props.width;
    const canvasHeight = canvas.height || props.height;
    handleObjectMoving(obj, canvasWidth, canvasHeight);
  });

  canvas.on("object:scaling", (e) => {
    const obj = e.target;
    if (!obj || !canvas) return;

    const canvasWidth = canvas.width || props.width;
    const canvasHeight = canvas.height || props.height;

    if (obj.type === "textbox") {
      normalizeTextboxScale(obj as fabric.Textbox);
    }
    handleObjectScaling(obj, canvasWidth, canvasHeight);
  });

  canvas.on("selection:created", handleSelection);
  canvas.on("selection:updated", handleSelection);
  canvas.on("selection:cleared", handleSelectionCleared);
  canvas.on("text:selection:changed", handleTextboxStateUpdate);
  canvas.on("text:editing:entered", handleTextboxStateUpdate);
  canvas.on("text:editing:exited", handleTextboxStateUpdate);
  canvas.on("text:changed", handleTextboxStateUpdate);

  canvas.on("mouse:down", handleArrowMouseDown);
  canvas.on("mouse:move", handleArrowMouseMove);
  canvas.on("after:render", () => handleArrowRender(canvas.getContext()));
  canvas.on("mouse:up", handleArrowMouseUp);

  globalThis.addEventListener("keydown", handleKeyDown);

  if (props.canvasData) {
    const jsonData = JSON.parse(props.canvasData);
    canvas.loadFromJSON(props.canvasData, () => {
      const objects = canvas?.getObjects() || [];
      objects.forEach((obj, index) => {
        Object.assign(obj, objectDefaults);
        if (obj.type === "textbox") {
          (obj as fabric.Textbox).set({ lockScalingY: true });
          normalizeTextboxScale(obj as fabric.Textbox);
        }
        obj.setCoords();

        if (jsonData.objects && jsonData.objects[index]) {
          const jsonObj = jsonData.objects[index];
          if (jsonObj.isArrow) {
            (obj as any).isArrow = jsonObj.isArrow;
            (obj as any).arrowStart = jsonObj.arrowStart;
            (obj as any).arrowEnd = jsonObj.arrowEnd;
            (obj as any).arrowStartStyle = jsonObj.arrowStartStyle;
            (obj as any).arrowEndStyle = jsonObj.arrowEndStyle;
          }
        }
      });
      canvas?.renderAll();
      checkHasObjects();
    });
  } else {
    checkHasObjects();
  }
});

onBeforeUnmount(() => {
  if (canvasRef.value) {
    canvasRef.value.dispose();
    canvasRef.value = null;
  }
  globalThis.removeEventListener("keydown", handleKeyDown);
});

watch(
  () => props.active,
  (isActive) => {
    if (!isActive) {
      resetArrowDrawingState();
      if (canvasRef.value) {
        canvasRef.value.defaultCursor = "default";
        canvasRef.value.hoverCursor = "move";
      }
    }
    if (canvasRef.value) {
      canvasRef.value.forEachObject((obj: fabric.Object) => {
        obj.hasControls = isActive;
        obj.hasBorders = isActive;
      });

      if (!isActive) {
        canvasRef.value.discardActiveObject();
        imageCropStore.clearSelection();
      }
    }
  }
);

defineExpose({
  addSquare,
  addCircle,
  addTriangle,
  addTextZone,
  addArrow,
  addImage,
  getSelectedImage,
  getSelectedShape,
  getSelectedText,
  replaceSelectedImage,
  bringSelectedImageForward,
  sendSelectedImageToBack,
  bringSelectedShapeForward,
  sendSelectedShapeToBack,
  bringSelectedTextForward,
  sendSelectedTextToBack,
});
</script>

<style scoped>
.shapeCanvasWrapper {
  width: 700px;
  border: 2px dashed #c6c6c6;
  border-radius: 4px;
  padding: 8px;
  background-color: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
}
</style>
