import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useShapeStore } from '../../stores/shapeStore'

describe('shapeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useShapeStore()
    expect(store.activeShape).toBeNull()
    expect(store.hasSelectedShape).toBe(false)
    expect(store.fillColor).toBe('#000000')
    expect(store.strokeColor).toBe('#1F2937')
    expect(store.strokeWidth).toBe(2)
    expect(store.addShapeRequest).toBe(0)
    expect(store.addImageRequest).toBe(0)
  })

  it('setActiveShape updates activeShape', () => {
    const store = useShapeStore()
    store.setActiveShape('circle')
    expect(store.activeShape).toBe('circle')

    store.setActiveShape('square')
    expect(store.activeShape).toBe('square')
  })

  it('clearActiveShape resets activeShape to null', () => {
    const store = useShapeStore()
    store.setActiveShape('triangle')
    store.clearActiveShape()
    expect(store.activeShape).toBeNull()
  })

  it('requestAddShape increments addShapeRequest', () => {
    const store = useShapeStore()
    expect(store.addShapeRequest).toBe(0)
    store.requestAddShape()
    expect(store.addShapeRequest).toBe(1)
    store.requestAddShape()
    expect(store.addShapeRequest).toBe(2)
  })

  it('requestAddImage increments addImageRequest', () => {
    const store = useShapeStore()
    expect(store.addImageRequest).toBe(0)
    store.requestAddImage()
    expect(store.addImageRequest).toBe(1)
  })

  it('requestBringImageForward increments bringImageForwardRequest', () => {
    const store = useShapeStore()
    expect(store.bringImageForwardRequest).toBe(0)
    store.requestBringImageForward()
    expect(store.bringImageForwardRequest).toBe(1)
  })

  it('requestSendImageToBack increments sendImageToBackRequest', () => {
    const store = useShapeStore()
    expect(store.sendImageToBackRequest).toBe(0)
    store.requestSendImageToBack()
    expect(store.sendImageToBackRequest).toBe(1)
  })

  it('requestBringShapeForward increments bringShapeForwardRequest', () => {
    const store = useShapeStore()
    expect(store.bringShapeForwardRequest).toBe(0)
    store.requestBringShapeForward()
    expect(store.bringShapeForwardRequest).toBe(1)
  })

  it('requestSendShapeToBack increments sendShapeToBackRequest', () => {
    const store = useShapeStore()
    expect(store.sendShapeToBackRequest).toBe(0)
    store.requestSendShapeToBack()
    expect(store.sendShapeToBackRequest).toBe(1)
  })

  it('updateStylesFromSelection sets style values and hasSelectedShape', () => {
    const store = useShapeStore()
    expect(store.hasSelectedShape).toBe(false)

    store.updateStylesFromSelection('#ff0000', '#0000ff', 5)

    expect(store.fillColor).toBe('#ff0000')
    expect(store.strokeColor).toBe('#0000ff')
    expect(store.strokeWidth).toBe(5)
    expect(store.hasSelectedShape).toBe(true)
  })

  it('clearShapeSelection sets hasSelectedShape to false', () => {
    const store = useShapeStore()
    store.updateStylesFromSelection('#fff', '#000', 1)
    expect(store.hasSelectedShape).toBe(true)

    store.clearShapeSelection()
    expect(store.hasSelectedShape).toBe(false)
  })
})
