import { watch, type Ref } from 'vue'
import { fabric } from 'fabric'
import { useShapeStore } from '../../../../stores/shapeStore'
import { useErrorPopupStore } from '../../../../stores/errorPopupStore'
import { objectDefaults } from '../utils/canvasConfig'
import { isArrowObject, generateArrowPath } from './useArrows'

// Checks if a color is transparent
function isTransparentColor(color: any) {
  if (!color) return true
  if (typeof color !== 'string') return false
  const c = color.trim().toLowerCase()
  if (c === 'transparent') return true
  if (/^rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(c)) return true
  if (/^#[0-9a-f]{8}$/.test(c) && c.slice(7) === '00') return true
  if (/^#[0-9a-f]{4}$/.test(c) && c.slice(3) === '0') return true
  return false
}

// Composable for managing shapes (rect, circle, triangle) on the canvas
export function useShapes(
  canvasRef: Ref<fabric.Canvas | null>,
  props: { width: number; height: number; active: boolean },
  saveCanvas: () => void
) {
  const shapeStore = useShapeStore()
  const errorPopup = useErrorPopupStore()

  // Returns the currently selected shape or arrow, or null if none
  function getSelectedShape() {
    if (!canvasRef.value) return null
    const activeObject = canvasRef.value.getActiveObject()
    if (
      activeObject &&
      (activeObject.type === 'rect' ||
        activeObject.type === 'circle' ||
        activeObject.type === 'triangle' ||
        isArrowObject(activeObject))
    ) {
      return activeObject as fabric.Object
    }
    return null
  }

  // Creates a shape of the given type centered on the canvas
  function createShape(type: 'rect' | 'circle' | 'triangle') {
    if (!canvasRef.value) return

    const canvasWidth = canvasRef.value.width || props.width
    const canvasHeight = canvasRef.value.height || props.height
    let shape: fabric.Object

    if (type === 'rect') {
      const size = 100
      shape = new fabric.Rect({
        left: (canvasWidth - size) / 2,
        top: (canvasHeight - size) / 2,
        width: size,
        height: size,
        fill: shapeStore.fillColor,
        stroke: shapeStore.strokeColor,
        strokeWidth: shapeStore.strokeWidth,
        ...objectDefaults,
      })
    } else if (type === 'circle') {
      const radius = 50
      shape = new fabric.Circle({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        radius: radius,
        fill: shapeStore.fillColor,
        stroke: shapeStore.strokeColor,
        strokeWidth: shapeStore.strokeWidth,
        originX: 'center',
        originY: 'center',
        ...objectDefaults,
      })
    } else {
      const size = 100
      shape = new fabric.Triangle({
        left: (canvasWidth - size) / 2,
        top: (canvasHeight - size) / 2,
        width: size,
        height: size,
        fill: shapeStore.fillColor,
        stroke: shapeStore.strokeColor,
        strokeWidth: shapeStore.strokeWidth,
        ...objectDefaults,
      })
    }

    canvasRef.value.add(shape)
    canvasRef.value.setActiveObject(shape)
    canvasRef.value.renderAll()
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

  // Watch fill color changes and apply to selected shape
  watch(
    () => shapeStore.fillColor,
    (newColor) => {
      if (!canvasRef.value || !props.active) return

      const activeObject = canvasRef.value.getActiveObject()
      if (!activeObject) return

      if (
        activeObject.type === 'rect' ||
        activeObject.type === 'circle' ||
        activeObject.type === 'triangle'
      ) {
        // Prevent both fill and stroke from being transparent
        const otherColor = shapeStore.strokeColor
        if (isTransparentColor(newColor) && isTransparentColor(otherColor)) {
          const fallback = (activeObject.fill as string) || '#000000'
          if (shapeStore.fillColor !== fallback) shapeStore.fillColor = fallback
          errorPopup.show(
            'Impossible : le fond et le contour ne peuvent pas être tous deux transparents. Choisissez au moins une couleur non transparente.'
          )
          return
        }

        if (activeObject.fill !== newColor) {
          activeObject.set({ fill: newColor })
          canvasRef.value.renderAll()
          saveCanvas()
        }
      }
    }
  )

  // Watch stroke color changes and apply to selected shape
  watch(
    () => shapeStore.strokeColor,
    (newColor) => {
      if (!canvasRef.value || !props.active) return

      const activeObject = canvasRef.value.getActiveObject()
      if (!activeObject) return

      if (
        activeObject.type === 'rect' ||
        activeObject.type === 'circle' ||
        activeObject.type === 'triangle'
      ) {
        // Prevent both fill and stroke from being transparent
        const otherColor = shapeStore.fillColor
        if (isTransparentColor(newColor) && isTransparentColor(otherColor)) {
          const fallback = (activeObject.stroke as string) || '#1F2937'
          if (shapeStore.strokeColor !== fallback) shapeStore.strokeColor = fallback
          errorPopup.show(
            'Impossible : le fond et le contour ne peuvent pas être tous deux transparents. Choisissez au moins une couleur non transparente.'
          )
          return
        }

        if (activeObject.stroke !== newColor) {
          activeObject.set({ stroke: newColor })
          canvasRef.value.renderAll()
          saveCanvas()
        }
      }
    }
  )

  // Watch stroke width changes and apply to selected shape or arrow
  watch(() => shapeStore.strokeWidth, (newWidth) => {
    if (!canvasRef.value || !props.active) return
    const activeObject = canvasRef.value.getActiveObject()
    if (!activeObject) return

    // Handle arrow stroke width change (recreate arrow with new width)
    if (isArrowObject(activeObject)) {
      const arrow = activeObject as fabric.Path
      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }
      const startStyle = (arrow as any).arrowStartStyle || shapeStore.arrowStartStyle
      const endStyle = (arrow as any).arrowEndStyle || shapeStore.arrowEndStyle

      const arrowPathStr = generateArrowPath(start, end, startStyle, endStyle, newWidth)
      const dx = end.x - start.x
      const dy = end.y - start.y
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      canvasRef.value.remove(arrow)
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
      })

      ;(newArrow as any).isArrow = true
      ;(newArrow as any).arrowStart = start
      ;(newArrow as any).arrowEnd = end
      ;(newArrow as any).arrowStartStyle = startStyle
      ;(newArrow as any).arrowEndStyle = endStyle

      canvasRef.value.add(newArrow)
      canvasRef.value.setActiveObject(newArrow)
      canvasRef.value.renderAll()
      saveCanvas()
      return
    }

    // Handle regular shape stroke width change
    if (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') {
      if (activeObject.strokeWidth !== newWidth) {
        activeObject.set({ strokeWidth: newWidth })
        canvasRef.value.renderAll()
        saveCanvas()
      }
    }
  })

  return {
    addSquare,
    addCircle,
    addTriangle,
    getSelectedShape,
  }
}