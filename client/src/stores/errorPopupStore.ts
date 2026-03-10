import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useErrorPopupStore = defineStore('errorPopup', () => {
  // Error modal visibility and message content.
  const isOpen = ref(false)
  const message = ref('')

  // Display error popup with provided message.
  function show(msg: string) {
    message.value = msg
    isOpen.value = true
  }

  // Close error popup and reset message.
  function close() {
    isOpen.value = false
    message.value = ''
  }

  return { 
  isOpen,
  message,
  show,
  close 
  }
  
})
