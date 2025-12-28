import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePopupStore = defineStore('popup', () => {
  const isOpen = ref(false)
  const isReaderOpen = ref(false)

  function openPopup() {
    isOpen.value = true
  }

  function closePopup() {
    isOpen.value = false
  }

  function openReader() {
    isReaderOpen.value = true
  }

  function closeReader() {
    isReaderOpen.value = false
  }

  return {
    isOpen,
    openPopup,
    closePopup,
    isReaderOpen,
    openReader,
    closeReader,
  }
})
