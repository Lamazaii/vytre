import { fabric } from 'fabric'

export function createDeleteControl() {
  return new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderDeleteIcon
  })
}

function deleteObject(_eventData: MouseEvent, _transform: any) {
  const target = _transform.target
  const canvas = target.canvas

  if (target.type === 'activeSelection') {
    const activeSelection = target as fabric.ActiveSelection
    
    activeSelection.forEachObject((obj: fabric.Object) => {
      canvas.remove(obj)
    })
    
    canvas.discardActiveObject()
  } else {
    canvas.remove(target)
  }
  
  canvas.requestRenderAll()
  return true
}

function renderDeleteIcon(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: fabric.Object
) {
  const size = 20
  ctx.save()
  ctx.translate(left, top)
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0))
  
  ctx.beginPath()
  ctx.arc(0, 0, size / 2, 0, 2 * Math.PI)
  ctx.fillStyle = '#DC2626'
  ctx.fill()

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  const crossSize = size * 0.4
  ctx.beginPath()
  ctx.moveTo(-crossSize / 2, -crossSize / 2)
  ctx.lineTo(crossSize / 2, crossSize / 2)
  ctx.moveTo(crossSize / 2, -crossSize / 2)
  ctx.lineTo(-crossSize / 2, crossSize / 2)
  ctx.stroke()
  
  ctx.restore()
}

export function deleteSelectedObjects(canvas: fabric.Canvas | null) {
  if (!canvas) return
  const activeObject = canvas.getActiveObject()
  if (!activeObject) return

  if (activeObject.type === 'activeSelection') {
    const activeSelection = activeObject as fabric.ActiveSelection

    activeSelection.forEachObject((obj: fabric.Object) => {
      canvas?.remove(obj)
    })

    canvas.discardActiveObject()
  } else {
    canvas.remove(activeObject)
  }

  canvas.requestRenderAll()
}
