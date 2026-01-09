import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmSavePopupStore = defineStore('confirmSavePopup', () => {
  const isOpen = ref(false)
  const message = ref('')
  const title = ref('Enregistré')

  function show(msg: string, popupTitle: string = 'Enregistré') {
    message.value = msg
    title.value = popupTitle
    isOpen.value = true
  }

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
