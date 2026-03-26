import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DeleteType = 'block' | 'image'

export const useDeletePopupStore = defineStore('deletePopup', () => {
  // Modal visibility and delete target kind.
  const isVisible = ref(false)
  const deleteType = ref<DeleteType>('block')
  // Deferred callback executed on user confirmation.
  const onConfirmCallback = ref<(() => void) | null>(null)

  // Open modal with target type and confirmation callback.
  function show(type: DeleteType, callback: () => void) {
    deleteType.value = type
    onConfirmCallback.value = callback
    isVisible.value = true
  }

  // Execute callback then close/reset modal state.
  function confirm() {
    if (onConfirmCallback.value) {
      onConfirmCallback.value()
    }
    cancel()
  }

  // Cancel deletion and clear callback.
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
