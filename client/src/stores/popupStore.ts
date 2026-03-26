import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePopupStore = defineStore('popup', () => {
  // Clipboard popup and reader mode visibility flags.
  const isOpen = ref(false)
  const isReaderOpen = ref(false)

  // Open/close clipboard popup.
  function openPopup() {
    isOpen.value = true
  }

  function closePopup() {
    isOpen.value = false
  }

  // Open/close reader preview modal.
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
