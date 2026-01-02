import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useErrorPopupStore = defineStore('errorPopup', () => {
  const isOpen = ref(false)
  const message = ref('')

  function show(msg: string) {
    message.value = msg
    isOpen.value = true
  }

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
