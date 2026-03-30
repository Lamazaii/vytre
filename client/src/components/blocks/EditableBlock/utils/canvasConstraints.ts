import { fabric } from 'fabric'

export function constrainObjectPosition(
  obj: fabric.Object,
  canvasWidth: number,
  canvasHeight: number,
  radius: number
) {
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

export function handleObjectMoving(
  obj: fabric.Object,
  canvasWidth: number,
  canvasHeight: number
) {
  const objWidth = (obj.width || 0) * (obj.scaleX || 1)
  const objHeight = (obj.height || 0) * (obj.scaleY || 1)

  const radius = (obj as fabric.Circle).radius || 0
  const scaledRadius = radius * (obj.scaleX || 1)

  if (obj.left !== undefined) {
    if (radius > 0) {
      obj.left = Math.max(scaledRadius, Math.min(obj.left, canvasWidth - scaledRadius))
    } else {
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
}

export function handleObjectScaling(
  obj: fabric.Object,
  canvasWidth: number,
  canvasHeight: number
) {
  const radius = (obj as fabric.Circle).radius || 0
  if (radius > 0) {
    const left = obj.left || 0
    const top = obj.top || 0

    // Cap scale based on available space from object position to canvas edges
    const maxScaleX = Math.min(left, canvasWidth - left) / radius
    const maxScaleY = Math.min(top, canvasHeight - top) / radius

    if (obj.scaleX && obj.scaleX > maxScaleX) {
      obj.scaleX = maxScaleX
    }
    if (obj.scaleY && obj.scaleY > maxScaleY) {
      obj.scaleY = maxScaleY
    }
  } else {
    const objWidth = (obj.width || 0) * (obj.scaleX || 1)
    const objHeight = (obj.height || 0) * (obj.scaleY || 1)

    if (obj.scaleX && objWidth > canvasWidth) {
      obj.scaleX = canvasWidth / (obj.width || 1)
    }
    if (obj.scaleY && objHeight > canvasHeight) {
      obj.scaleY = canvasHeight / (obj.height || 1)
    }
  }

  constrainObjectPosition(obj, canvasWidth, canvasHeight, radius)
}
