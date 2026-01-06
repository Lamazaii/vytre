import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DeleteType = 'block' | 'image'

export const useDeletePopupStore = defineStore('deletePopup', () => {
  const isVisible = ref(false)
  const deleteType = ref<DeleteType>('block')
  const onConfirmCallback = ref<(() => void) | null>(null)

  function show(type: DeleteType, callback: () => void) {
    deleteType.value = type
    onConfirmCallback.value = callback
    isVisible.value = true
  }

  function confirm() {
    if (onConfirmCallback.value) {
      onConfirmCallback.value()
    }
    cancel()
  }

  function cancel() {
    isVisible.value = false
    onConfirmCallback.value = null
  }

  return {
    isVisible,
    deleteType,
    show,
    confirm,
    cancel
  }
})
