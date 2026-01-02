import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTextFormatStore = defineStore('textFormat', () => {
  const bold = ref(false)
  const italic = ref(false)
  const underline = ref(false)

  const activeEl = ref<HTMLElement | null>(null)
  const lastRange = ref<Range | null>(null)

  function setActiveEl(el: HTMLElement | null) {
    activeEl.value = el
  }

  function saveSelection() {
    try {
      const sel = document.getSelection()
      if (!sel || sel.rangeCount === 0) return
      lastRange.value = sel.getRangeAt(0)
    } catch {}
  }

  function restoreSelection() {
    try {
      const sel = document.getSelection()
      if (!sel) return
      if (lastRange.value) {
        sel.removeAllRanges()
        sel.addRange(lastRange.value)
      } else if (activeEl.value) {
        activeEl.value.focus()
      }
    } catch {}
  }

  function updateStatesFromCommand() {
    try {
      bold.value = document.queryCommandState('bold')
      italic.value = document.queryCommandState('italic')
      underline.value = document.queryCommandState('underline')
    } catch {}
  }

  function execCommand(cmd: string, value?: string) {
    restoreSelection()
    try { document.execCommand(cmd, false, value) } catch {}
    saveSelection()
    updateStatesFromCommand()
  }

  const applyBold = () => execCommand('bold')
  const applyItalic = () => execCommand('italic')
  const applyUnderline = () => execCommand('underline')
  const applyColor = (value: string) => execCommand('foreColor', value)

  function resetFormattingIndicators() {
    bold.value = false
    italic.value = false
    underline.value = false
  }

  return {
    bold,
    italic,
    underline,

    activeEl,
    lastRange,
    setActiveEl,
    saveSelection,
    restoreSelection,
    updateStatesFromCommand,
    
    applyBold,
    applyItalic,
    applyUnderline,
    applyColor,
    resetFormattingIndicators,
  }
})
