import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNameConflictPopupStore = defineStore('nameConflictPopup', () => {
  const isOpen = ref(false)
  const documentName = ref('')
  const resolveCallback = ref<((action: 'validate' | 'rename') => void) | null>(null)

  function show(name: string): Promise<'validate' | 'rename'> {
    documentName.value = name
    isOpen.value = true

    return new Promise((resolve) => {
      resolveCallback.value = resolve
    })
  }

  function handleValidate() {
    isOpen.value = false
    const callback = resolveCallback.value
    resolveCallback.value = null
    if (callback) callback('validate')
  }

  function handleRename() {
    isOpen.value = false
    const callback = resolveCallback.value
    resolveCallback.value = null
    if (callback) callback('rename')
  }

  return {
    isOpen,
    documentName,
    show,
    handleValidate,
    handleRename,
  }
})
