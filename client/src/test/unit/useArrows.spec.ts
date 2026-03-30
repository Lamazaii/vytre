import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('fabric', () => ({
  fabric: {
    Path: vi.fn().mockImplementation((path, opts) => ({
      type: 'path',
      isArrow: false,
      path,
      stroke: opts?.stroke || '#000000',
      strokeWidth: opts?.strokeWidth || 2,
      left: opts?.left || 0,
      top: opts?.top || 0,
      angle: opts?.angle || 0,
      set: vi.fn(),
    })),
  },
}))

import { isArrowObject, generateArrowPath, useArrows } from '../../components/blocks/EditableBlock/composables/useArrows'
import { useShapeStore } from '../../stores/shapeStore'

// ─── isArrowObject ────────────────────────────────────────────────────────────

describe('isArrowObject', () => {
  it('returns true for a path object with isArrow flag', () => {
    const obj: any = { type: 'path', isArrow: true }
    expect(isArrowObject(obj)).toBe(true)
  })

  it('returns false for a path without isArrow flag', () => {
    const obj: any = { type: 'path', isArrow: false }
    expect(isArrowObject(obj)).toBe(false)
  })

  it('returns false for a path where isArrow is undefined', () => {
    const obj: any = { type: 'path' }
    expect(isArrowObject(obj)).toBe(false)
  })

  it('returns false for rect objects', () => {
    expect(isArrowObject({ type: 'rect' } as any)).toBe(false)
  })

  it('returns false for circle objects', () => {
    expect(isArrowObject({ type: 'circle' } as any)).toBe(false)
  })

  it('returns false for image objects', () => {
    expect(isArrowObject({ type: 'image' } as any)).toBe(false)
  })
})

// ─── generateArrowPath ────────────────────────────────────────────────────────

describe('generateArrowPath', () => {
  it('returns empty string when points are identical (distance = 0)', () => {
    expect(generateArrowPath({ x: 0, y: 0 }, { x: 0, y: 0 }, 'none', 'none')).toBe('')
  })

  it('returns empty string when distance is less than 5', () => {
    expect(generateArrowPath({ x: 0, y: 0 }, { x: 3, y: 0 }, 'none', 'none')).toBe('')
  })

  it('generates a basic line path with none styles', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'none', 'none', 2)
    expect(result).toMatch(/^M\s+0,0\s+L\s+100,0$/)
  })

  it('includes end arrowhead path for stroke endStyle', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'none', 'stroke', 2)
    // Has the main line + the end arrowhead (extra M command)
    expect((result.match(/M/g) || []).length).toBeGreaterThan(1)
  })

  it('includes start arrowhead path for stroke startStyle', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'stroke', 'none', 2)
    expect((result.match(/M/g) || []).length).toBeGreaterThan(1)
  })

  it('includes both arrowheads when both styles are stroke', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'stroke', 'stroke', 2)
    expect((result.match(/M/g) || []).length).toBeGreaterThanOrEqual(3)
  })

  it('does not add path commands for filled/open styles (rendered by canvas)', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'filled', 'open', 2)
    expect((result.match(/M/g) || []).length).toBe(1)
  })

  it('does not add path commands for open/filled styles', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'open', 'filled', 2)
    expect((result.match(/M/g) || []).length).toBe(1)
  })

  it('adjusts arrowhead size based on strokeWidth', () => {
    const thin = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'stroke', 'stroke', 1)
    const thick = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'stroke', 'stroke', 10)
    expect(thin).not.toBe(thick)
  })

  it('applies startOffset for stroke startStyle (line does not start at 0)', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'stroke', 'none', 2)
    // M should not start at 0 since stroke style adds offset
    expect(result).not.toMatch(/^M 0,0/)
  })

  it('applies endOffset for stroke endStyle (main line segment ends before 100)', () => {
    const result = generateArrowPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 'none', 'stroke', 2)
    // The first L command (main line segment) should end before 100 due to endOffset
    const firstLMatch = result.match(/M [^M]+L ([0-9.]+),0/)
    expect(firstLMatch).not.toBeNull()
    expect(parseFloat(firstLMatch![1])).toBeLessThan(100)
  })
})

// ─── useArrows composable ─────────────────────────────────────────────────────

function makeCanvas(overrides: Partial<any> = {}) {
  return {
    width: 800,
    height: 600,
    getObjects: vi.fn().mockReturnValue([]),
    getActiveObject: vi.fn().mockReturnValue(null),
    add: vi.fn(),
    remove: vi.fn(),
    setActiveObject: vi.fn(),
    renderAll: vi.fn(),
    requestRenderAll: vi.fn(),
    getPointer: vi.fn().mockReturnValue({ x: 400, y: 300 }),
    defaultCursor: 'default',
    hoverCursor: 'move',
    selection: true,
    ...overrides,
  }
}

describe('useArrows composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addArrow does nothing when canvas is null', () => {
    const { addArrow } = useArrows(ref(null), { width: 800, height: 600, active: true }, vi.fn())
    expect(() => addArrow()).not.toThrow()
  })

  it('addArrow adds an arrow object to the canvas', () => {
    const canvas = makeCanvas()
    const { addArrow } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    addArrow()
    expect(canvas.add).toHaveBeenCalled()
    expect(canvas.setActiveObject).toHaveBeenCalled()
    expect(canvas.renderAll).toHaveBeenCalled()
  })

  it('handleArrowMouseDown returns falsy when not drawing and no arrow endpoints nearby', () => {
    const canvas = makeCanvas()
    const { handleArrowMouseDown } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const result = handleArrowMouseDown({ e: { button: 0 } })
    expect(result).toBeFalsy()
  })

  it('handleArrowMouseDown returns false when no arrow objects exist and isDrawingArrow is false', () => {
    const canvas = makeCanvas({ getObjects: vi.fn().mockReturnValue([]) })
    const { handleArrowMouseDown } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const result = handleArrowMouseDown({ e: { button: 0 } })
    expect(result).toBe(false)
  })

  it('handleArrowMouseDown detects nearby start endpoint and starts modifying', () => {
    const arrow: any = {
      type: 'path',
      isArrow: true,
      arrowStart: { x: 400, y: 300 },
      arrowEnd: { x: 600, y: 300 },
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getPointer: vi.fn().mockReturnValue({ x: 402, y: 301 }), // within tolerance=12
    })
    const { handleArrowMouseDown } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const result = handleArrowMouseDown({ e: { button: 0 } })
    expect(result).toBe(true)
    expect(canvas.setActiveObject).toHaveBeenCalledWith(arrow)
  })

  it('handleArrowMouseDown detects nearby end endpoint and starts modifying', () => {
    const arrow: any = {
      type: 'path',
      isArrow: true,
      arrowStart: { x: 200, y: 300 },
      arrowEnd: { x: 400, y: 300 },
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getPointer: vi.fn().mockReturnValue({ x: 402, y: 301 }),
    })
    const { handleArrowMouseDown } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const result = handleArrowMouseDown({ e: { button: 0 } })
    expect(result).toBe(true)
  })

  it('handleArrowMouseUp clears modifying state without throwing', () => {
    const canvas = makeCanvas()
    const { handleArrowMouseUp } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    expect(() => handleArrowMouseUp()).not.toThrow()
  })

  it('handleArrowMouseMove returns false when not drawing and no modifying state', () => {
    const canvas = makeCanvas()
    const { handleArrowMouseMove } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const result = handleArrowMouseMove({ e: {} })
    expect(result).toBeFalsy()
  })

  it('handleArrowMouseMove updates cursor near arrow endpoint', () => {
    const arrow: any = {
      type: 'path',
      isArrow: true,
      arrowStart: { x: 400, y: 300 },
      arrowEnd: { x: 600, y: 300 },
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getPointer: vi.fn().mockReturnValue({ x: 402, y: 300 }),
    })
    const { handleArrowMouseMove } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    handleArrowMouseMove({ e: {} })
    expect(canvas.defaultCursor).toBe('crosshair')
  })

  it('handleArrowRender does nothing when canvas is null', () => {
    const { handleArrowRender } = useArrows(ref(null), { width: 800, height: 600, active: true }, vi.fn())
    expect(() => handleArrowRender({} as CanvasRenderingContext2D)).not.toThrow()
  })

  it('handleArrowRender iterates over canvas objects', () => {
    const canvas = makeCanvas({ getObjects: vi.fn().mockReturnValue([]) })
    const { handleArrowRender } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    handleArrowRender(ctx)
    expect(canvas.getObjects).toHaveBeenCalled()
  })

  it('handleArrowRender draws filled arrowhead for filled endStyle', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'none',
      arrowEndStyle: 'filled',
      stroke: '#ff0000',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getActiveObject: vi.fn().mockReturnValue(null),
    })
    const { handleArrowRender } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    handleArrowRender(ctx)
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('handleArrowRender draws open arrowhead for open startStyle', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'open',
      arrowEndStyle: 'none',
      stroke: '#ff0000',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getActiveObject: vi.fn().mockReturnValue(null),
    })
    const { handleArrowRender } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    handleArrowRender(ctx)
    expect(ctx.fill).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('handleArrowRender draws selection endpoints when arrow is active', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'none',
      arrowEndStyle: 'none',
      stroke: '#000000',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getActiveObject: vi.fn().mockReturnValue(arrow),
    })
    const { handleArrowRender } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    handleArrowRender(ctx)
    // Two endpoint circles drawn
    expect(ctx.arc).toHaveBeenCalledTimes(2)
  })

  it('handleArrowModified clears lastLeft and lastTop on arrow', () => {
    const canvas = makeCanvas()
    const { handleArrowModified } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const arrow: any = { type: 'path', isArrow: true, lastLeft: 10, lastTop: 20 }
    handleArrowModified({ target: arrow })
    expect(arrow.lastLeft).toBeUndefined()
    expect(arrow.lastTop).toBeUndefined()
  })

  it('handleArrowModified does nothing for non-arrow target', () => {
    const canvas = makeCanvas()
    const { handleArrowModified } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const rect: any = { type: 'rect', lastLeft: 10 }
    handleArrowModified({ target: rect })
    expect(rect.lastLeft).toBe(10) // unchanged
  })

  it('handleArrowMoving returns false for non-arrow target', () => {
    const canvas = makeCanvas()
    const { handleArrowMoving } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    expect(handleArrowMoving({ target: { type: 'rect' } })).toBe(false)
  })

  it('handleArrowMoving handles arrow within bounds and returns true', () => {
    const canvas = makeCanvas()
    const { handleArrowMoving } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    // Provide a pre-set lastLeft/lastTop so we get a real delta
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 200, y: 200 },
      left: 110, top: 110,
      lastLeft: 100, lastTop: 100, // pre-set so delta = 10
    }
    const result = handleArrowMoving({ target: arrow })
    expect(result).toBe(true)
    // delta = (110-100) = 10 → arrowStart.x = 100+10 = 110
    expect(arrow.arrowStart.x).toBe(110)
    expect(arrow.arrowStart.y).toBe(110)
    expect(arrow.arrowEnd.x).toBe(210)
  })

  it('handleArrowMoving reverts position when arrow would go out of bounds', () => {
    const canvas = makeCanvas({ width: 800, height: 600 })
    const { handleArrowMoving } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 700, y: 500 },
      arrowEnd: { x: 750, y: 550 },
      left: 810, // out of bounds
      top: 510,
      lastLeft: 700,
      lastTop: 500,
    }
    handleArrowMoving({ target: arrow })
    // Should revert to lastLeft/lastTop
    expect(arrow.left).toBe(700)
    expect(arrow.top).toBe(500)
  })

  it('resetArrowDrawingState does not throw', () => {
    const canvas = makeCanvas()
    const { resetArrowDrawingState } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    expect(() => resetArrowDrawingState()).not.toThrow()
  })

  it('isDrawingArrow is initially false', () => {
    const canvas = makeCanvas()
    const { isDrawingArrow } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    expect(isDrawingArrow.value).toBe(false)
  })

  // ── Drawing mode: two-click arrow creation ──────────────────────────────────

  it('handleArrowMouseDown sets start point when isDrawingArrow is true and no start yet', () => {
    const canvas = makeCanvas()
    const { handleArrowMouseDown, isDrawingArrow } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    isDrawingArrow.value = true
    const result = handleArrowMouseDown({ e: { button: 0 } })
    expect(result).toBe(true)
    expect(canvas.requestRenderAll).toHaveBeenCalled()
  })

  it('handleArrowMouseDown creates arrow on second click (end point)', () => {
    const canvas = makeCanvas()
    const { handleArrowMouseDown, isDrawingArrow } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    isDrawingArrow.value = true
    // First click – sets start point
    handleArrowMouseDown({ e: { button: 0 } })
    // Second click – creates arrow
    canvas.getPointer = vi.fn().mockReturnValue({ x: 500, y: 300 })
    const result = handleArrowMouseDown({ e: { button: 0 } })
    expect(result).toBe(true)
    expect(canvas.add).toHaveBeenCalled()
    expect(isDrawingArrow.value).toBe(false)
  })

  it('handleArrowMouseMove updates preview pointer when drawing', () => {
    const canvas = makeCanvas()
    const { handleArrowMouseMove, isDrawingArrow } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    isDrawingArrow.value = true
    // Set a start point first via mousedown
    const { handleArrowMouseDown } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    // We need a fresh composable with isDrawingArrow=true AND arrowStartPoint set
    // Use a single composable instance
    const composable = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    composable.isDrawingArrow.value = true
    composable.handleArrowMouseDown({ e: { button: 0 } }) // sets startPoint
    const result = composable.handleArrowMouseMove({ e: {} })
    expect(result).toBe(true)
    expect(canvas.requestRenderAll).toHaveBeenCalled()
  })

  it('handleArrowMouseMove handles modifying arrow end endpoint', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 200, y: 300 },
      arrowEnd: { x: 400, y: 300 },
      arrowStartStyle: 'stroke',
      arrowEndStyle: 'stroke',
      stroke: '#000000',
      strokeWidth: 2,
    }
    // Canvas pointer near the end point
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getPointer: vi.fn().mockReturnValue({ x: 401, y: 300 }),
    })
    canvas.remove = vi.fn()

    const composable = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    // Start modifying by clicking near end
    composable.handleArrowMouseDown({ e: { button: 0 } })
    // Now move
    canvas.getPointer = vi.fn().mockReturnValue({ x: 450, y: 320 })
    const result = composable.handleArrowMouseMove({ e: {} })
    expect(result).toBe(true)
  })

  it('handleArrowMouseUp calls saveCanvas when modifying an arrow', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 200, y: 300 },
      arrowEnd: { x: 400, y: 300 },
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getPointer: vi.fn().mockReturnValue({ x: 202, y: 300 }),
    })
    const saveCanvas = vi.fn()
    const composable = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)
    // Start modifying (click near start endpoint)
    composable.handleArrowMouseDown({ e: { button: 0 } })
    composable.handleArrowMouseUp()
    expect(saveCanvas).toHaveBeenCalled()
  })

  // ── arrowStartStyle watcher ─────────────────────────────────────────────────

  it('arrowStartStyle watcher rebuilds arrow when active arrow style changes', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowStartStyle = 'stroke'

    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'stroke',
      arrowEndStyle: 'stroke',
      stroke: '#000000',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(arrow) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

    shapeStore.arrowStartStyle = 'filled'
    await nextTick()

    expect(canvas.remove).toHaveBeenCalledWith(arrow)
    expect(canvas.add).toHaveBeenCalled()
    expect(saveCanvas).toHaveBeenCalled()
  })

  it('arrowStartStyle watcher uses store fallbacks when arrow missing arrowEndStyle/stroke/strokeWidth', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowStartStyle = 'stroke'
    shapeStore.arrowEndStyle = 'filled'
    shapeStore.fillColor = '#aabbcc'

    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      // no arrowEndStyle → uses shapeStore.arrowEndStyle
      // no stroke → uses shapeStore.fillColor
      // no strokeWidth → uses default 2
    }
    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(arrow) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

    shapeStore.arrowStartStyle = 'none'
    await nextTick()

    expect(canvas.remove).toHaveBeenCalledWith(arrow)
    expect(canvas.add).toHaveBeenCalled()
    expect(saveCanvas).toHaveBeenCalled()
  })

  it('arrowStartStyle watcher does nothing when active object is not an arrow', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowStartStyle = 'stroke'

    const rect: any = { type: 'rect', set: vi.fn() }
    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(rect) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

    shapeStore.arrowStartStyle = 'filled'
    await nextTick()

    expect(saveCanvas).not.toHaveBeenCalled()
  })

  it('arrowStartStyle watcher does nothing when block is not active', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowStartStyle = 'stroke'

    const arrow: any = { type: 'path', isArrow: true, arrowStart: { x: 100, y: 100 }, arrowEnd: { x: 300, y: 100 } }
    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(arrow) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: false }, saveCanvas)

    shapeStore.arrowStartStyle = 'filled'
    await nextTick()

    expect(saveCanvas).not.toHaveBeenCalled()
  })

  // ── arrowEndStyle watcher ───────────────────────────────────────────────────

  it('arrowEndStyle watcher rebuilds arrow when active arrow end style changes', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowEndStyle = 'stroke'

    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'stroke',
      arrowEndStyle: 'stroke',
      stroke: '#ff0000',
      strokeWidth: 3,
    }
    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(arrow) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

    shapeStore.arrowEndStyle = 'open'
    await nextTick()

    expect(canvas.remove).toHaveBeenCalledWith(arrow)
    expect(canvas.add).toHaveBeenCalled()
    expect(saveCanvas).toHaveBeenCalled()
  })

  it('arrowEndStyle watcher uses store fallbacks when arrow missing arrowStartStyle/stroke/strokeWidth', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowEndStyle = 'stroke'
    shapeStore.arrowStartStyle = 'none'
    shapeStore.fillColor = '#112233'

    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      // no arrowStartStyle → uses shapeStore.arrowStartStyle
      // no stroke → uses shapeStore.fillColor
      // no strokeWidth → default 2
    }
    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(arrow) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

    shapeStore.arrowEndStyle = 'filled'
    await nextTick()

    expect(canvas.remove).toHaveBeenCalledWith(arrow)
    expect(canvas.add).toHaveBeenCalled()
    expect(saveCanvas).toHaveBeenCalled()
  })

  it('arrowEndStyle watcher does nothing when active object is not an arrow', async () => {
    const { nextTick } = await import('vue')
    const shapeStore = useShapeStore()
    shapeStore.arrowEndStyle = 'stroke'

    const canvas = makeCanvas({ getActiveObject: vi.fn().mockReturnValue(null) })
    const saveCanvas = vi.fn()

    useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, saveCanvas)

    shapeStore.arrowEndStyle = 'filled'
    await nextTick()

    expect(saveCanvas).not.toHaveBeenCalled()
  })

  // ── handleArrowMouseMove — modifying END endpoint (line 194 false branch) ────

  it('handleArrowMouseMove updates arrowStart when modifyingEnd is start (line 194)', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 400, y: 300 }, // pointer will be near START
      arrowEnd: { x: 600, y: 300 },
      arrowStartStyle: 'stroke',
      arrowEndStyle: 'stroke',
      stroke: '#000000',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getPointer: vi.fn().mockReturnValue({ x: 402, y: 300 }), // near START
    })
    canvas.remove = vi.fn()

    const composable = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    // Click near START → modifyingEnd = 'start'
    composable.handleArrowMouseDown({ e: { button: 0 } })

    // Move — should update arrowStart (TRUE branch of `modifyingEnd === 'start'`, line 194)
    canvas.getPointer = vi.fn().mockReturnValue({ x: 350, y: 280 })
    const result = composable.handleArrowMouseMove({ e: {} })
    expect(result).toBe(true)
    expect(canvas.remove).toHaveBeenCalledWith(arrow)
    expect(canvas.add).toHaveBeenCalled()
  })

  // ── handleArrowRender — open endStyle and filled startStyle ──────────────────

  it('handleArrowRender draws open arrowhead for open endStyle', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'none',
      arrowEndStyle: 'open',
      stroke: '#ff0000',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getActiveObject: vi.fn().mockReturnValue(null),
    })
    const { handleArrowRender } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    handleArrowRender(ctx)
    expect(ctx.fill).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('handleArrowRender draws filled arrowhead for filled startStyle', () => {
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 300, y: 100 },
      arrowStartStyle: 'filled',
      arrowEndStyle: 'none',
      stroke: '#0000ff',
      strokeWidth: 2,
    }
    const canvas = makeCanvas({
      getObjects: vi.fn().mockReturnValue([arrow]),
      getActiveObject: vi.fn().mockReturnValue(null),
    })
    const { handleArrowRender } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    handleArrowRender(ctx)
    expect(ctx.fill).toHaveBeenCalled()
    // stroke should NOT be called (filled uses ctx.fill only)
    // Only ctx.fill for the arrowhead — no ctx.stroke for filled style
  })

  it('handleArrowRender draws dashed preview line when isDrawingArrow is true', () => {
    const canvas = makeCanvas({ getObjects: vi.fn().mockReturnValue([]) })
    const composable = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())

    composable.isDrawingArrow.value = true
    // Set start point by clicking
    composable.handleArrowMouseDown({ e: { button: 0 } })
    // Move mouse to set preview pointer
    canvas.getPointer = vi.fn().mockReturnValue({ x: 500, y: 400 })
    composable.handleArrowMouseMove({ e: {} })

    const ctx: any = {
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), setLineDash: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '', strokeStyle: '', lineWidth: 0, lineCap: '',
    }
    composable.handleArrowRender(ctx)
    // Preview dashed line should be drawn
    expect(ctx.setLineDash).toHaveBeenCalledWith([6, 4])
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('handleArrowMoving returns true when movement is constrained', () => {
    const canvas = makeCanvas({ width: 800, height: 600 })
    const { handleArrowMoving } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 780, y: 580 },
      arrowEnd: { x: 790, y: 590 },
      left: 850, // out of bounds → constrained
      top: 580,
      lastLeft: 780,
      lastTop: 580,
    }
    const result = handleArrowMoving({ target: arrow })
    expect(result).toBe(true)
    expect(arrow.left).toBe(780) // reverted
  })

  it('handleArrowMoving initializes lastLeft/lastTop when undefined (lines 384-385)', () => {
    const canvas = makeCanvas({ width: 800, height: 600 })
    const { handleArrowMoving } = useArrows(ref(canvas) as any, { width: 800, height: 600, active: true }, vi.fn())
    const arrow: any = {
      type: 'path', isArrow: true,
      arrowStart: { x: 100, y: 100 },
      arrowEnd: { x: 200, y: 100 },
      left: 100,
      top: 100,
      // no lastLeft/lastTop — triggers initialization branch (lines 384-385)
    }
    const result = handleArrowMoving({ target: arrow })
    expect(result).toBe(true)
    // After initialization, lastLeft/lastTop are set
    expect(arrow.lastLeft).toBeDefined()
    expect(arrow.lastTop).toBeDefined()
  })
})
