import { type Ref } from 'vue'
import { fabric } from 'fabric'
import { useTextFormatStore } from '../../../../stores/textFormatStore'
import { objectDefaults } from '../utils/canvasConfig'
import { handleObjectMoving } from '../utils/canvasConstraints'

export function useText(
  canvasRef: Ref<fabric.Canvas | null>,
  props: { width: number; height: number; active: boolean }
) {
  const textFormatStore = useTextFormatStore()

  function getSelectedText() {
    if (!canvasRef.value) return null
    const activeObject = canvasRef.value.getActiveObject()
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text')) {
      return activeObject as fabric.Textbox
    }
    return null
  }

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

  function addTextZone() {
    if (!canvasRef.value) return

    const canvasWidth = canvasRef.value.width || props.width
    const canvasHeight = canvasRef.value.height || props.height
    const text = new fabric.Textbox('Nouvelle zone de texte', {
      left: 0,
      top: 0,
      width: Math.min(280, Math.max(180, canvasWidth - 40)),
      fontSize: 18,
      fill: '#111827',
      fontFamily: 'Arial',
      ...objectDefaults,
    })

    ;(text as any).lockScalingY = true

    const textWidth = (text.width || 0) * (text.scaleX || 1)
    const textHeight = (text.height || 0) * (text.scaleY || 1)
    text.set({
      left: Math.max(0, (canvasWidth - textWidth) / 2),
      top: Math.max(0, (canvasHeight - textHeight) / 2),
    })

    canvasRef.value.add(text)
    handleObjectMoving(text, canvasWidth, canvasHeight)
    text.setCoords()
    canvasRef.value.setActiveObject(text)
    text.enterEditing()
    text.selectAll()
    canvasRef.value.renderAll()
  }

  function handleTextboxStateUpdate(e: any) {
    const target = e?.target as fabric.Object | undefined
    if (!target || target.type !== 'textbox') return
    textFormatStore.updateFabricStatesFromObject(target as fabric.Textbox)
  }

  return {
    getSelectedText,
    addTextZone,
    normalizeTextboxScale,
    handleTextboxStateUpdate,
  }
}