import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePopupStore = defineStore('popup', () => {
  const isOpen = ref(false)

  function openPopup() {
    isOpen.value = true
  }

  function closePopup() {
    isOpen.value = false
  }


  return {
    isOpen,
    openPopup,
    closePopup,
  }
})
