import { describe, it, expect, vi } from 'vitest'
import { createDeleteControl, deleteSelectedObjects } from '../../../src/components/blocks/EditableBlock/utils/canvasControls'

describe('canvasControls utils', () => {
  it('createDeleteControl returns a control with handlers', () => {
    const ctrl: any = createDeleteControl()
    expect(ctrl).toBeTruthy()
    expect(typeof ctrl.mouseUpHandler).toBe('function')
    expect(typeof ctrl.render).toBe('function')
  })

  it('deleteSelectedObjects removes single active object', () => {
    const mockObj = { type: 'rect' }
    const canvas: any = {
      getActiveObject: () => mockObj,
      remove: vi.fn(),
      requestRenderAll: vi.fn(),
    }

    deleteSelectedObjects(canvas)

    expect(canvas.remove).toHaveBeenCalledWith(mockObj)
    expect(canvas.requestRenderAll).toHaveBeenCalled()
  })

  it('deleteSelectedObjects handles activeSelection', () => {
    const child = { id: 1 }
    const activeSelection: any = {
      type: 'activeSelection',
      forEachObject: (cb: any) => cb(child),
    }

    const canvas: any = {
      getActiveObject: () => activeSelection,
      remove: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
    }

    deleteSelectedObjects(canvas)

    expect(canvas.remove).toHaveBeenCalledWith(child)
    expect(canvas.discardActiveObject).toHaveBeenCalled()
    expect(canvas.requestRenderAll).toHaveBeenCalled()
  })

  it('deleteSelectedObjects does nothing when canvas is null', () => {
    // Should not throw
    expect(() => deleteSelectedObjects(null)).not.toThrow()
  })

  it('deleteSelectedObjects does nothing when no active object', () => {
    const canvas: any = {
      getActiveObject: () => null,
      remove: vi.fn(),
      requestRenderAll: vi.fn(),
    }

    deleteSelectedObjects(canvas)

    expect(canvas.remove).not.toHaveBeenCalled()
    expect(canvas.requestRenderAll).not.toHaveBeenCalled()
  })

  it('mouseUpHandler (deleteObject) removes single target from canvas', () => {
    const ctrl: any = createDeleteControl()

    const mockCanvas = {
      remove: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
    }
    const target: any = { type: 'rect', canvas: mockCanvas }
    const transform: any = { target }

    const result = ctrl.mouseUpHandler({} as MouseEvent, transform)

    expect(mockCanvas.remove).toHaveBeenCalledWith(target)
    expect(mockCanvas.requestRenderAll).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('mouseUpHandler (deleteObject) removes all objects in activeSelection', () => {
    const ctrl: any = createDeleteControl()

    const child1 = { id: 1 }
    const child2 = { id: 2 }
    const mockCanvas = {
      remove: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
    }
    const target: any = {
      type: 'activeSelection',
      canvas: mockCanvas,
      forEachObject: (cb: any) => { cb(child1); cb(child2) },
    }
    const transform: any = { target }

    const result = ctrl.mouseUpHandler({} as MouseEvent, transform)

    expect(mockCanvas.remove).toHaveBeenCalledWith(child1)
    expect(mockCanvas.remove).toHaveBeenCalledWith(child2)
    expect(mockCanvas.discardActiveObject).toHaveBeenCalled()
    expect(mockCanvas.requestRenderAll).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('render function (renderDeleteIcon) draws on canvas context', () => {
    const ctrl: any = createDeleteControl()

    const ctx: any = {
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
    }
    const fabricObject: any = { angle: 45 }

    ctrl.render(ctx, 10, 20, {}, fabricObject)

    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.translate).toHaveBeenCalledWith(10, 20)
    expect(ctx.restore).toHaveBeenCalled()
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('render function uses angle 0 when fabricObject has no angle', () => {
    const ctrl: any = createDeleteControl()

    const ctx: any = {
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
    }
    const fabricObject: any = {} // no angle property

    expect(() => ctrl.render(ctx, 0, 0, {}, fabricObject)).not.toThrow()
    expect(ctx.rotate).toHaveBeenCalled()
  })
})
