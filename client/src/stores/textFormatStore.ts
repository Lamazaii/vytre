import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTextFormatStore = defineStore('textFormat', () => {
  const bold = ref(false)
  const italic = ref(false)
  const underline = ref(false)
  const fontSize = ref('Medium')

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

      const sizeValue = document.queryCommandValue('fontSize')
      const reverseMap: Record<string, string> = {
        '1': 'Small',
        '2': 'Medium',
        '4': 'Large'
      }
      if (sizeValue && reverseMap[sizeValue]) {
        fontSize.value = reverseMap[sizeValue]
      }
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

  const applyFontSize = (sizeLabel: string) => {
    const sizeMap: Record<string, string> = {
      'Small': '1',
      'Medium': '2',
      'Large': '4'
    }
    const value = sizeMap[sizeLabel] || '3'
    execCommand('fontSize', value)
  }

  function resetFormattingIndicators() {
    bold.value = false
    italic.value = false
    underline.value = false
    fontSize.value = 'Medium'
  }

  return {
    bold,
    italic,
    underline,
    fontSize,

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
    applyFontSize,
    resetFormattingIndicators,
  }
})