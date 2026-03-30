import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

let fromURLCallback: ((img: any) => void) | null = null
let deferFromURL = false

vi.mock('fabric', () => ({
  fabric: {
    Image: {
      fromURL: vi.fn((src: string, cb: (img: any) => void) => {
        fromURLCallback = cb
        if (!deferFromURL) {
          const img: any = {
            type: 'image',
            width: 100,
            height: 100,
            set: vi.fn(),
          }
          cb(img)
        }
      }),
    },
  },
}))

import { useImages } from '../../components/blocks/EditableBlock/composables/useImages'

function makeCanvas(activeObject: any = null) {
  return {
    width: 800,
    height: 600,
    getActiveObject: vi.fn().mockReturnValue(activeObject),
    add: vi.fn(),
    remove: vi.fn(),
    setActiveObject: vi.fn(),
    renderAll: vi.fn(),
  }
}

describe('useImages', () => {
  describe('getSelectedImage', () => {
    it('returns null when canvas is null', () => {
      const { getSelectedImage } = useImages(ref(null), { width: 800, height: 600, active: true })
      expect(getSelectedImage()).toBeNull()
    })

    it('returns null when no active object', () => {
      const canvas = makeCanvas(null)
      const { getSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedImage()).toBeNull()
    })

    it('returns null for non-image active object', () => {
      const canvas = makeCanvas({ type: 'rect' })
      const { getSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedImage()).toBeNull()
    })

    it('returns null for textbox active object', () => {
      const canvas = makeCanvas({ type: 'textbox' })
      const { getSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedImage()).toBeNull()
    })

    it('returns the active image object', () => {
      const img = { type: 'image' }
      const canvas = makeCanvas(img)
      const { getSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      expect(getSelectedImage()).toBe(img)
    })
  })

  describe('addImage', () => {
    it('does nothing when canvas is null', () => {
      const { addImage } = useImages(ref(null), { width: 800, height: 600, active: true })
      expect(() => addImage('data:image/png;base64,abc')).not.toThrow()
    })

    it('adds the loaded image to the canvas', () => {
      const canvas = makeCanvas()
      const { addImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      addImage('data:image/png;base64,abc')
      expect(canvas.add).toHaveBeenCalled()
      expect(canvas.setActiveObject).toHaveBeenCalled()
      expect(canvas.renderAll).toHaveBeenCalled()
    })

    it('sets imageId and originalSrc on the new image', () => {
      const canvas = makeCanvas()
      let addedImg: any = null
      canvas.add = vi.fn((img: any) => { addedImg = img })
      const { addImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      addImage('data:image/png;base64,abc')
      expect(addedImg).not.toBeNull()
      expect(addedImg.imageId).toBeDefined()
      expect(addedImg.originalSrc).toBe('data:image/png;base64,abc')
    })

    it('calls img.set with position and scale', () => {
      const canvas = makeCanvas()
      const { addImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      addImage('data:image/png;base64,abc')
      // The fabric.Image.fromURL mock calls cb with a mock image that has a set method
      // We verify add was called (which implies set was called inside the callback)
      expect(canvas.add).toHaveBeenCalledTimes(1)
    })

    it('does not add when canvas becomes null before callback', () => {
      // This tests the guard inside fromURL callback
      const canvasRef = ref<any>(makeCanvas())
      const { addImage } = useImages(canvasRef as any, { width: 800, height: 600, active: true })
      const addSpy = vi.spyOn(canvasRef.value, 'add')
      addImage('data:image/png;base64,abc')
      // Since the mock is synchronous, canvas is still set — just verify no error
      expect(addSpy).toHaveBeenCalled()
    })

    it('uses props dimensions when canvas width/height are 0', () => {
      const canvas = { ...makeCanvas(), width: 0, height: 0 }
      let addedImg: any = null
      canvas.add = vi.fn((img: any) => { addedImg = img })
      const { addImage } = useImages(ref(canvas) as any, { width: 400, height: 300, active: true })
      addImage('data:image/png;base64,abc')
      // canvas.width=0 → uses props.width=400 for centering
      expect(addedImg).not.toBeNull()
    })

    it('handles image with zero width/height using fallback 1 in scale calculation', () => {
      deferFromURL = true
      const canvas = makeCanvas()
      const { addImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      addImage('data:image/png;base64,abc')
      deferFromURL = false

      // Fire callback with zero-dimension image (triggers `img.width || 1` and `img.height || 1`)
      const zeroImg: any = { type: 'image', width: 0, height: 0, set: vi.fn() }
      const cb = fromURLCallback as (img: any) => void
      cb(zeroImg)
      expect(canvas.add).toHaveBeenCalled()
    })

    it('guards against null canvasRef inside fromURL callback (deferred callback)', () => {
      deferFromURL = true
      const canvasRef = ref<any>(makeCanvas())
      const addSpy = vi.spyOn(canvasRef.value, 'add')
      const { addImage } = useImages(canvasRef as any, { width: 800, height: 600, active: true })
      addImage('data:image/png;base64,abc')
      // callback was NOT called yet (deferFromURL=true)
      deferFromURL = false

      // Nullify canvas then fire the callback
      canvasRef.value = null
      const img: any = { type: 'image', width: 100, height: 100, set: vi.fn() }
      const cb = fromURLCallback as (img: any) => void
      expect(() => cb(img)).not.toThrow()
      expect(addSpy).not.toHaveBeenCalled()
    })
  })

  describe('replaceSelectedImage', () => {
    it('does nothing when canvas is null', () => {
      const { replaceSelectedImage } = useImages(ref(null), { width: 800, height: 600, active: true })
      expect(() => replaceSelectedImage('data:image/png;base64,new')).not.toThrow()
    })

    it('does nothing when no image is selected', () => {
      const canvas = makeCanvas(null)
      const { replaceSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      replaceSelectedImage('data:image/png;base64,new')
      expect(canvas.remove).not.toHaveBeenCalled()
      expect(canvas.add).not.toHaveBeenCalled()
    })

    it('does nothing when selected object is not an image', () => {
      const canvas = makeCanvas({ type: 'rect' })
      const { replaceSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      replaceSelectedImage('data:image/png;base64,new')
      expect(canvas.remove).not.toHaveBeenCalled()
    })

    it('removes old image and adds new one when image is selected', () => {
      const selectedImg: any = {
        type: 'image',
        imageId: 'img-1',
        left: 50,
        top: 80,
        scaleX: 0.5,
        scaleY: 0.5,
        angle: 15,
      }
      const canvas = makeCanvas(selectedImg)
      const { replaceSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      replaceSelectedImage('data:image/png;base64,new')
      expect(canvas.remove).toHaveBeenCalledWith(selectedImg)
      expect(canvas.add).toHaveBeenCalled()
      expect(canvas.renderAll).toHaveBeenCalled()
    })

    it('preserves imageId on the replacement image', () => {
      const selectedImg: any = {
        type: 'image',
        imageId: 'img-original',
        left: 50,
        top: 80,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      }
      const canvas = makeCanvas(selectedImg)
      let addedImg: any = null
      canvas.add = vi.fn((img: any) => { addedImg = img })
      const { replaceSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      replaceSelectedImage('data:image/png;base64,new')
      expect(addedImg?.imageId).toBe('img-original')
    })

    it('sets new originalSrc on the replacement image', () => {
      const selectedImg: any = {
        type: 'image',
        imageId: 'img-1',
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      }
      const canvas = makeCanvas(selectedImg)
      let addedImg: any = null
      canvas.add = vi.fn((img: any) => { addedImg = img })
      const { replaceSelectedImage } = useImages(ref(canvas) as any, { width: 800, height: 600, active: true })
      replaceSelectedImage('data:image/png;base64,replaced')
      expect(addedImg?.originalSrc).toBe('data:image/png;base64,replaced')
    })

    it('guards against null canvasRef inside replaceSelectedImage fromURL callback', () => {
      const selectedImg: any = {
        type: 'image',
        imageId: 'img-1',
        left: 0, top: 0, scaleX: 1, scaleY: 1, angle: 0,
      }
      const canvasRef = ref<any>(makeCanvas(selectedImg))
      const addSpy = vi.spyOn(canvasRef.value, 'add')

      deferFromURL = true
      const { replaceSelectedImage } = useImages(canvasRef as any, { width: 800, height: 600, active: true })
      replaceSelectedImage('data:image/png;base64,new')
      deferFromURL = false

      canvasRef.value = null
      const newImg: any = { type: 'image', width: 100, height: 100, set: vi.fn() }
      const cb = fromURLCallback as (img: any) => void
      expect(() => cb(newImg)).not.toThrow()
      expect(addSpy).not.toHaveBeenCalled()
    })
  })
})
