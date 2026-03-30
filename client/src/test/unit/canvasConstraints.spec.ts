import { describe, it, expect } from 'vitest'
import { constrainObjectPosition, handleObjectMoving, handleObjectScaling } from '../../../src/components/blocks/EditableBlock/utils/canvasConstraints'

describe('canvasConstraints utils', () => {
  it('constrainObjectPosition with radius keeps object inside bounds', () => {
    const obj: any = { left: -50, top: -20, scaleX: 1 }
    // radius > 0 branch
    constrainObjectPosition(obj, 200, 100, 30)
    expect(obj.left).toBeGreaterThanOrEqual(30)
    expect(obj.top).toBeGreaterThanOrEqual(30)
  })

  it('constrainObjectPosition without radius constrains by width/height', () => {
    const obj: any = { left: 190, top: 90, width: 50, height: 30, scaleX: 1, scaleY: 1 }
    constrainObjectPosition(obj, 200, 100, 0)
    // left should be <= canvasWidth - scaledWidth
    expect(obj.left).toBeLessThanOrEqual(200 - (obj.width * obj.scaleX))
    expect(obj.top).toBeLessThanOrEqual(100 - (obj.height * obj.scaleY))
  })

  it('constrainObjectPosition skips when left is undefined', () => {
    const obj: any = { top: 50, scaleX: 1, scaleY: 1, width: 20, height: 20 }
    // left is undefined - branch should not set it
    constrainObjectPosition(obj, 200, 100, 0)
    expect(obj.left).toBeUndefined()
    expect(obj.top).toBeLessThanOrEqual(100 - 20) // top IS defined so it gets constrained
  })

  it('constrainObjectPosition skips when top is undefined', () => {
    const obj: any = { left: 50, scaleX: 1, scaleY: 1, width: 20, height: 20 }
    // top is undefined
    constrainObjectPosition(obj, 200, 100, 0)
    expect(obj.top).toBeUndefined()
    expect(obj.left).toBeLessThanOrEqual(200 - 20) // left IS defined
  })

  it('constrainObjectPosition keeps object inside right/bottom with radius', () => {
    // Object far to the right
    const obj: any = { left: 300, top: 200, scaleX: 2 }
    constrainObjectPosition(obj, 200, 100, 20) // scaledRadius = 20*2 = 40
    expect(obj.left).toBeLessThanOrEqual(200 - 40)
    expect(obj.top).toBeLessThanOrEqual(100 - 40)
  })

  it('handleObjectMoving respects circle radius bounds', () => {
    const circle: any = { left: -10, top: 10, scaleX: 1, scaleY: 1, radius: 20 }
    handleObjectMoving(circle, 100, 80)
    expect(circle.left).toBeGreaterThanOrEqual(circle.radius * circle.scaleX)
    expect(circle.top).toBeGreaterThanOrEqual(circle.radius * circle.scaleY)
  })

  it('handleObjectMoving does not clamp object within canvas bounds', () => {
    // Object is well within bounds - no clamping needed
    const rect: any = { left: 50, top: 30, width: 20, height: 10, scaleX: 1, scaleY: 1, radius: 0 }
    handleObjectMoving(rect, 200, 200)
    expect(rect.left).toBe(50)
    expect(rect.top).toBe(30)
  })

  it('handleObjectMoving clamps rect to right/bottom bounds', () => {
    const rect: any = { left: 195, top: 195, width: 20, height: 20, scaleX: 1, scaleY: 1 }
    handleObjectMoving(rect, 200, 200)
    expect(rect.left).toBeLessThanOrEqual(200 - 20)
    expect(rect.top).toBeLessThanOrEqual(200 - 20)
  })

  it('handleObjectScaling caps circle scale based on position', () => {
    const circle: any = { left: 20, top: 40, scaleX: 5, scaleY: 5, radius: 10 }
    // maxScaleX = min(20, 100-20)/10 = 20/10 = 2
    handleObjectScaling(circle, 100, 100)
    expect(circle.scaleX).toBeLessThanOrEqual(2)
    expect(circle.scaleY).toBeLessThanOrEqual(4) // vertical space allows more
  })

  it('handleObjectScaling does not cap circle when scale is within bounds', () => {
    // scaleX = 1, maxScaleX = min(50, 50)/10 = 5 → scaleX stays at 1
    const circle: any = { left: 50, top: 50, scaleX: 1, scaleY: 1, radius: 10 }
    handleObjectScaling(circle, 100, 100)
    expect(circle.scaleX).toBe(1)
    expect(circle.scaleY).toBe(1)
  })

  it('handleObjectScaling caps rectangular object by canvas size', () => {
    const rect: any = { width: 50, height: 40, scaleX: 5, scaleY: 5 }
    handleObjectScaling(rect, 100, 80)
    expect(rect.scaleX).toBeLessThanOrEqual(100 / rect.width)
    expect(rect.scaleY).toBeLessThanOrEqual(80 / rect.height)
  })

  it('handleObjectScaling does not cap rect when within canvas size', () => {
    // scaledWidth = 50*1 = 50, canvas = 200 → no cap
    const rect: any = { width: 50, height: 40, scaleX: 1, scaleY: 1 }
    handleObjectScaling(rect, 200, 200)
    expect(rect.scaleX).toBe(1)
    expect(rect.scaleY).toBe(1)
  })

  it('handleObjectScaling skips scaleX cap when scaleX is falsy', () => {
    // scaleX=0 is falsy, condition `obj.scaleX && obj.scaleX > maxScaleX` is false
    const rect: any = { width: 50, height: 40, scaleX: 0, scaleY: 0 }
    handleObjectScaling(rect, 100, 80)
    expect(rect.scaleX).toBe(0) // unchanged
    expect(rect.scaleY).toBe(0) // unchanged
  })
})
