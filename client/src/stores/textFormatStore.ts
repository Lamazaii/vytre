import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Editor } from '@tiptap/core'

// Text formatting store: manages bold, italic, underline, font size, and color
// Supports both Tiptap editor and contentEditable elements
export const useTextFormatStore = defineStore('textFormat', () => {
  // Formatting state
  const bold = ref(false)
  const italic = ref(false)
  const underline = ref(false)
  const fontSize = ref('Medium')
  const hasTextFocus = ref(false)

  // Editor references
  const activeEl = ref<HTMLElement | null>(null)      // Active contentEditable element
  const lastRange = ref<Range | null>(null)           // Saved text selection
  const tiptapEditor = ref<Editor | null>(null)       // Tiptap editor instance

  function setTiptapEditor(editor: Editor | null) {
    tiptapEditor.value = editor
    hasTextFocus.value = editor !== null
  }

  function setActiveEl(el: HTMLElement | null) {
    activeEl.value = el
  }

  // Save current text selection
  function saveSelection() {
    try {
      const sel = document.getSelection()
      if (!sel || sel.rangeCount === 0) return
      lastRange.value = sel.getRangeAt(0)
    } catch {}
  }

  // Restore saved text selection
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

  // Update formatting indicators based on current selection
  function updateStatesFromCommand() {
    try {
      if (tiptapEditor.value) {
        // Tiptap: check active marks
        bold.value = tiptapEditor.value.isActive('bold')
        italic.value = tiptapEditor.value.isActive('italic')
        underline.value = tiptapEditor.value.isActive('underline')
        
        // Get font size from textStyle
        const attrs = tiptapEditor.value.getAttributes('textStyle')
        if (attrs.fontSize) {
          const size = attrs.fontSize
          if (size.includes('12px') || size.includes('small')) {
            fontSize.value = 'Small'
          } else if (size.includes('20px') || size.includes('large')) {
            fontSize.value = 'Large'
          } else {
            fontSize.value = 'Medium'
          }
        } else {
          fontSize.value = 'Medium'
        }
      } else {
        // ContentEditable: use deprecated queryCommandState
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
      }
    } catch {}
  }

  // Execute formatting command on contentEditable (legacy)
  function execCommand(cmd: string, value?: string) {
    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().run()
      return
    }

    restoreSelection()
    try { document.execCommand(cmd, false, value) } catch {}
    saveSelection()
    updateStatesFromCommand()
  }

  // Toggle bold
  const applyBold = () => {
    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().toggleBold().run()
      updateStatesFromCommand()
    } else {
      execCommand('bold')
    }
  }
  
  // Toggle italic
  const applyItalic = () => {
    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().toggleItalic().run()
      updateStatesFromCommand()
    } else {
      execCommand('italic')
    }
  }
  
  // Toggle underline
  const applyUnderline = () => {
    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().toggleUnderline().run()
      updateStatesFromCommand()
    } else {
      execCommand('underline')
    }
  }
  
  // Apply text color
  const applyColor = (value: string) => {
    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().setColor(value).run()
    } else {
      execCommand('foreColor', value)
    }
  }

  // Apply font size: Small (12px), Medium (16px), Large (20px)
  const applyFontSize = (sizeLabel: string) => {
    if (tiptapEditor.value) {
      const sizeMap: Record<string, string> = {
        'Small': '12px',
        'Medium': '16px',
        'Large': '20px'
      }
      const size = sizeMap[sizeLabel] || '16px'
      tiptapEditor.value.chain().focus().setFontSize(size).run()
      updateStatesFromCommand()
    } else {
      const sizeMap: Record<string, string> = {
        'Small': '1',
        'Medium': '2',
        'Large': '4'
      }
      const value = sizeMap[sizeLabel] || '3'
      execCommand('fontSize', value)
    }
  }

  // Reset formatting indicators to default
  function resetFormattingIndicators() {
    bold.value = false
    italic.value = false
    underline.value = false
    fontSize.value = 'Medium'
  }

  function clearTextFocus() {
    hasTextFocus.value = false
  }

  return {
    bold,
    italic,
    underline,
    fontSize,
    hasTextFocus,

    activeEl,
    lastRange,
    tiptapEditor,
    setTiptapEditor,
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
    clearTextFocus,
  }
})