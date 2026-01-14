import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNameConflictPopupStore = defineStore('nameConflictPopup', () => {
  const isOpen = ref(false)
  const documentName = ref('')

  function show(name: string) {
    documentName.value = name
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    documentName,
    show,
    close,
  }
})
