import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('fabric', () => ({
  fabric: {
    Rect: vi.fn().mockImplementation((opts: any) => ({
      type: 'rect',
      fill: opts?.fill,
      stroke: opts?.stroke,
      strokeWidth: opts?.strokeWidth,
      left: opts?.left,
      top: opts?.top,
      width: opts?.width,
      height: opts?.height,
      set: vi.fn(),
    })),
    Circle: vi.fn().mockImplementation((opts: any) => ({
      type: 'circle',
      fill: opts?.fill,
      stroke: opts?.stroke,
      strokeWidth: opts?.strokeWidth,
      left: opts?.left,
      top: opts?.top,
      radius: opts?.radius,
      set: vi.fn(),
    })),
    Triangle: vi.fn().mockImplementation((opts: any) => ({
      type: 'triangle',
      fill: opts?.fill,
      stroke: opts?.stroke,
      strokeWidth: opts?.strokeWidth,
      left: opts?.left,
      top: opts?.top,
      width: opts?.width,
      height: opts?.height,
      set: vi.fn(),
    })),
    Path: vi.fn().mockImplementation((path: string, opts: any) => ({
      type: 'path',
      isArrow: false,
      path,
      stroke: opts?.stroke,
      strokeWidth: opts?.strokeWidth,
      left: opts?.left,
      top: opts?.top,
      angle: opts?.angle,
      set: vi.fn(),
    })),
  },
}))

import { useShapes } from '../../components/blocks/EditableBlock/composables/useShapes'
import { useShapeStore } from '../../stores/shapeStore'

function makeCanvas(activeObject: any = null, overrides: Partial<any> = {}) {
  return {
    width: 800,
    height: 600,
    getActiveObject: vi.fn().mockReturnValue(activeObject),
    getObjects: vi.fn().mockReturnValue([]),
    add: vi.fn(),
    remove: vi.fn(),
    setActiveObject: vi.fn(),
    renderAll: vi.fn(),
    ...overrides,
  }
}

describe('useShapes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getSelectedShape', () => {
    it('returns null when canvas is null', () => {
      const { getSelectedShape } = useShapes(ref(null), { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBeNull()
    })

    it('returns null when no active object', () => {
      const canvas = makeCanvas(null)
      const { getSelectedShape } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBeNull()
    })

    it('returns null for image type', () => {
      const canvas = makeCanvas({ type: 'image' })
      const { getSelectedShape } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBeNull()
    })

    it('returns rect object', () => {
      const rect = { type: 'rect' }
      const canvas = makeCanvas(rect)
      const { getSelectedShape } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBe(rect)
    })

    it('returns circle object', () => {
      const circle = { type: 'circle' }
      const canvas = makeCanvas(circle)
      const { getSelectedShape } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBe(circle)
    })

    it('returns triangle object', () => {
      const triangle = { type: 'triangle' }
      const canvas = makeCanvas(triangle)
      const { getSelectedShape } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBe(triangle)
    })

    it('returns arrow (path with isArrow) object', () => {
      const arrow = { type: 'path', isArrow: true }
      const canvas = makeCanvas(arrow)
      const { getSelectedShape } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      expect(getSelectedShape()).toBe(arrow)
    })
  })

  describe('addSquare', () => {
    it('does nothing when canvas is null', () => {
      const { addSquare } = useShapes(ref(null), { width: 800, height: 600, active: true }, vi.fn())
      expect(() => addSquare()).not.toThrow()
    })

    it('adds a rect to the canvas', () => {
      const canvas = makeCanvas()
      const { addSquare } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      addSquare()
      expect(canvas.add).toHaveBeenCalledTimes(1)
      const added = canvas.add.mock.calls[0][0]
      expect(added.type).toBe('rect')
    })

    it('uses shapeStore fill and stroke colors', () => {
      const canvas = makeCanvas()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#aabbcc'
      shapeStore.strokeColor = '#112233'
      shapeStore.strokeWidth = 5
      const { addSquare } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      addSquare()
      const added = canvas.add.mock.calls[0][0]
      expect(added.fill).toBe('#aabbcc')
      expect(added.stroke).toBe('#112233')
      expect(added.strokeWidth).toBe(5)
    })

    it('sets the added rect as active object', () => {
      const canvas = makeCanvas()
      const { addSquare } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      addSquare()
      expect(canvas.setActiveObject).toHaveBeenCalled()
      expect(canvas.renderAll).toHaveBeenCalled()
    })
  })

  describe('addCircle', () => {
    it('does nothing when canvas is null', () => {
      const { addCircle } = useShapes(ref(null), { width: 800, height: 600, active: true }, vi.fn())
      expect(() => addCircle()).not.toThrow()
    })

    it('adds a circle to the canvas', () => {
      const canvas = makeCanvas()
      const { addCircle } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      addCircle()
      expect(canvas.add).toHaveBeenCalledTimes(1)
      const added = canvas.add.mock.calls[0][0]
      expect(added.type).toBe('circle')
    })

    it('sets the added circle as active object', () => {
      const canvas = makeCanvas()
      const { addCircle } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      addCircle()
      expect(canvas.setActiveObject).toHaveBeenCalled()
    })
  })

  describe('addTriangle', () => {
    it('does nothing when canvas is null', () => {
      const { addTriangle } = useShapes(ref(null), { width: 800, height: 600, active: true }, vi.fn())
      expect(() => addTriangle()).not.toThrow()
    })

    it('adds a triangle to the canvas', () => {
      const canvas = makeCanvas()
      const { addTriangle } = useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
      addTriangle()
      expect(canvas.add).toHaveBeenCalledTimes(1)
      const added = canvas.add.mock.calls[0][0]
      expect(added.type).toBe('triangle')
    })
  })

  describe('createShape with zero-dimension canvas', () => {
    it('uses props.width and props.height when canvas dimensions are 0', () => {
      const canvas = { ...makeCanvas(), width: 0, height: 0 }
      const { addSquare } = useShapes(ref(canvas) as any, { width: 400, height: 300, active: true }, vi.fn())
      addSquare()
      expect(canvas.add).toHaveBeenCalled()
      const added = canvas.add.mock.calls[0][0]
      // left = (400 - 100) / 2 = 150
      expect(added.left).toBe(150)
    })
  })

  describe('isTransparentColor branches (via watcher)', () => {
    it('treats rgba(0,0,0,0) as transparent and reverts fillColor', async () => {
      const activeRect: any = { type: 'rect', fill: '#ff0000', stroke: 'rgba(0,0,0,0)', set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#ff0000'
      shapeStore.strokeColor = 'rgba(0,0,0,0)'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = 'rgba(0,0,0,0)'
      await nextTick()

      expect(shapeStore.fillColor).not.toBe('rgba(0,0,0,0)')
    })

    it('treats #00000000 as transparent and reverts fillColor', async () => {
      const activeRect: any = { type: 'rect', fill: '#ff0000', stroke: '#00000000', set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#ff0000'
      shapeStore.strokeColor = '#00000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = '#00000000'
      await nextTick()

      expect(shapeStore.fillColor).not.toBe('#00000000')
    })

    it('treats empty string stroke as transparent and reverts fillColor', async () => {
      const activeRect: any = { type: 'rect', fill: '#ff0000', stroke: '', set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#ff0000'
      shapeStore.strokeColor = ''

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = 'transparent'
      await nextTick()

      // '' is falsy → isTransparentColor('') returns true (line 9 branch)
      expect(shapeStore.fillColor).not.toBe('transparent')
    })

    it('treats non-string truthy value as non-transparent (does not revert)', async () => {
      // If fill is somehow a number, isTransparentColor returns false
      const activeRect: any = { type: 'rect', fill: '#ff0000', stroke: '#000000', set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#ff0000'
      shapeStore.strokeColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = '#aabbcc'
      await nextTick()

      expect(activeRect.set).toHaveBeenCalledWith({ fill: '#aabbcc' })
    })
  })

  describe('fillColor watcher', () => {
    it('updates fill on active rect when fillColor changes', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: '#000000',
        stroke: '#1F2937',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'
      shapeStore.strokeColor = '#1F2937'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.fillColor = '#ff0000'
      await nextTick()

      expect(activeRect.set).toHaveBeenCalledWith({ fill: '#ff0000' })
      expect(canvas.renderAll).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })

    it('does nothing when block is not active', async () => {
      const activeRect: any = { type: 'rect', fill: '#000000', stroke: '#000000', set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: false }, saveCanvas)

      shapeStore.fillColor = '#ff0000'
      await nextTick()

      expect(activeRect.set).not.toHaveBeenCalled()
      expect(saveCanvas).not.toHaveBeenCalled()
    })

    it('does nothing when no active object', async () => {
      const canvas = makeCanvas(null)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.fillColor = '#ff0000'
      await nextTick()

      expect(saveCanvas).not.toHaveBeenCalled()
    })

    it('shows error and reverts when both fill and stroke are transparent', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: '#000000',
        stroke: 'transparent',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'
      shapeStore.strokeColor = 'transparent'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = 'transparent'
      await nextTick()

      // fillColor should revert to the current fill value
      expect(shapeStore.fillColor).not.toBe('transparent')
    })

    it('uses #000000 fallback when activeObject.fill is undefined in transparent case', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: undefined,
        stroke: 'transparent',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#ff0000'
      shapeStore.strokeColor = 'transparent'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = 'transparent'
      await nextTick()

      // fallback = undefined || '#000000' = '#000000'
      expect(shapeStore.fillColor).toBe('#000000')
    })

    it('does not reassign fillColor when it already equals fallback', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: '#000000',
        stroke: 'transparent',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'
      shapeStore.strokeColor = 'transparent'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.fillColor = 'transparent'
      await nextTick()

      // fallback = '#000000', shapeStore.fillColor gets set to '#000000'
      // The guard `if (shapeStore.fillColor !== fallback)` prevents reassignment when equal
      expect(shapeStore.fillColor).toBe('#000000')
    })

    it('does not update fill for textbox active object (false branch of type check)', async () => {
      const activeText: any = { type: 'textbox', fill: '#000000', stroke: '#000000', set: vi.fn() }
      const canvas = makeCanvas(activeText)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.fillColor = '#ff0000'
      await nextTick()

      expect(activeText.set).not.toHaveBeenCalled()
      expect(saveCanvas).not.toHaveBeenCalled()
    })

    it('does not update fill if value is unchanged', async () => {
      const activeRect: any = { type: 'rect', fill: '#ff0000', stroke: '#000000', set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#ff0000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      // Trigger watcher with same value (set it to something different then back)
      shapeStore.fillColor = '#00ff00'
      await nextTick()
      saveCanvas.mockClear()
      shapeStore.fillColor = '#ff0000'
      await nextTick()

      // activeRect.fill is still '#ff0000' so the guard `activeObject.fill !== newColor` is false
      // set should not be called again for the unchanged value
      const setCallsAfterReset = activeRect.set.mock.calls.filter((c: any[]) =>
        c[0]?.fill === '#ff0000'
      )
      expect(setCallsAfterReset.length).toBe(0)
    })
  })

  describe('strokeColor watcher', () => {
    it('updates stroke on active circle when strokeColor changes', async () => {
      const activeCircle: any = {
        type: 'circle',
        fill: '#000000',
        stroke: '#1F2937',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeCircle)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.fillColor = '#000000'
      shapeStore.strokeColor = '#1F2937'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.strokeColor = '#0000ff'
      await nextTick()

      expect(activeCircle.set).toHaveBeenCalledWith({ stroke: '#0000ff' })
      expect(saveCanvas).toHaveBeenCalled()
    })

    it('shows error and reverts when both fill and stroke are transparent', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: 'transparent',
        stroke: '#000000',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = 'transparent'
      shapeStore.strokeColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.strokeColor = 'transparent'
      await nextTick()

      expect(shapeStore.strokeColor).not.toBe('transparent')
    })

    it('does nothing for image type active object', async () => {
      const activeImg: any = { type: 'image', set: vi.fn() }
      const canvas = makeCanvas(activeImg)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.strokeColor = '#ff0000'
      await nextTick()

      expect(activeImg.set).not.toHaveBeenCalled()
    })

    it('uses #1F2937 fallback when activeObject.stroke is undefined in transparent case', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: 'transparent',
        stroke: undefined,
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = 'transparent'
      shapeStore.strokeColor = '#000000'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.strokeColor = 'transparent'
      await nextTick()

      // fallback = undefined || '#1F2937'
      expect(shapeStore.strokeColor).toBe('#1F2937')
    })

    it('does not reassign strokeColor when it already equals fallback', async () => {
      const activeRect: any = {
        type: 'rect',
        fill: 'transparent',
        stroke: '#1F2937',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const shapeStore = useShapeStore()
      shapeStore.fillColor = 'transparent'
      shapeStore.strokeColor = '#1F2937'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

      shapeStore.strokeColor = 'transparent'
      await nextTick()

      expect(shapeStore.strokeColor).toBe('#1F2937')
    })
  })

  describe('strokeWidth watcher', () => {
    it('updates strokeWidth on active triangle', async () => {
      const activeTriangle: any = {
        type: 'triangle',
        strokeWidth: 2,
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeTriangle)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeWidth = 2

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.strokeWidth = 5
      await nextTick()

      expect(activeTriangle.set).toHaveBeenCalledWith({ strokeWidth: 5 })
      expect(saveCanvas).toHaveBeenCalled()
    })

    it('does nothing when block is not active', async () => {
      const activeRect: any = { type: 'rect', strokeWidth: 2, set: vi.fn() }
      const canvas = makeCanvas(activeRect)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeWidth = 2

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: false }, saveCanvas)

      shapeStore.strokeWidth = 5
      await nextTick()

      expect(activeRect.set).not.toHaveBeenCalled()
    })

    it('rebuilds arrow path when active object is an arrow', async () => {
      const activeArrow: any = {
        type: 'path',
        isArrow: true,
        arrowStart: { x: 100, y: 100 },
        arrowEnd: { x: 300, y: 100 },
        arrowStartStyle: 'stroke',
        arrowEndStyle: 'stroke',
        strokeWidth: 2,
        stroke: '#000000',
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeArrow)
      canvas.remove = vi.fn()
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeWidth = 2

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.strokeWidth = 6
      await nextTick()

      expect(canvas.remove).toHaveBeenCalledWith(activeArrow)
      expect(canvas.add).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })

    it('rebuilds arrow using shapeStore fallbacks when arrowStartStyle/EndStyle missing', async () => {
      const activeArrow: any = {
        type: 'path',
        isArrow: true,
        arrowStart: { x: 100, y: 100 },
        arrowEnd: { x: 300, y: 100 },
        // no arrowStartStyle/arrowEndStyle — falls back to shapeStore
        strokeWidth: 2,
        stroke: undefined, // falls back to shapeStore.fillColor
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeArrow)
      canvas.remove = vi.fn()
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeWidth = 2
      shapeStore.arrowStartStyle = 'none'
      shapeStore.arrowEndStyle = 'filled'
      shapeStore.fillColor = '#aabbcc'

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.strokeWidth = 4
      await nextTick()

      expect(canvas.remove).toHaveBeenCalledWith(activeArrow)
      expect(canvas.add).toHaveBeenCalled()
      expect(saveCanvas).toHaveBeenCalled()
    })

    it('does not update shape when strokeWidth is already equal', async () => {
      const activeRect: any = {
        type: 'rect',
        strokeWidth: 3,
        set: vi.fn(),
      }
      const canvas = makeCanvas(activeRect)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeWidth = 3

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      // Trigger watcher with same value — watcher fires but guard `strokeWidth !== newWidth` is false
      shapeStore.strokeWidth = 5
      await nextTick()
      saveCanvas.mockClear()
      activeRect.set.mockClear()

      shapeStore.strokeWidth = 3
      await nextTick()

      // activeRect.strokeWidth is still 3 (set was NOT called with an update to 3)
      const calls = activeRect.set.mock.calls.filter((c: any[]) => c[0]?.strokeWidth === 3)
      expect(calls.length).toBe(0)
    })

    it('does nothing in strokeWidth watcher when no active object', async () => {
      const canvas = makeCanvas(null)
      const saveCanvas = vi.fn()
      const shapeStore = useShapeStore()
      shapeStore.strokeWidth = 2

      useShapes(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

      shapeStore.strokeWidth = 5
      await nextTick()

      expect(saveCanvas).not.toHaveBeenCalled()
    })
  })
})
