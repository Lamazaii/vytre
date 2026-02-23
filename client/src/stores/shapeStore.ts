import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ShapeType = 'square' | 'circle' | 'triangle' | null

export const useShapeStore = defineStore('shape', () => {
  const activeShape = ref<ShapeType>(null)
  const addShapeRequest = ref(0)

  function setActiveShape(shape: ShapeType) {
    activeShape.value = shape
  }

  function clearActiveShape() {
    activeShape.value = null
  }

  function requestAddShape() {
    addShapeRequest.value++
  }

  return {
    activeShape,
    addShapeRequest,
    setActiveShape,
    clearActiveShape,
    requestAddShape
  }
})
