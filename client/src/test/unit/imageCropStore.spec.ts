import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useImageCropStore } from '../../stores/imageCropStore'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

describe('imageCropStore', () => {
  it('selects and clears image selection', () => {
    const store = useImageCropStore()
    store.selectImage('id-1', 2)
    expect(store.selectedImageId).toBe('id-1')
    expect(store.blockIndex).toBe(2)

    store.clearSelection()
    expect(store.selectedImageId).toBeNull()
    expect(store.blockIndex).toBeNull()
  })

  it('requests crop and opens/closes cropper', () => {
    const store = useImageCropStore()
    store.requestCrop()
    expect(store.cropRequestTimestamp).toBeGreaterThan(0)

    store.openCropper('img.png')
    expect(store.isCropperOpen).toBe(true)
    expect(store.imageToCropSrc).toBe('img.png')

    store.closeCropper()
    expect(store.isCropperOpen).toBe(false)
    expect(store.imageToCropSrc).toBeNull()
  })
})
