import { type Ref } from 'vue'
import { fabric } from 'fabric'
import { useImageCropStore } from '../../../../stores/imageCropStore'
import { useShapeStore } from '../../../../stores/shapeStore'
import { useTextFormatStore } from '../../../../stores/textFormatStore'
import { isArrowObject } from './useArrows'

export function useSelection(
  canvasRef: Ref<fabric.Canvas | null>,
  props: { blockIndex?: number }
) {
  const imageCropStore = useImageCropStore()
  const shapeStore = useShapeStore()
  const textFormatStore = useTextFormatStore()

  function handleSelection(e: any) {
    const selected = e.selected?.[0]
    if (selected && selected.type === 'image') {
      const imageId = (selected as any).imageId || selected.cacheKey
      if (imageId && props.blockIndex !== undefined) {
        imageCropStore.selectImage(imageId, props.blockIndex)
      }
      textFormatStore.clearTextFocus()
    } else if (selected && selected.type === 'textbox') {
      textFormatStore.setFabricTextbox(selected as fabric.Textbox, canvasRef.value)
      imageCropStore.clearSelection()
    } else if (selected && isArrowObject(selected)) {
      selected.hasControls = false
      selected.hasBorders = false
      
      const fill = (selected as any).arrowColor || (selected.stroke as string) || '#000000'
      const width = selected.strokeWidth || 2
      const startStyle = (selected as any).arrowStartStyle || 'filled'
      const endStyle = (selected as any).arrowEndStyle || 'filled'
      
      shapeStore.updateStylesFromSelection(fill as string, fill as string, width as number, 'arrow')
      shapeStore.arrowStartStyle = startStyle
      shapeStore.arrowEndStyle = endStyle
      
      imageCropStore.clearSelection()
      textFormatStore.clearTextFocus()
    } else if (selected && (selected.type === 'rect' || selected.type === 'circle' || selected.type === 'triangle')) {
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

  function handleSelectionCleared() {
    imageCropStore.clearSelection()
    shapeStore.clearShapeSelection()
    textFormatStore.setFabricTextbox(null, null)
  }

  return {
    handleSelection,
    handleSelectionCleared,
  }
}