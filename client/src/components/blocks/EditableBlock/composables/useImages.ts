import { type Ref } from 'vue'
import { fabric } from 'fabric'
import { objectDefaults } from '../utils/canvasConfig'

export function useImages(
  canvasRef: Ref<fabric.Canvas | null>,
  props: { width: number; height: number; active: boolean }
) {
  function getSelectedImage() {
    if (!canvasRef.value) return null
    const activeObject = canvasRef.value.getActiveObject()
    if (activeObject && activeObject.type === 'image') {
      return activeObject as fabric.Image
    }
    return null
  }

  function addImage(imageSrc: string) {
    if (!canvasRef.value) return

    fabric.Image.fromURL(imageSrc, (img) => {
      if (!canvasRef.value) return

      const canvasWidth = canvasRef.value.width || props.width
      const canvasHeight = canvasRef.value.height || props.height

      const maxSize = 300
      const scale = Math.min(
        maxSize / (img.width || 1),
        maxSize / (img.height || 1),
        1,
      )

      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      img.set({
        left: (canvasWidth - (img.width || 0) * scale) / 2,
        top: (canvasHeight - (img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        crossOrigin: 'anonymous',
        ...objectDefaults,
      })
      ;(img as any).imageId = imageId
      ;(img as any).originalSrc = imageSrc

      canvasRef.value.add(img)
      canvasRef.value.setActiveObject(img)
      canvasRef.value.renderAll()
    })
  }

  function replaceSelectedImage(newImageSrc: string) {
    const selectedImage = getSelectedImage()
    if (!selectedImage || !canvasRef.value) return

    const imageId = (selectedImage as any).imageId
    const currentProps = {
      left: selectedImage.left,
      top: selectedImage.top,
      scaleX: selectedImage.scaleX,
      scaleY: selectedImage.scaleY,
      angle: selectedImage.angle,
    }

    fabric.Image.fromURL(newImageSrc, (newImg) => {
      if (!canvasRef.value) return

      newImg.set({
        ...currentProps,
        crossOrigin: 'anonymous',
        ...objectDefaults,
      })
      ;(newImg as any).imageId = imageId
      ;(newImg as any).originalSrc = newImageSrc

      canvasRef.value.remove(selectedImage)
      canvasRef.value.add(newImg)
      canvasRef.value.setActiveObject(newImg)
      canvasRef.value.renderAll()
    })
  }

  return {
    getSelectedImage,
    addImage,
    replaceSelectedImage,
  }
}