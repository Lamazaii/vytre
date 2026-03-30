import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useLayers } from '../../components/blocks/EditableBlock/composables/useLayers'

function makeCanvas() {
  return {
    bringForward: vi.fn(),
    sendBackwards: vi.fn(),
    renderAll: vi.fn(),
  }
}

function setup(
  activeImg: any = null,
  activeShape: any = null,
  activeText: any = null,
  canvasOverride?: any
) {
  const canvas = canvasOverride ?? makeCanvas()
  const saveCanvas = vi.fn()
  const getSelectedImage = vi.fn().mockReturnValue(activeImg)
  const getSelectedShape = vi.fn().mockReturnValue(activeShape)
  const getSelectedText = vi.fn().mockReturnValue(activeText)
  const layers = useLayers(
    ref(canvas) as any,
    saveCanvas,
    getSelectedImage,
    getSelectedShape,
    getSelectedText
  )
  return { canvas, saveCanvas, layers }
}

describe('useLayers', () => {
  describe('when canvas is null', () => {
    it('all functions return false', () => {
      const layers = useLayers(
        ref(null),
        vi.fn(),
        vi.fn().mockReturnValue(null),
        vi.fn().mockReturnValue(null),
        vi.fn().mockReturnValue(null)
      )
      expect(layers.bringSelectedImageForward()).toBe(false)
      expect(layers.sendSelectedImageToBack()).toBe(false)
      expect(layers.bringSelectedShapeForward()).toBe(false)
      expect(layers.sendSelectedShapeToBack()).toBe(false)
      expect(layers.bringSelectedTextForward()).toBe(false)
      expect(layers.sendSelectedTextToBack()).toBe(false)
    })
  })

  describe('bringSelectedImageForward', () => {
    it('returns false when no image is selected', () => {
      const { layers } = setup(null)
      expect(layers.bringSelectedImageForward()).toBe(false)
    })

    it('returns true and calls bringForward when image is selected', () => {
      const img = { type: 'image' }
      const { canvas, saveCanvas, layers } = setup(img)
      const result = layers.bringSelectedImageForward()
      expect(result).toBe(true)
      expect(canvas.bringForward).toHaveBeenCalledWith(img)
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })
  })

  describe('sendSelectedImageToBack', () => {
    it('returns false when no image is selected', () => {
      const { layers } = setup(null)
      expect(layers.sendSelectedImageToBack()).toBe(false)
    })

    it('returns true and calls sendBackwards when image is selected', () => {
      const img = { type: 'image' }
      const { canvas, saveCanvas, layers } = setup(img)
      const result = layers.sendSelectedImageToBack()
      expect(result).toBe(true)
      expect(canvas.sendBackwards).toHaveBeenCalledWith(img)
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })
  })

  describe('bringSelectedShapeForward', () => {
    it('returns false when no shape is selected', () => {
      const { layers } = setup(null, null)
      expect(layers.bringSelectedShapeForward()).toBe(false)
    })

    it('returns true and calls bringForward when shape is selected', () => {
      const shape = { type: 'rect' }
      const { canvas, saveCanvas, layers } = setup(null, shape)
      const result = layers.bringSelectedShapeForward()
      expect(result).toBe(true)
      expect(canvas.bringForward).toHaveBeenCalledWith(shape)
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })
  })

  describe('sendSelectedShapeToBack', () => {
    it('returns false when no shape is selected', () => {
      const { layers } = setup(null, null)
      expect(layers.sendSelectedShapeToBack()).toBe(false)
    })

    it('returns true and calls sendBackwards when shape is selected', () => {
      const shape = { type: 'circle' }
      const { canvas, saveCanvas, layers } = setup(null, shape)
      const result = layers.sendSelectedShapeToBack()
      expect(result).toBe(true)
      expect(canvas.sendBackwards).toHaveBeenCalledWith(shape)
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })
  })

  describe('bringSelectedTextForward', () => {
    it('returns false when no text is selected', () => {
      const { layers } = setup(null, null, null)
      expect(layers.bringSelectedTextForward()).toBe(false)
    })

    it('returns true and calls bringForward when text is selected', () => {
      const text = { type: 'textbox' }
      const { canvas, saveCanvas, layers } = setup(null, null, text)
      const result = layers.bringSelectedTextForward()
      expect(result).toBe(true)
      expect(canvas.bringForward).toHaveBeenCalledWith(text)
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })
  })

  describe('sendSelectedTextToBack', () => {
    it('returns false when no text is selected', () => {
      const { layers } = setup(null, null, null)
      expect(layers.sendSelectedTextToBack()).toBe(false)
    })

    it('returns true and calls sendBackwards when text is selected', () => {
      const text = { type: 'textbox' }
      const { canvas, saveCanvas, layers } = setup(null, null, text)
      const result = layers.sendSelectedTextToBack()
      expect(result).toBe(true)
      expect(canvas.sendBackwards).toHaveBeenCalledWith(text)
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })
  })
})
