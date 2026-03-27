<template>
  <div class="shapeCanvasWrapper">
    <canvas ref="canvasElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { fabric } from "fabric";
import { useImageCropStore } from "../../../stores/imageCropStore";
import { useShapeStore } from "../../../stores/shapeStore";
import { useTextFormatStore } from "../../../stores/textFormatStore";
import { useErrorPopupStore } from "../../../stores/errorPopupStore";
import { objectDefaults } from "./utils/canvasConfig";
import {
  createDeleteControl,
  deleteSelectedObjects,
} from "./utils/canvasControls";
import {
  handleObjectMoving,
  handleObjectScaling,
} from "./utils/canvasConstraints";

// Configure Fabric.js to serialize custom arrow properties
const originalPathToObject = fabric.Path.prototype.toObject
fabric.Path.prototype.toObject = function(propertiesToInclude?: string[]) {
  const obj = originalPathToObject.call(this, propertiesToInclude)
  if ((this as any).isArrow) {
    obj.isArrow = (this as any).isArrow
    obj.arrowStart = (this as any).arrowStart
    obj.arrowEnd = (this as any).arrowEnd
    obj.arrowStartStyle = (this as any).arrowStartStyle
    obj.arrowEndStyle = (this as any).arrowEndStyle
  }
  return obj
}

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

// Canvas DOM reference and Fabric instance.
const canvasElement = ref<HTMLCanvasElement | null>(null);
let canvas: fabric.Canvas | null = null;
// Shared stores for cross-toolbar selection and formatting sync.
const imageCropStore = useImageCropStore();
const shapeStore = useShapeStore();
const textFormatStore = useTextFormatStore();
const errorPopup = useErrorPopupStore();

// Arrow two-click drawing state.
let isDrawingArrow = false
let arrowStartPoint: { x: number; y: number } | null = null
let arrowPreviewPointer: { x: number; y: number } | null = null

// Arrow endpoint modification state.
let modifyingArrow: fabric.Path | null = null
let modifyingEnd: 'start' | 'end' | null = null

// Handle delete/backspace shortcuts when canvas is active.
function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== "Delete" && event.key !== "Backspace") return;
  if (!props.active) return;

  const target = event.target as HTMLElement | null;
  if (target) {
    const tagName = target.tagName;
    if (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }
  }

  deleteSelectedObjects(canvas);
}

// Persist canvas JSON and notify parent state.
function saveCanvas() {
  if (!canvas) return;
  const json = JSON.stringify(canvas.toJSON());
  emit("update:canvasData", json);
  emit("modified", true);
  checkHasObjects();
}

// Notify parent whether canvas contains at least one object.
function checkHasObjects() {
  if (!canvas) return;
  const objectCount = canvas.getObjects().length;
  emit("update:hasObjects", objectCount > 0);
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

// Generate arrow path based on start/end points and head style
function generateArrowPath(
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  startStyle: string,
  endStyle: string,
  strokeWidth: number = 2
) {
  const dx = endPoint.x - startPoint.x
  const dy = endPoint.y - startPoint.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance < 5) return ''
  
  // Scale arrow head size based on stroke width (min 10, max 20)
  const arrowHeadSize = Math.max(10, Math.min(20, 8 + strokeWidth * 1.5))
  let pathStr = ''

  // Determine where the line starts and ends based on arrow head styles
  // For 'open' and 'filled' styles: use smaller offset (0.5) so line stops before the head
  // For 'stroke' style: use larger offset (0.75) to prevent overlap
  // For 'none': no offset needed
  const startOffset = startStyle === 'none' ? 0 : (startStyle === 'stroke' ? arrowHeadSize * 0.75 : arrowHeadSize * 0.5)
  const endOffset = endStyle === 'none' ? 0 : (endStyle === 'stroke' ? arrowHeadSize * 0.75 : arrowHeadSize * 0.5)

  // Main line (doesn't go through the heads) - drawn in SVG
  pathStr = `M ${startOffset},0 L ${distance - endOffset},0`

  // Only draw 'stroke' style lines in the path (visual representation)
  // Other styles (filled, open) are drawn via canvas in after:render callback
  
  // Handle end head - only stroke style in SVG path
  if (endStyle === 'stroke') {
    pathStr += ` M ${distance - arrowHeadSize},${-arrowHeadSize * 0.6} L ${distance},0 L ${distance - arrowHeadSize},${arrowHeadSize * 0.6}`
  }

  // Handle start head - only stroke style in SVG path
  if (startStyle === 'stroke') {
    pathStr += ` M ${arrowHeadSize},${-arrowHeadSize * 0.6} L 0,0 L ${arrowHeadSize},${arrowHeadSize * 0.6}`
  }

  return pathStr
}

// Create an arrow object between two canvas-space points.
function createArrowBetweenPoints(start: { x: number; y: number }, end: { x: number; y: number }) {
  if (!canvas) return

  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance < 5) return

  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  // Generate arrow path with current head styles
  const arrowPath = generateArrowPath(start, end, shapeStore.arrowStartStyle, shapeStore.arrowEndStyle, shapeStore.strokeWidth)

  // Always use transparent fill - heads will be drawn separately
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
  ;(arrow as any).arrowStartStyle = shapeStore.arrowStartStyle
  ;(arrow as any).arrowEndStyle = shapeStore.arrowEndStyle

  canvas.add(arrow)
  canvas.setActiveObject(arrow)
  canvas.renderAll()
}

// Factory for shape creation using current toolbar style values.
function createShape(type: "rect" | "circle" | "triangle") {
  if (!canvas) return;

  const canvasWidth = canvas.width || props.width;
  const canvasHeight = canvas.height || props.height;
  let shape: fabric.Object;

  if (type === "rect") {
    const size = 100;
    shape = new fabric.Rect({
      left: (canvasWidth - size) / 2,
      top: (canvasHeight - size) / 2,
      width: size,
      height: size,
      fill: shapeStore.fillColor,
      stroke: shapeStore.strokeColor,
      strokeWidth: shapeStore.strokeWidth,
      ...objectDefaults,
    });
  } else if (type === "circle") {
    const radius = 50;
    shape = new fabric.Circle({
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      radius: radius,
      fill: shapeStore.fillColor,
      stroke: shapeStore.strokeColor,
      strokeWidth: shapeStore.strokeWidth,
      originX: "center",
      originY: "center",
      ...objectDefaults,
    });
  } else {
    const size = 100;
    shape = new fabric.Triangle({
      left: (canvasWidth - size) / 2,
      top: (canvasHeight - size) / 2,
      width: size,
      height: size,
      fill: shapeStore.fillColor,
      stroke: shapeStore.strokeColor,
      strokeWidth: shapeStore.strokeWidth,
      ...objectDefaults,
    });
  }

  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.renderAll();
}

// Public helpers exposed to parent component.
function addSquare() {
  createShape("rect");
}

function addCircle() {
  createShape("circle");
}

function addTriangle() {
  createShape("triangle");
}

// Insert an editable text object centered in the drawing area.
function addTextZone() {
  if (!canvas) return

  const canvasWidth = canvas.width || props.width
  const canvasHeight = canvas.height || props.height
  const text = new fabric.Textbox('Nouvelle zone de texte', {
    left: 0,
    top: 0,
    width: Math.min(280, Math.max(180, canvasWidth - 40)),
    fontSize: 18,
    fill: '#111827',
    fontFamily: 'Arial',
    ...objectDefaults,
  })

  // Ensure vertical scaling is locked — set after construction to avoid typing issues
  ;(text as any).lockScalingY = true

  const textWidth = (text.width || 0) * (text.scaleX || 1)
  const textHeight = (text.height || 0) * (text.scaleY || 1)
  text.set({
    left: Math.max(0, (canvasWidth - textWidth) / 2),
    top: Math.max(0, (canvasHeight - textHeight) / 2),
  })

  canvas.add(text)
  handleObjectMoving(text, canvasWidth, canvasHeight)
  text.setCoords()
  canvas.setActiveObject(text)
  text.enterEditing()
  text.selectAll()
  canvas.renderAll()
}

// Keep text visual size fixed by converting scale into width.
function normalizeTextboxScale(textbox: fabric.Textbox) {
  const currentScaleX = textbox.scaleX || 1
  const baseWidth = textbox.width || 0
  if (currentScaleX !== 1 && baseWidth > 0) {
    textbox.set({
      width: Math.max(60, baseWidth * currentScaleX),
      scaleX: 1,
    })
  }

  if ((textbox.scaleY || 1) !== 1) {
    textbox.set({ scaleY: 1 })
  }

  textbox.setCoords()
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
  if (!canvas) return;

  fabric.Image.fromURL(imageSrc, (img) => {
    if (!canvas) return;

    const canvasWidth = canvas.width || props.width;
    const canvasHeight = canvas.height || props.height;

    const maxSize = 300;
    const scale = Math.min(
      maxSize / (img.width || 1),
      maxSize / (img.height || 1),
      1,
    );

    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    img.set({
      left: (canvasWidth - (img.width || 0) * scale) / 2,
      top: (canvasHeight - (img.height || 0) * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      crossOrigin: "anonymous",
      ...objectDefaults,
    });
    (img as any).imageId = imageId;
    (img as any).originalSrc = imageSrc;

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
  });
}

// Return active image object when selection is an image.
function getSelectedImage() {
  if (!canvas) return null;
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "image") {
    return activeObject as fabric.Image;
  }
  return null;
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
  return null;
}

// Return active text object when selection is a text.
function getSelectedText() {
  if (!canvas) return null
  const activeObject = canvas.getActiveObject()
  if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text')) {
    return activeObject as fabric.Textbox
  }
  return null
}

// Detect common representations of a fully transparent color.
function isTransparentColor(color: any) {
  if (!color) return true;
  if (typeof color !== "string") return false;
  const c = color.trim().toLowerCase();
  if (c === "transparent") return true;
  // rgba(.., 0) or rgba(...,0.0)
  if (/^rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(c)) return true;
  // #RRGGBBAA where AA == 00
  if (/^#[0-9a-f]{8}$/.test(c) && c.slice(7) === "00") return true;
  // #RGBA shorthand where A == 0
  if (/^#[0-9a-f]{4}$/.test(c) && c.slice(3) === "0") return true;
  return false;
}

// Replace selected image while preserving transform values.
function replaceSelectedImage(newImageSrc: string) {
  const selectedImage = getSelectedImage();
  if (!selectedImage || !canvas) return;

  const imageId = (selectedImage as any).imageId;
  const currentProps = {
    left: selectedImage.left,
    top: selectedImage.top,
    scaleX: selectedImage.scaleX,
    scaleY: selectedImage.scaleY,
    angle: selectedImage.angle,
  };

  fabric.Image.fromURL(newImageSrc, (newImg) => {
    if (!canvas) return;

    newImg.set({
      ...currentProps,
      crossOrigin: "anonymous",
      ...objectDefaults,
    });
    (newImg as any).imageId = imageId;
    (newImg as any).originalSrc = newImageSrc;

    canvas.remove(selectedImage);
    canvas.add(newImg);
    canvas.setActiveObject(newImg);
    canvas.renderAll();
  });
}

// Move selected image one step forward in object stack.
function bringSelectedImageForward() {
  if (!canvas) return false;
  const selectedImage = getSelectedImage();
  if (!selectedImage) return false;

  canvas.bringForward(selectedImage);
  canvas.renderAll();
  saveCanvas();
  return true;
}

// Move selected image one step backward in object stack.
function sendSelectedImageToBack() {
  if (!canvas) return false;
  const selectedImage = getSelectedImage();
  if (!selectedImage) return false;

  canvas.sendBackwards(selectedImage);
  canvas.renderAll();
  saveCanvas();
  return true;
}

// Move selected shape one step forward in object stack.
function bringSelectedShapeForward() {
  if (!canvas) return false;
  const selectedShape = getSelectedShape();
  if (!selectedShape) return false;

  canvas.bringForward(selectedShape);
  canvas.renderAll();
  saveCanvas();
  return true;
}

// Move selected shape one step backward in object stack.
function sendSelectedShapeToBack() {
  if (!canvas) return false;
  const selectedShape = getSelectedShape();
  if (!selectedShape) return false;

  canvas.sendBackwards(selectedShape);
  canvas.renderAll();
  saveCanvas();
  return true;
}

// Move selected text one step forward in object stack.
function bringSelectedTextForward() {
  if (!canvas) return false
  const selectedText = getSelectedText()
  if (!selectedText) return false

  canvas.bringForward(selectedText)
  canvas.renderAll()
  saveCanvas()
  return true
}

// Move selected text one step backward in object stack.
function sendSelectedTextToBack() {
  if (!canvas) return false
  const selectedText = getSelectedText()
  if (!selectedText) return false

  canvas.sendBackwards(selectedText)
  canvas.renderAll()
  saveCanvas()
  return true
}

// Sync selection context (image vs shape) with corresponding stores.
function handleSelection(e: any) {
  const selected = e.selected?.[0];
  if (selected && selected.type === "image") {
    const imageId = (selected as any).imageId || selected.cacheKey;
    if (imageId && props.blockIndex !== undefined) {
      imageCropStore.selectImage(imageId, props.blockIndex);
    }
    textFormatStore.clearTextFocus()
  } else if (selected && selected.type === 'textbox') {
    // Activate text formatting toolbar for Fabric textbox with multi-style support
    textFormatStore.setFabricTextbox(selected as fabric.Textbox, canvas)
    imageCropStore.clearSelection()
  } else if (selected && isArrowObject(selected)) {
    // Hide selection box for arrows - they show green endpoints instead
    selected.hasControls = false
    selected.hasBorders = false
    
    const fill = selected.stroke || '#000000'
    const width = selected.strokeWidth || 2
    const startStyle = (selected as any).arrowStartStyle || 'filled'
    const endStyle = (selected as any).arrowEndStyle || 'filled'
    
    shapeStore.updateStylesFromSelection(fill as string, fill as string, width as number, 'arrow')
    shapeStore.arrowStartStyle = startStyle
    shapeStore.arrowEndStyle = endStyle
    
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
    textFormatStore.clearTextFocus()
  }
}

// Clear shape/image selection state when selection is removed.
function handleSelectionCleared() {
  imageCropStore.clearSelection()
  shapeStore.clearShapeSelection()
  textFormatStore.setFabricTextbox(null, null)
}

// Keep text toolbar state synced while editing a Fabric textbox.
function handleTextboxStateUpdate(e: any) {
  const target = e?.target as fabric.Object | undefined
  if (!target || target.type !== 'textbox') return
  textFormatStore.updateFabricStatesFromObject(target as fabric.Textbox)
}

// Initialize Fabric canvas, events, and optional JSON restore.
onMounted(() => {
  if (!canvasElement.value) return;

  canvas = new fabric.Canvas(canvasElement.value, {
    width: props.width,
    height: props.height,
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
  });

  fabric.Object.prototype.controls.deleteControl = createDeleteControl()
  fabric.ActiveSelection.prototype.controls.deleteControl = createDeleteControl()
  fabric.Textbox.prototype.controls.deleteControl = createDeleteControl()

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
      
      // Calculate delta and check bounds
      let deltaX = currentLeft - lastLeft
      let deltaY = currentTop - lastTop
      
      const canvasWidth = canvas!.width || props.width
      const canvasHeight = canvas!.height || props.height
      
      // Calculate new positions
      const newStartX = start.x + deltaX
      const newStartY = start.y + deltaY
      const newEndX = end.x + deltaX
      const newEndY = end.y + deltaY
      
      // Get arrow head size to account for them when checking bounds
      const arrowHeadSize = Math.max(10, Math.min(20, 8 + (arrow.strokeWidth || 2) * 1.5))
      
      // Check if any endpoint would go out of bounds (using canvas edges as strict limits)
      let constrained = false
      
      // Check start point
      if (newStartX < 0 || newStartX > canvasWidth ||
          newStartY < 0 || newStartY > canvasHeight) {
        constrained = true
      }
      
      // Check end point
      if (newEndX < 0 || newEndX > canvasWidth ||
          newEndY < 0 || newEndY > canvasHeight) {
        constrained = true
      }
      
      if (constrained) {
        // Revert to last valid position
        arrow.left = lastLeft
        arrow.top = lastTop
        return
      }
      
      ;(arrow as any).arrowStart = { x: newStartX, y: newStartY }
      ;(arrow as any).arrowEnd = { x: newEndX, y: newEndY }
      ;(arrow as any).lastLeft = currentLeft
      ;(arrow as any).lastTop = currentTop
      
      return
    }

    const obj = e.target
    if (!obj || !canvas) return

    const canvasWidth = canvas.width || props.width;
    const canvasHeight = canvas.height || props.height;

    handleObjectMoving(obj, canvasWidth, canvasHeight);
  });

  canvas.on("object:scaling", (e) => {
    const obj = e.target;
    if (!obj || !canvas) return;

    const canvasWidth = canvas.width || props.width;
    const canvasHeight = canvas.height || props.height;

    if (obj.type === 'textbox') {
      normalizeTextboxScale(obj as fabric.Textbox)
    }

    handleObjectScaling(obj, canvasWidth, canvasHeight)
  })

  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', handleSelectionCleared)
  canvas.on('text:selection:changed', handleTextboxStateUpdate)
  canvas.on('text:editing:entered', handleTextboxStateUpdate)
  canvas.on('text:editing:exited', handleTextboxStateUpdate)
  canvas.on('text:changed', handleTextboxStateUpdate)

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
    
    const canvasWidth = canvas!.width || props.width
    const canvasHeight = canvas!.height || props.height
    
    // Constrain pointer within exact canvas bounds
    const constrainedX = Math.max(0, Math.min(pointer.x, canvasWidth))
    const constrainedY = Math.max(0, Math.min(pointer.y, canvasHeight))
    
    if (!arrowStartPoint) {
      arrowStartPoint = { x: constrainedX, y: constrainedY }
      arrowPreviewPointer = { x: constrainedX, y: constrainedY }
      canvas!.requestRenderAll()
    } else {
      const startPoint = { ...arrowStartPoint }
      const endPoint = { x: constrainedX, y: constrainedY }
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
      const canvasWidth = canvas!.width || props.width
      const canvasHeight = canvas!.height || props.height
      
      // Get arrow head size
      // Constrain pointer position within exact canvas bounds
      const constrainedX = Math.max(0, Math.min(pointer.x, canvasWidth))
      const constrainedY = Math.max(0, Math.min(pointer.y, canvasHeight))

      if (modifyingEnd === 'start') {
        ;(arrow as any).arrowStart = { x: constrainedX, y: constrainedY }
      } else {
        ;(arrow as any).arrowEnd = { x: constrainedX, y: constrainedY }
      }

      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }
      const startStyle = (arrow as any).arrowStartStyle || shapeStore.arrowStartStyle
      const endStyle = (arrow as any).arrowEndStyle || shapeStore.arrowEndStyle
      const dx = end.x - start.x
      const dy = end.y - start.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      if (distance > 5) {
        const arrowPathStr = generateArrowPath(start, end, startStyle, endStyle, arrow.strokeWidth || 2)

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
        ;(newArrow as any).arrowStartStyle = startStyle
        ;(newArrow as any).arrowEndStyle = endStyle

        canvas!.add(newArrow)
        modifyingArrow = newArrow
        canvas!.setActiveObject(newArrow)
        canvas!.renderAll()
      }
      return
    }

    if (!isDrawingArrow || !arrowStartPoint) return
    const canvasWidth = canvas!.width || props.width
    const canvasHeight = canvas!.height || props.height
    
    // Constrain preview pointer within exact canvas bounds
    arrowPreviewPointer = {
      x: Math.max(0, Math.min(pointer.x, canvasWidth)),
      y: Math.max(0, Math.min(pointer.y, canvasHeight))
    }
    canvas!.requestRenderAll()
  })

  // Draw filled arrow heads and endpoint circles.
  canvas.on('after:render', () => {
    const ctx = canvas!.getContext()
    
    // Draw filled triangles and outlines for all arrows
    const allObjects = canvas!.getObjects()
    for (const obj of allObjects) {
      if (isArrowObject(obj)) {
        const arrow = obj as fabric.Path
        const start = (arrow as any).arrowStart as { x: number; y: number }
        const end = (arrow as any).arrowEnd as { x: number; y: number }
        const startStyle = (arrow as any).arrowStartStyle || 'stroke'
        const endStyle = (arrow as any).arrowEndStyle || 'stroke'
        const color = arrow.stroke as string || shapeStore.fillColor
        const strokeWidth = arrow.strokeWidth || 2
        
        // Scale arrow head size based on stroke width (min 10, max 20)
        const arrowHeadSize = Math.max(10, Math.min(20, 8 + strokeWidth * 1.5))
        const dx = end.x - start.x
        const dy = end.y - start.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 5) continue // Skip if too short
        
        const angle = Math.atan2(dy, dx)
        
        // Draw end head (filled or outline) - directly at the endpoint
        if (endStyle === 'filled' || endStyle === 'open') {
          ctx.save()
          ctx.translate(end.x, end.y)
          ctx.rotate(angle)
          
          if (endStyle === 'filled') {
            ctx.fillStyle = color
            ctx.lineWidth = 0
            ctx.beginPath()
            ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
            ctx.lineTo(0, 0)
            ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
            ctx.closePath()
            ctx.fill()
          } else if (endStyle === 'open') {
            // Draw triangle outline with white fill to cover the body
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
          }
          ctx.restore()
        }
        
        // Draw start head (filled or outline) - directly at the start point
        if (startStyle === 'filled' || startStyle === 'open') {
          ctx.save()
          ctx.translate(start.x, start.y)
          ctx.rotate(angle + Math.PI) // Opposite direction for start
          
          if (startStyle === 'filled') {
            ctx.fillStyle = color
            ctx.lineWidth = 0
            ctx.beginPath()
            ctx.moveTo(-arrowHeadSize, -arrowHeadSize * 0.6)
            ctx.lineTo(0, 0)
            ctx.lineTo(-arrowHeadSize, arrowHeadSize * 0.6)
            ctx.closePath()
            ctx.fill()
          } else if (startStyle === 'open') {
            // Draw triangle outline with white fill to hide the body
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
          }
          ctx.restore()
        }
      }
    }
    
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
        if (obj.type === 'textbox') {
          ;(obj as fabric.Textbox).set({ lockScalingY: true })
          normalizeTextboxScale(obj as fabric.Textbox)
        }
        obj.setCoords()
        
        // Restore custom arrow properties after JSON deserialization
        if (jsonData.objects && jsonData.objects[index]) {
          const jsonObj = jsonData.objects[index]
          if (jsonObj.isArrow) {
            ;(obj as any).isArrow = jsonObj.isArrow
            ;(obj as any).arrowStart = jsonObj.arrowStart
            ;(obj as any).arrowEnd = jsonObj.arrowEnd
            ;(obj as any).arrowStartStyle = jsonObj.arrowStartStyle
            ;(obj as any).arrowEndStyle = jsonObj.arrowEndStyle
          }
        }
      })
      canvas?.renderAll()
      checkHasObjects()
    })
  } else {
    checkHasObjects();
  }
});

// Dispose canvas instance and global listeners.
onBeforeUnmount(() => {
  if (canvas) {
    canvas.dispose();
    canvas = null;
  }
  globalThis.removeEventListener("keydown", handleKeyDown);
});

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
    // Keep selection and eventing always enabled for drag and drop
    // Only toggle controls visibility based on active state
    canvas.forEachObject((obj: fabric.Object) => {
      obj.hasControls = isActive
      obj.hasBorders = isActive
    })
    
    if (!isActive) {
      canvas.discardActiveObject()
      imageCropStore.clearSelection()
    }
  }
});

// Apply fill updates from toolbar to selected shape.
watch(
  () => shapeStore.fillColor,
  (newColor) => {
    if (!canvas || !props.active) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    // Ignore images; styles apply only to geometric shapes.
    if (
      activeObject.type === "rect" ||
      activeObject.type === "circle" ||
      activeObject.type === "triangle"
    ) {
      // Prevent both fill and stroke being fully transparent at the same time.
      const otherColor = shapeStore.strokeColor;
      if (isTransparentColor(newColor) && isTransparentColor(otherColor)) {
        // Restore store value to the object's current fill (or sensible default).
        const fallback = (activeObject.fill as string) || "#000000";
        if (shapeStore.fillColor !== fallback) shapeStore.fillColor = fallback;
        errorPopup.show(
          "Impossible : le fond et le contour ne peuvent pas être tous deux transparents. Choisissez au moins une couleur non transparente.",
        );
        return;
      }

      // Avoid unnecessary render/save cycles.
      if (activeObject.fill !== newColor) {
        activeObject.set({ fill: newColor });
        canvas.renderAll();
        saveCanvas();
      }
    }
  }
);

// Apply stroke color updates from toolbar to selected shape.
watch(
  () => shapeStore.strokeColor,
  (newColor) => {
    if (!canvas || !props.active) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    // Ignore images; styles apply only to geometric shapes.
    if (
      activeObject.type === "rect" ||
      activeObject.type === "circle" ||
      activeObject.type === "triangle"
    ) {
      // Prevent both fill and stroke being fully transparent at the same time.
      const otherColor = shapeStore.fillColor;
      if (isTransparentColor(newColor) && isTransparentColor(otherColor)) {
        // Restore store value to the object's current stroke (or sensible default).
        const fallback = (activeObject.stroke as string) || "#1F2937";
        if (shapeStore.strokeColor !== fallback)
          shapeStore.strokeColor = fallback;
        errorPopup.show(
          "Impossible : le fond et le contour ne peuvent pas être tous deux transparents. Choisissez au moins une couleur non transparente.",
        );
        return;
      }

      // Avoid unnecessary render/save cycles.
      if (activeObject.stroke !== newColor) {
        activeObject.set({ stroke: newColor });
        canvas.renderAll();
        saveCanvas();
      }
    }
  }
);

// Apply stroke width updates from toolbar to selected shape.
watch(() => shapeStore.strokeWidth, (newWidth) => {
  if (!canvas || !props.active) return;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  if (isArrowObject(activeObject)) {
    const arrow = activeObject as fabric.Path;
    const start = (arrow as any).arrowStart as { x: number; y: number };
    const end = (arrow as any).arrowEnd as { x: number; y: number };
    const startStyle = (arrow as any).arrowStartStyle || shapeStore.arrowStartStyle;
    const endStyle = (arrow as any).arrowEndStyle || shapeStore.arrowEndStyle;

    // Regenerate arrow path with new stroke width
    const arrowPathStr = generateArrowPath(start, end, startStyle, endStyle, newWidth);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    canvas.remove(arrow);
    const newArrow = new fabric.Path(arrowPathStr, {
      stroke: (arrow as any).stroke || shapeStore.fillColor,
      strokeWidth: newWidth,
      fill: 'transparent',
      left: start.x,
      top: start.y,
      angle: angle,
      originX: 'left',
      originY: 'center',
      ...objectDefaults,
    });

    (newArrow as any).isArrow = true;
    (newArrow as any).arrowStart = start;
    (newArrow as any).arrowEnd = end;
    (newArrow as any).arrowStartStyle = startStyle;
    (newArrow as any).arrowEndStyle = endStyle;

    canvas.add(newArrow);
    canvas.setActiveObject(newArrow);
    canvas.renderAll();
    saveCanvas();
    return;
  }

  // Ignore images; styles apply only to geometric shapes.
  if (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') {
    // Avoid unnecessary render/save cycles.
    if (activeObject.strokeWidth !== newWidth) {
      activeObject.set({ strokeWidth: newWidth });
      canvas.renderAll();
      saveCanvas();
    }
  }
});

// Apply arrow start head style changes from toolbar
watch(() => shapeStore.arrowStartStyle, (newStyle) => {
  if (!canvas || !props.active) return
  
  const activeObject = canvas.getActiveObject()
  if (!activeObject || !isArrowObject(activeObject)) return

  const arrow = activeObject as fabric.Path
  const start = (arrow as any).arrowStart as { x: number; y: number }
  const end = (arrow as any).arrowEnd as { x: number; y: number }
  const endStyle = (arrow as any).arrowEndStyle || shapeStore.arrowEndStyle

  ;(arrow as any).arrowStartStyle = newStyle

  // Recreate the arrow with new path
  const arrowPathStr = generateArrowPath(start, end, newStyle, endStyle, arrow.strokeWidth || 2)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  canvas.remove(arrow)
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
  ;(newArrow as any).arrowStartStyle = newStyle
  ;(newArrow as any).arrowEndStyle = endStyle

  canvas.add(newArrow)
  canvas.setActiveObject(newArrow)
  canvas.renderAll()
  saveCanvas()
})

// Apply arrow end head style changes from toolbar
watch(() => shapeStore.arrowEndStyle, (newStyle) => {
  if (!canvas || !props.active) return
  
  const activeObject = canvas.getActiveObject()
  if (!activeObject || !isArrowObject(activeObject)) return

  const arrow = activeObject as fabric.Path
  const start = (arrow as any).arrowStart as { x: number; y: number }
  const end = (arrow as any).arrowEnd as { x: number; y: number }
  const startStyle = (arrow as any).arrowStartStyle || shapeStore.arrowStartStyle

  ;(arrow as any).arrowEndStyle = newStyle

  // Recreate the arrow with new path
  const arrowPathStr = generateArrowPath(start, end, startStyle, newStyle, arrow.strokeWidth || 2)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  canvas.remove(arrow)
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
  ;(newArrow as any).arrowStartStyle = startStyle
  ;(newArrow as any).arrowEndStyle = newStyle

  canvas.add(newArrow)
  canvas.setActiveObject(newArrow)
  canvas.renderAll()
  saveCanvas()
})

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
})
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
