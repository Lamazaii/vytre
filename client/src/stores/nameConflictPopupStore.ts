import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNameConflictPopupStore = defineStore('nameConflictPopup', () => {
  // Popup visibility and conflicting name value.
  const isOpen = ref(false)
  const documentName = ref('')
  // Promise resolver used to return user's decision.
  const resolveCallback = ref<((action: 'validate' | 'rename') => void) | null>(null)

  // Open conflict popup and wait for user choice.
  function show(name: string): Promise<'validate' | 'rename'> {
    documentName.value = name
    isOpen.value = true

    return new Promise((resolve) => {
      resolveCallback.value = resolve
    })
  }

  // User chooses to keep/validate existing name.
  function handleValidate() {
    isOpen.value = false
    const callback = resolveCallback.value
    resolveCallback.value = null
    if (callback) callback('validate')
  }

  // User chooses to rename document.
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
