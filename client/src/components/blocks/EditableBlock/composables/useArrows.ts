import { ref, watch, type Ref } from 'vue'
import { fabric } from 'fabric'
import { useShapeStore } from '../../../../stores/shapeStore'
import { objectDefaults, arrowDefaults } from '../utils/canvasConfig'

export function isArrowObject(obj: fabric.Object): obj is fabric.Path {
  return obj.type === 'path' && (obj as any).isArrow === true
}

export function generateArrowPath(
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
  
  // Draw the complete line from start to end
  return `M 0,0 L ${distance},0`
}

export function useArrows(
  canvasRef: Ref<fabric.Canvas | null>,
  props: { width: number; height: number; active: boolean },
  saveCanvas: () => void
) {
  const shapeStore = useShapeStore()
  
  const isDrawingArrow = ref(false)
  const arrowStartPoint = ref<{ x: number; y: number } | null>(null)
  const arrowPreviewPointer = ref<{ x: number; y: number } | null>(null)
  
  const modifyingArrow = ref<fabric.Path | null>(null)
  const modifyingEnd = ref<'start' | 'end' | null>(null)
  const isModifyingEndpoint = ref(false)

  function createArrowBetweenPoints(start: { x: number; y: number }, end: { x: number; y: number }) {
    if (!canvasRef.value) return

    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 5) return

    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    const arrowPath = generateArrowPath(start, end, shapeStore.arrowStartStyle, shapeStore.arrowEndStyle, shapeStore.strokeWidth)

    const arrow = new fabric.Path(arrowPath, {
      stroke: 'rgba(0,0,0,0)',
      strokeWidth: shapeStore.strokeWidth,
      fill: 'transparent',
      left: start.x,
      top: start.y,
      angle: angle,
      originX: 'left',
      originY: 'center',
      ...arrowDefaults,
    })

    ;(arrow as any).isArrow = true
    ;(arrow as any).arrowStart = start
    ;(arrow as any).arrowEnd = end
    ;(arrow as any).arrowStartStyle = shapeStore.arrowStartStyle
    ;(arrow as any).arrowEndStyle = shapeStore.arrowEndStyle
    const requestedColor = shapeStore.fillColor
    ;(arrow as any).arrowColor = (!requestedColor || requestedColor === 'transparent' || requestedColor === 'rgba(0,0,0,0)') ? '#000000' : requestedColor

    canvasRef.value.add(arrow)
    canvasRef.value.setActiveObject(arrow)
    canvasRef.value.renderAll()
  }

  function addArrow() {
    if (!canvasRef.value) return
    
    const canvasWidth = canvasRef.value.width || props.width
    const canvasHeight = canvasRef.value.height || props.height
    
    const defaultStart = { x: canvasWidth * 0.35, y: canvasHeight * 0.5 }
    const defaultEnd = { x: canvasWidth * 0.65, y: canvasHeight * 0.5 }
    
    createArrowBetweenPoints(defaultStart, defaultEnd)
  }

  function handleArrowMouseDown(e: any) {
    if (!canvasRef.value) return
    const pointer = canvasRef.value.getPointer(e.e)
    const allObjects = canvasRef.value.getObjects()
    const tolerance = 15 // Increased tolerance for better endpoint selection
    
    for (const obj of allObjects) {
      if (isArrowObject(obj)) {
        const arrow = obj as fabric.Path
        const start = (arrow as any).arrowStart as { x: number; y: number }
        const end = (arrow as any).arrowEnd as { x: number; y: number }

        if (!start || !end) continue // Skip if coordinates are missing

        const distToStart = Math.sqrt((pointer.x - start.x) ** 2 + (pointer.y - start.y) ** 2)
        const distToEnd = Math.sqrt((pointer.x - end.x) ** 2 + (pointer.y - end.y) ** 2)

        if (distToStart < tolerance) {
          modifyingArrow.value = arrow
          modifyingEnd.value = 'start'
          isModifyingEndpoint.value = true
          canvasRef.value.discardActiveObject()
          canvasRef.value.setActiveObject(arrow)
          canvasRef.value.renderAll()
          return true
        }
        if (distToEnd < tolerance) {
          modifyingArrow.value = arrow
          modifyingEnd.value = 'end'
          isModifyingEndpoint.value = true
          canvasRef.value.discardActiveObject()
          canvasRef.value.setActiveObject(arrow)
          canvasRef.value.renderAll()
          return true
        }
      }
    }

    if (!isDrawingArrow.value || e.e.button !== 0) return false
    
    const canvasWidth = canvasRef.value.width || props.width
    const canvasHeight = canvasRef.value.height || props.height
    
    const constrainedX = Math.max(0, Math.min(pointer.x, canvasWidth))
    const constrainedY = Math.max(0, Math.min(pointer.y, canvasHeight))
    
    if (!arrowStartPoint.value) {
      arrowStartPoint.value = { x: constrainedX, y: constrainedY }
      arrowPreviewPointer.value = { x: constrainedX, y: constrainedY }
      canvasRef.value.requestRenderAll()
      return true
    } else {
      const startPoint = { ...arrowStartPoint.value }
      const endPoint = { x: constrainedX, y: constrainedY }
      isDrawingArrow.value = false
      arrowStartPoint.value = null
      arrowPreviewPointer.value = null
      canvasRef.value.defaultCursor = 'default'
      canvasRef.value.hoverCursor = 'move'
      canvasRef.value.selection = props.active
      createArrowBetweenPoints(startPoint, endPoint)
      return true
    }
  }

  function handleArrowMouseMove(e: any) {
    if (!canvasRef.value) return
    const pointer = canvasRef.value.getPointer(e.e)
    const tolerance = 15 // Increased tolerance for better endpoint detection

    let nearEndpoint = false
    const allObjects = canvasRef.value.getObjects()
    for (const obj of allObjects) {
      if (isArrowObject(obj)) {
        const arrow = obj as fabric.Path
        const start = (arrow as any).arrowStart as { x: number; y: number }
        const end = (arrow as any).arrowEnd as { x: number; y: number }

        if (!start || !end) continue // Skip if coordinates are missing

        const distToStart = Math.sqrt((pointer.x - start.x) ** 2 + (pointer.y - start.y) ** 2)
        const distToEnd = Math.sqrt((pointer.x - end.x) ** 2 + (pointer.y - end.y) ** 2)

        if (distToStart < tolerance || distToEnd < tolerance) {
          nearEndpoint = true
          break
        }
      }
    }

    if (!isDrawingArrow.value) {
      canvasRef.value.defaultCursor = nearEndpoint ? 'crosshair' : 'default'
    }

    if (modifyingArrow.value && modifyingEnd.value) {
      const arrow = modifyingArrow.value
      const canvasWidth = canvasRef.value.width || props.width
      const canvasHeight = canvasRef.value.height || props.height
      
      const constrainedX = Math.max(0, Math.min(pointer.x, canvasWidth))
      const constrainedY = Math.max(0, Math.min(pointer.y, canvasHeight))

      if (modifyingEnd.value === 'start') {
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

        // Set path first so _setPositionDimensions recalculates width/height/pathOffset
        arrow.set('path', (fabric.util as any).parsePath(arrowPathStr))
        // Then override position with the correct values
        arrow.set({ left: start.x, top: start.y, angle: angle })
        // Force cache regeneration — without this, the object renders in its old (smaller) cached bbox
        arrow.dirty = true
        arrow.setCoords()
        canvasRef.value.renderAll()
      }
      return true
    }

    if (!isDrawingArrow.value || !arrowStartPoint.value) return false
    const canvasWidth = canvasRef.value.width || props.width
    const canvasHeight = canvasRef.value.height || props.height
    
    arrowPreviewPointer.value = {
      x: Math.max(0, Math.min(pointer.x, canvasWidth)),
      y: Math.max(0, Math.min(pointer.y, canvasHeight))
    }
    canvasRef.value.requestRenderAll()
    return true
  }

  function handleArrowMouseUp() {
    if (modifyingArrow.value && modifyingEnd.value) {
      // Clean up selection to avoid multi-selection
      canvasRef.value?.discardActiveObject()
      canvasRef.value?.setActiveObject(modifyingArrow.value)
      canvasRef.value?.renderAll()
      saveCanvas()
    }
    isModifyingEndpoint.value = false
    modifyingArrow.value = null
    modifyingEnd.value = null
  }

  function handleArrowRender(ctx: CanvasRenderingContext2D) {
    if (!canvasRef.value) return

    const allObjects = canvasRef.value.getObjects()
    for (const obj of allObjects) {
      if (isArrowObject(obj)) {
        const arrow = obj as fabric.Path
        const start = (arrow as any).arrowStart as { x: number; y: number }
        const end = (arrow as any).arrowEnd as { x: number; y: number }
        const startStyle = (arrow as any).arrowStartStyle || 'stroke'
        const endStyle = (arrow as any).arrowEndStyle || 'stroke'
        const color = (arrow as any).arrowColor || '#000000'
        const strokeWidth = arrow.strokeWidth || 2
        
        const arrowHeadSize = Math.max(10, Math.min(20, 8 + strokeWidth * 1.5))
        const dx = end.x - start.x
        const dy = end.y - start.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 5) continue

        const angle = Math.atan2(dy, dx)

        // Shorten line to stop at the base of each arrowhead
        const startOffset = startStyle !== 'none' ? arrowHeadSize : 0
        const endOffset = endStyle !== 'none' ? arrowHeadSize : 0
        const lineStartX = start.x + Math.cos(angle) * startOffset
        const lineStartY = start.y + Math.sin(angle) * startOffset
        const lineEndX = end.x - Math.cos(angle) * endOffset
        const lineEndY = end.y - Math.sin(angle) * endOffset

        // Draw the main line (ensures visibility regardless of Fabric path rendering limits)
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'butt'
        ctx.beginPath()
        ctx.moveTo(lineStartX, lineStartY)
        ctx.lineTo(lineEndX, lineEndY)
        ctx.stroke()
        ctx.restore()

        // Draw END arrow head (all styles)
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
        
        // Draw START arrow head (all styles)
        ctx.save()
        ctx.translate(start.x, start.y)
        ctx.rotate(angle + Math.PI)
        
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
    
    const activeObj = canvasRef.value.getActiveObject()
    if (activeObj && isArrowObject(activeObj)) {
      const arrow = activeObj as fabric.Path
      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }

      ctx.fillStyle = 'rgba(102, 153, 255, 1)'
      ctx.strokeStyle = 'rgba(102, 153, 255, 1)'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(end.x, end.y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    if (!isDrawingArrow.value || !arrowStartPoint.value || !arrowPreviewPointer.value) return
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(arrowStartPoint.value.x, arrowStartPoint.value.y)
    ctx.lineTo(arrowPreviewPointer.value.x, arrowPreviewPointer.value.y)
    ctx.strokeStyle = shapeStore.fillColor
    ctx.lineWidth = shapeStore.strokeWidth
    ctx.lineCap = 'round'
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.restore()
  }

  function handleArrowMoving(e: any) {
    if (!canvasRef.value) return false
    if (isModifyingEndpoint.value) return true // Prevent normal movement during endpoint modification
    if (e.target && isArrowObject(e.target)) {
      const arrow = e.target as fabric.Path
      const start = (arrow as any).arrowStart as { x: number; y: number }
      const end = (arrow as any).arrowEnd as { x: number; y: number }
      
      if ((arrow as any).lastLeft === undefined) {
        ;(arrow as any).lastLeft = arrow.left || 0
        ;(arrow as any).lastTop = arrow.top || 0
      }
      
      const currentLeft = arrow.left || 0
      const currentTop = arrow.top || 0
      const lastLeft = (arrow as any).lastLeft || 0
      const lastTop = (arrow as any).lastTop || 0
      
      const deltaX = currentLeft - lastLeft
      const deltaY = currentTop - lastTop
      
      const canvasWidth = canvasRef.value.width || props.width
      const canvasHeight = canvasRef.value.height || props.height
      
      const newStartX = start.x + deltaX
      const newStartY = start.y + deltaY
      const newEndX = end.x + deltaX
      const newEndY = end.y + deltaY
      
      let constrained = false
      if (newStartX < 0 || newStartX > canvasWidth || newStartY < 0 || newStartY > canvasHeight) constrained = true
      if (newEndX < 0 || newEndX > canvasWidth || newEndY < 0 || newEndY > canvasHeight) constrained = true
      
      if (constrained) {
        arrow.left = lastLeft
        arrow.top = lastTop
        return true
      }
      
      ;(arrow as any).arrowStart = { x: newStartX, y: newStartY }
      ;(arrow as any).arrowEnd = { x: newEndX, y: newEndY }
      ;(arrow as any).lastLeft = currentLeft
      ;(arrow as any).lastTop = currentTop
      
      return true
    }
    return false
  }

  function handleArrowModified(e: any) {
    if (isModifyingEndpoint.value) return // Skip normal modification handling during endpoint edit
    if (e.target && isArrowObject(e.target)) {
      const arrow = e.target as fabric.Path
      ;(arrow as any).lastLeft = undefined
      ;(arrow as any).lastTop = undefined
    }
  }

  watch(() => shapeStore.arrowStartStyle, (newStyle) => {
    if (!canvasRef.value || !props.active) return
    const activeObject = canvasRef.value.getActiveObject()
    if (!activeObject || !isArrowObject(activeObject)) return

    const arrow = activeObject as fabric.Path
    const start = (arrow as any).arrowStart as { x: number; y: number }
    const end = (arrow as any).arrowEnd as { x: number; y: number }
    const endStyle = (arrow as any).arrowEndStyle || shapeStore.arrowEndStyle

    ;(arrow as any).arrowStartStyle = newStyle
    const arrowPathStr = generateArrowPath(start, end, newStyle, endStyle, arrow.strokeWidth || 2)
    const dx = end.x - start.x
    const dy = end.y - start.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    arrow.set('path', (fabric.util as any).parsePath(arrowPathStr))
    arrow.set({ left: start.x, top: start.y, angle: angle })
    arrow.dirty = true
    arrow.setCoords()
    canvasRef.value.renderAll()
    saveCanvas()
  })

  watch(() => shapeStore.arrowEndStyle, (newStyle) => {
    if (!canvasRef.value || !props.active) return
    const activeObject = canvasRef.value.getActiveObject()
    if (!activeObject || !isArrowObject(activeObject)) return

    const arrow = activeObject as fabric.Path
    const start = (arrow as any).arrowStart as { x: number; y: number }
    const end = (arrow as any).arrowEnd as { x: number; y: number }
    const startStyle = (arrow as any).arrowStartStyle || shapeStore.arrowStartStyle

    ;(arrow as any).arrowEndStyle = newStyle
    const arrowPathStr = generateArrowPath(start, end, startStyle, newStyle, arrow.strokeWidth || 2)
    const dx = end.x - start.x
    const dy = end.y - start.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    arrow.set('path', (fabric.util as any).parsePath(arrowPathStr))
    arrow.set({ left: start.x, top: start.y, angle: angle })
    arrow.dirty = true
    arrow.setCoords()
    canvasRef.value.renderAll()
    saveCanvas()
  })

  watch(() => shapeStore.fillColor, (newColor) => {
    if (!canvasRef.value || !props.active) return
    const activeObject = canvasRef.value.getActiveObject()
    if (!activeObject || !isArrowObject(activeObject)) return

    ;(activeObject as any).arrowColor = (!newColor || newColor === 'transparent' || newColor === 'rgba(0,0,0,0)') ? '#000000' : newColor
    canvasRef.value.renderAll()
    saveCanvas()
  })

  function resetArrowDrawingState() {
    isDrawingArrow.value = false
    arrowStartPoint.value = null
    arrowPreviewPointer.value = null
    modifyingArrow.value = null
    modifyingEnd.value = null
    isModifyingEndpoint.value = false
  }

  return {
    addArrow,
    isDrawingArrow,
    handleArrowMouseDown,
    handleArrowMouseMove,
    handleArrowMouseUp,
    handleArrowRender,
    handleArrowMoving,
    handleArrowModified,
    resetArrowDrawingState,
  }
}