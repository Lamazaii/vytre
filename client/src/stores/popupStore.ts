import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Blocks } from '../types/Blocks'

export const usePopupStore = defineStore('popup', () => {
  const isOpen = ref(false)
  const isReaderOpen = ref(false)
  const blocks = ref<Blocks[]>([])

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

  function setBlocks(newBlocks: Blocks[]) {
    blocks.value = newBlocks
  }

  function getBlocks() {
    return blocks.value
  }

  function addBlock(block: Blocks) {
    blocks.value.push(block)
  }

  return {
    isOpen,
    openPopup,
    closePopup,
    isReaderOpen,
    openReader,
    closeReader,
    blocks,
    setBlocks,
    getBlocks,
    addBlock,
  }
})
