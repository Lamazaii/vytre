import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmSavePopupStore = defineStore('confirmSavePopup', () => {
  // Popup visibility and displayed content.
  const isOpen = ref(false)
  const message = ref('')
  const title = ref('Enregistré')

  // Open popup with custom message/title.
  function show(msg: string, popupTitle: string = 'Enregistré') {
    message.value = msg
    title.value = popupTitle
    isOpen.value = true
  }

  // Close popup and reset content.
  function close() {
    isOpen.value = false
    message.value = ''
    title.value = 'Enregistré'
  }

  return { 
    isOpen,
    message,
    title,
    show,
    close 
  }
})
