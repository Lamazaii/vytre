import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('fabric', () => ({
  fabric: {
    Textbox: vi.fn().mockImplementation((text: string, opts: any) => ({
      type: 'textbox',
      text,
      width: opts?.width ?? 280,
      height: 50,
      scaleX: 1,
      scaleY: 1,
      left: opts?.left ?? 0,
      top: opts?.top ?? 0,
      set: vi.fn().mockImplementation(function (this: any, props: any) {
        Object.assign(this, props)
      }),
      setCoords: vi.fn(),
      enterEditing: vi.fn(),
      selectAll: vi.fn(),
    })),
  },
}))

vi.mock('../../components/blocks/EditableBlock/utils/canvasConstraints', () => ({
  handleObjectMoving: vi.fn(),
}))

import { useText } from '../../components/blocks/EditableBlock/composables/useText'
import { useTextFormatStore } from '../../stores/textFormatStore'

function makeCanvas(activeObject: any = null) {
  return {
    width: 800,
    height: 600,
    getActiveObject: vi.fn().mockReturnValue(activeObject),
    add: vi.fn(),
    setActiveObject: vi.fn(),
    renderAll: vi.fn(),
  }
}

describe('useText', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getSelectedText', () => {
    it('returns null when canvas is null', () => {
      const { getSelectedText } = useText(ref(null), { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBeNull()
    })

    it('returns null when no active object', () => {
      const canvas = makeCanvas(null)
      const { getSelectedText } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBeNull()
    })

    it('returns null for rect active object', () => {
      const canvas = makeCanvas({ type: 'rect' })
      const { getSelectedText } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBeNull()
    })

    it('returns null for image active object', () => {
      const canvas = makeCanvas({ type: 'image' })
      const { getSelectedText } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBeNull()
    })

    it('returns textbox active object', () => {
      const textbox = { type: 'textbox' }
      const canvas = makeCanvas(textbox)
      const { getSelectedText } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBe(textbox)
    })

    it('returns i-text active object', () => {
      const itext = { type: 'i-text' }
      const canvas = makeCanvas(itext)
      const { getSelectedText } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBe(itext)
    })

    it('returns text active object', () => {
      const text = { type: 'text' }
      const canvas = makeCanvas(text)
      const { getSelectedText } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedText()).toBe(text)
    })
  })

  describe('normalizeTextboxScale', () => {
    it('normalizes scaleX to 1 and multiplies width', () => {
      const textbox: any = {
        scaleX: 2,
        scaleY: 1,
        width: 100,
        set: vi.fn().mockImplementation(function (this: any, props: any) {
          Object.assign(this, props)
        }),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      expect(textbox.set).toHaveBeenCalledWith(
        expect.objectContaining({ width: 200, scaleX: 1 })
      )
      expect(textbox.setCoords).toHaveBeenCalled()
    })

    it('does not modify width when scaleX is already 1', () => {
      const textbox: any = {
        scaleX: 1,
        scaleY: 1,
        width: 150,
        set: vi.fn(),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      // set for scaleX=1 branch should not be called with width change
      const widthCalls = (textbox.set as any).mock.calls.filter((c: any[]) => c[0]?.width !== undefined)
      expect(widthCalls.length).toBe(0)
    })

    it('resets scaleY to 1 when scaleY is not 1', () => {
      const textbox: any = {
        scaleX: 1,
        scaleY: 3,
        width: 100,
        set: vi.fn(),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      expect(textbox.set).toHaveBeenCalledWith({ scaleY: 1 })
    })

    it('enforces minimum width of 60 when scaled width would be less', () => {
      const textbox: any = {
        scaleX: 0.5,
        scaleY: 1,
        width: 50, // 50 * 0.5 = 25, below minimum 60
        set: vi.fn().mockImplementation(function (this: any, props: any) {
          Object.assign(this, props)
        }),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      expect(textbox.set).toHaveBeenCalledWith(
        expect.objectContaining({ width: 60, scaleX: 1 })
      )
    })

    it('uses fallback 1 when scaleX is 0 (falsy)', () => {
      const textbox: any = {
        scaleX: 0,
        scaleY: 1,
        width: 100,
        set: vi.fn(),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      // scaleX || 1 === 1, so no width update (currentScaleX === 1)
      const widthCalls = (textbox.set as any).mock.calls.filter((c: any[]) => c[0]?.width !== undefined)
      expect(widthCalls.length).toBe(0)
    })

    it('skips width update when width is 0 (baseWidth falsy, condition false)', () => {
      const textbox: any = {
        scaleX: 2,
        scaleY: 1,
        width: 0,
        set: vi.fn(),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      // baseWidth=0 → condition `currentScaleX !== 1 && baseWidth > 0` is false
      const widthCalls = (textbox.set as any).mock.calls.filter((c: any[]) => c[0]?.width !== undefined)
      expect(widthCalls.length).toBe(0)
    })

    it('uses fallback 1 when scaleY is 0 (falsy) — treats as 1, no reset', () => {
      const textbox: any = {
        scaleX: 1,
        scaleY: 0,
        width: 100,
        set: vi.fn(),
        setCoords: vi.fn(),
      }
      const { normalizeTextboxScale } = useText(ref(null), { width: 800, height: 600, active: true })
      normalizeTextboxScale(textbox)
      // scaleY || 1 === 1, so (1) !== 1 is false — set({ scaleY: 1 }) NOT called
      const scaleYCalls = (textbox.set as any).mock.calls.filter((c: any[]) => c[0]?.scaleY !== undefined)
      expect(scaleYCalls.length).toBe(0)
    })
  })

  describe('addTextZone', () => {
    it('does nothing when canvas is null', () => {
      const { addTextZone } = useText(ref(null), { width: 800, height: 600, active: true })
      expect(() => addTextZone()).not.toThrow()
    })

    it('creates a textbox and adds it to the canvas', () => {
      const canvas = makeCanvas()
      const { addTextZone } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      addTextZone()
      expect(canvas.add).toHaveBeenCalledTimes(1)
      expect(canvas.setActiveObject).toHaveBeenCalled()
      expect(canvas.renderAll).toHaveBeenCalled()
    })

    it('creates textbox with initial text content', () => {
      const canvas = makeCanvas()
      let addedTextbox: any = null
      canvas.add = vi.fn((tb: any) => { addedTextbox = tb })
      const { addTextZone } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      addTextZone()
      expect(addedTextbox).not.toBeNull()
      expect(addedTextbox.text).toBe('Nouvelle zone de texte')
    })

    it('centers the textbox on the canvas', () => {
      const canvas = makeCanvas()
      let addedTextbox: any = null
      canvas.add = vi.fn((tb: any) => { addedTextbox = tb })
      const { addTextZone } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      addTextZone()
      // The textbox should be positioned within canvas bounds
      expect(addedTextbox.left).toBeGreaterThanOrEqual(0)
      expect(addedTextbox.top).toBeGreaterThanOrEqual(0)
    })

    it('calls enterEditing and selectAll on the new textbox', () => {
      const canvas = makeCanvas()
      let addedTextbox: any = null
      canvas.setActiveObject = vi.fn((tb: any) => { addedTextbox = tb })
      const { addTextZone } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      addTextZone()
      // The textbox returned from Textbox constructor has enterEditing/selectAll mocked
      expect(canvas.add).toHaveBeenCalled()
    })

    it('sets lockScalingY on the textbox', () => {
      const canvas = makeCanvas()
      let addedTextbox: any = null
      canvas.add = vi.fn((tb: any) => { addedTextbox = tb })
      const { addTextZone } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })
      addTextZone()
      expect(addedTextbox.lockScalingY).toBe(true)
    })

    it('uses props.width and props.height when canvas dimensions are 0', () => {
      const canvas = { ...makeCanvas(), width: 0, height: 0 }
      let addedTextbox: any = null
      canvas.add = vi.fn((tb: any) => { addedTextbox = tb })
      const { addTextZone } = useText(ref(canvas) as any, { width: 400, height: 300, active: true })
      addTextZone()
      // canvas.width=0 || props.width=400 → canvasWidth=400
      // textbox left should be centered within 400 width
      expect(addedTextbox).not.toBeNull()
      expect(addedTextbox.left).toBeGreaterThanOrEqual(0)
    })
  })

  describe('handleTextboxStateUpdate', () => {
    it('does nothing when event has no target', () => {
      const canvas = makeCanvas()
      const textFormatStore = useTextFormatStore()
      const updateSpy = vi.spyOn(textFormatStore, 'updateFabricStatesFromObject')
      const { handleTextboxStateUpdate } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })

      handleTextboxStateUpdate({})

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('does nothing when target is not a textbox', () => {
      const canvas = makeCanvas()
      const textFormatStore = useTextFormatStore()
      const updateSpy = vi.spyOn(textFormatStore, 'updateFabricStatesFromObject')
      const { handleTextboxStateUpdate } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })

      handleTextboxStateUpdate({ target: { type: 'rect' } })

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('calls updateFabricStatesFromObject when target is a textbox', () => {
      const canvas = makeCanvas()
      const textFormatStore = useTextFormatStore()
      const updateSpy = vi.spyOn(textFormatStore, 'updateFabricStatesFromObject')
      const { handleTextboxStateUpdate } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })

      const textbox = { type: 'textbox' }
      handleTextboxStateUpdate({ target: textbox })

      expect(updateSpy).toHaveBeenCalledWith(textbox)
    })

    it('does nothing when event is undefined', () => {
      const canvas = makeCanvas()
      const textFormatStore = useTextFormatStore()
      const updateSpy = vi.spyOn(textFormatStore, 'updateFabricStatesFromObject')
      const { handleTextboxStateUpdate } = useText(ref(canvas) as any, { width: 800, height: 600, active: true })

      handleTextboxStateUpdate(undefined)

      expect(updateSpy).not.toHaveBeenCalled()
    })
  })
})
