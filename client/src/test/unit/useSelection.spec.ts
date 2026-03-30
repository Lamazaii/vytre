import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('fabric', () => ({
  fabric: {},
}))

import { useSelection } from '../../components/blocks/EditableBlock/composables/useSelection'
import { useImageCropStore } from '../../stores/imageCropStore'
import { useShapeStore } from '../../stores/shapeStore'
import { useTextFormatStore } from '../../stores/textFormatStore'

function makeCanvas(activeObject: any = null) {
  return {
    getActiveObject: vi.fn().mockReturnValue(activeObject),
  }
}

describe('useSelection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('handleSelection – image', () => {
    it('calls imageCropStore.selectImage when an image is selected', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 3 })
      const imageCropStore = useImageCropStore()
      const selectSpy = vi.spyOn(imageCropStore, 'selectImage')

      handleSelection({ selected: [{ type: 'image', imageId: 'img-1', cacheKey: 'ck' }] })

      expect(selectSpy).toHaveBeenCalledWith('img-1', 3)
    })

    it('falls back to cacheKey when imageId is missing', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const imageCropStore = useImageCropStore()
      const selectSpy = vi.spyOn(imageCropStore, 'selectImage')

      handleSelection({ selected: [{ type: 'image', cacheKey: 'ck-2' }] })

      expect(selectSpy).toHaveBeenCalledWith('ck-2', 0)
    })

    it('clears text focus when image is selected', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const textFormatStore = useTextFormatStore()
      const clearSpy = vi.spyOn(textFormatStore, 'clearTextFocus')

      handleSelection({ selected: [{ type: 'image', imageId: 'img-x', cacheKey: 'ck' }] })

      expect(clearSpy).toHaveBeenCalled()
    })

    it('does not call selectImage when blockIndex is undefined', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, {})
      const imageCropStore = useImageCropStore()
      const selectSpy = vi.spyOn(imageCropStore, 'selectImage')

      handleSelection({ selected: [{ type: 'image', imageId: 'img-1' }] })

      expect(selectSpy).not.toHaveBeenCalled()
    })
  })

  describe('handleSelection – textbox', () => {
    it('calls textFormatStore.setFabricTextbox when textbox is selected', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const textFormatStore = useTextFormatStore()
      const setTextSpy = vi.spyOn(textFormatStore, 'setFabricTextbox')

      const textbox: any = { type: 'textbox' }
      handleSelection({ selected: [textbox] })

      expect(setTextSpy).toHaveBeenCalledWith(textbox, canvas)
    })

    it('clears image selection when textbox is selected', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const imageCropStore = useImageCropStore()
      const clearSpy = vi.spyOn(imageCropStore, 'clearSelection')

      handleSelection({ selected: [{ type: 'textbox' }] })

      expect(clearSpy).toHaveBeenCalled()
    })
  })

  describe('handleSelection – arrow', () => {
    it('calls shapeStore.updateStylesFromSelection for an arrow', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const updateSpy = vi.spyOn(shapeStore, 'updateStylesFromSelection')

      const arrow: any = {
        type: 'path',
        isArrow: true,
        hasControls: true,
        hasBorders: true,
        stroke: '#ff0000',
        strokeWidth: 3,
        arrowStartStyle: 'filled',
        arrowEndStyle: 'open',
      }
      handleSelection({ selected: [arrow] })

      expect(updateSpy).toHaveBeenCalledWith('#ff0000', '#ff0000', 3, 'arrow')
      expect(shapeStore.arrowStartStyle).toBe('filled')
      expect(shapeStore.arrowEndStyle).toBe('open')
    })

    it('disables controls and borders on selected arrow', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })

      const arrow: any = {
        type: 'path',
        isArrow: true,
        hasControls: true,
        hasBorders: true,
        stroke: '#000000',
        strokeWidth: 2,
      }
      handleSelection({ selected: [arrow] })

      expect(arrow.hasControls).toBe(false)
      expect(arrow.hasBorders).toBe(false)
    })

    it('uses default values when arrow has no stroke/strokeWidth', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const updateSpy = vi.spyOn(shapeStore, 'updateStylesFromSelection')

      const arrow: any = { type: 'path', isArrow: true, hasControls: true, hasBorders: true }
      handleSelection({ selected: [arrow] })

      expect(updateSpy).toHaveBeenCalledWith('#000000', '#000000', 2, 'arrow')
    })
  })

  describe('handleSelection – shapes (rect/circle/triangle)', () => {
    it('calls shapeStore.updateStylesFromSelection for a rect', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const updateSpy = vi.spyOn(shapeStore, 'updateStylesFromSelection')

      handleSelection({ selected: [{ type: 'rect', fill: '#aabbcc', stroke: '#112233', strokeWidth: 4 }] })

      expect(updateSpy).toHaveBeenCalledWith('#aabbcc', '#112233', 4, 'square')
    })

    it('calls shapeStore.updateStylesFromSelection with circle type', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const updateSpy = vi.spyOn(shapeStore, 'updateStylesFromSelection')

      handleSelection({ selected: [{ type: 'circle', fill: '#ff0000', stroke: '#0000ff', strokeWidth: 1 }] })

      expect(updateSpy).toHaveBeenCalledWith('#ff0000', '#0000ff', 1, 'circle')
    })

    it('calls shapeStore.updateStylesFromSelection with triangle type', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const updateSpy = vi.spyOn(shapeStore, 'updateStylesFromSelection')

      handleSelection({ selected: [{ type: 'triangle', fill: '#00ff00', stroke: '#ff00ff', strokeWidth: 2 }] })

      expect(updateSpy).toHaveBeenCalledWith('#00ff00', '#ff00ff', 2, 'triangle')
    })

    it('clears image and text selection when shape is selected', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const imageCropStore = useImageCropStore()
      const textFormatStore = useTextFormatStore()
      const clearImgSpy = vi.spyOn(imageCropStore, 'clearSelection')
      const clearTextSpy = vi.spyOn(textFormatStore, 'clearTextFocus')

      handleSelection({ selected: [{ type: 'rect', fill: '#000', stroke: '#000', strokeWidth: 1 }] })

      expect(clearImgSpy).toHaveBeenCalled()
      expect(clearTextSpy).toHaveBeenCalled()
    })

    it('uses default values when shape has no fill/stroke/strokeWidth', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const updateSpy = vi.spyOn(shapeStore, 'updateStylesFromSelection')

      handleSelection({ selected: [{ type: 'rect' }] })

      expect(updateSpy).toHaveBeenCalledWith('#000000', '#1F2937', 2, 'square')
    })
  })

  describe('handleSelection – no match / empty', () => {
    it('clears image and text selections when no recognized object is selected', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const imageCropStore = useImageCropStore()
      const textFormatStore = useTextFormatStore()
      const clearImgSpy = vi.spyOn(imageCropStore, 'clearSelection')
      const clearTextSpy = vi.spyOn(textFormatStore, 'clearTextFocus')

      handleSelection({ selected: [{ type: 'group' }] })

      expect(clearImgSpy).toHaveBeenCalled()
      expect(clearTextSpy).toHaveBeenCalled()
    })

    it('clears everything when selected array is empty', () => {
      const canvas = makeCanvas()
      const { handleSelection } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const imageCropStore = useImageCropStore()
      const clearImgSpy = vi.spyOn(imageCropStore, 'clearSelection')

      handleSelection({ selected: [] })

      expect(clearImgSpy).toHaveBeenCalled()
    })
  })

  describe('handleSelectionCleared', () => {
    it('clears image selection', () => {
      const canvas = makeCanvas()
      const { handleSelectionCleared } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const imageCropStore = useImageCropStore()
      const clearSpy = vi.spyOn(imageCropStore, 'clearSelection')

      handleSelectionCleared()

      expect(clearSpy).toHaveBeenCalled()
    })

    it('clears shape selection', () => {
      const canvas = makeCanvas()
      const { handleSelectionCleared } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const shapeStore = useShapeStore()
      const clearSpy = vi.spyOn(shapeStore, 'clearShapeSelection')

      handleSelectionCleared()

      expect(clearSpy).toHaveBeenCalled()
    })

    it('clears fabric textbox in textFormatStore', () => {
      const canvas = makeCanvas()
      const { handleSelectionCleared } = useSelection(ref(canvas) as any, { blockIndex: 0 })
      const textFormatStore = useTextFormatStore()
      const setTextSpy = vi.spyOn(textFormatStore, 'setFabricTextbox')

      handleSelectionCleared()

      expect(setTextSpy).toHaveBeenCalledWith(null, null)
    })
  })
})
