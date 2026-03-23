import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Editor } from '@tiptap/core'
import type { fabric } from 'fabric'

// Text formatting store: manages bold, italic, underline, font size, and color
// Supports Tiptap editor, contentEditable elements, and Fabric.Textbox (with multi-style)
export const useTextFormatStore = defineStore('textFormat', () => {
  // Formatting state
  const bold = ref(false)
  const italic = ref(false)
  const underline = ref(false)
  const fontSize = ref('Medium')
  const hasTextFocus = ref(false)
  const color = ref('#000000')

  // Editor references
  const activeEl = ref<HTMLElement | null>(null)      // Active contentEditable element
  const lastRange = ref<Range | null>(null)           // Saved text selection
  const tiptapEditor = ref<Editor | null>(null)       // Tiptap editor instance
  const fabricTextbox = ref<fabric.Textbox | null>(null) // Active Fabric textbox object
  const fabricCanvas = ref<fabric.Canvas | null>(null) // Canvas reference for rendering

  function setTiptapEditor(editor: Editor | null) {
    tiptapEditor.value = editor
    fabricTextbox.value = null
    fabricCanvas.value = null
    hasTextFocus.value = editor !== null
  }

  function setActiveEl(el: HTMLElement | null) {
    activeEl.value = el
  }

  // Set active Fabric textbox and read its current formatting state
  function setFabricTextbox(textbox: fabric.Textbox | null, canvas: fabric.Canvas | null) {
    fabricTextbox.value = textbox
    fabricCanvas.value = canvas
    tiptapEditor.value = null
    hasTextFocus.value = textbox !== null
    if (textbox) {
      updateFabricStatesFromObject(textbox)
    }
  }

  // Read formatting state from Fabric textbox object
  function updateFabricStatesFromObject(textbox: fabric.Textbox) {
    if (!textbox) return
    
    // Get state from first character or selected text
    const startIndex = textbox.selectionStart ?? 0
    const endIndex = textbox.selectionEnd ?? startIndex
    
    // For bold/italic/underline, check if any selected character has the property
    bold.value = textbox.fontWeight === 'bold' || textbox.fontWeight === 700
    italic.value = textbox.fontStyle === 'italic'
    underline.value = textbox.underline === true
    color.value = (textbox.fill as string) || '#000000'
    
    // Estimate font size category
    const size = textbox.fontSize || 16
    if (size <= 13) {
      fontSize.value = 'Small'
    } else if (size >= 19) {
      fontSize.value = 'Large'
    } else {
      fontSize.value = 'Medium'
    }
  }

  // Apply formatting with multi-style support (different styles per character)
  function applyFabricFormatting(styleObj: Record<string, any>) {
    if (!fabricTextbox.value) return
    
    const textbox = fabricTextbox.value
    
    // Check if textbox is in editing mode with selected text
    if (textbox.isEditing && textbox.selectionStart !== textbox.selectionEnd) {
      // Apply only to selected text using multi-style
      textbox.setSelectionStyles(styleObj)
    } else {
      // Apply to entire textbox
      textbox.set(styleObj)
    }
    
    // Render canvas and update state
    if (fabricCanvas.value) {
      fabricCanvas.value.renderAll()
    }
    updateFabricStatesFromObject(textbox)
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
      if (fabricTextbox.value) {
        updateFabricStatesFromObject(fabricTextbox.value)
        return
      }

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
    if (fabricTextbox.value) {
      const isBold = fabricTextbox.value.fontWeight === 'bold' || fabricTextbox.value.fontWeight === 700
      applyFabricFormatting({ fontWeight: isBold ? 'normal' : 'bold' })
      return
    }

    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().toggleBold().run()
      updateStatesFromCommand()
    } else {
      execCommand('bold')
    }
  }
  
  // Toggle italic
  const applyItalic = () => {
    if (fabricTextbox.value) {
      const isItalic = fabricTextbox.value.fontStyle === 'italic'
      applyFabricFormatting({ fontStyle: isItalic ? 'normal' : 'italic' })
      return
    }

    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().toggleItalic().run()
      updateStatesFromCommand()
    } else {
      execCommand('italic')
    }
  }
  
  // Toggle underline
  const applyUnderline = () => {
    if (fabricTextbox.value) {
      const isUnderlined = fabricTextbox.value.underline === true
      applyFabricFormatting({ underline: !isUnderlined })
      return
    }

    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().toggleUnderline().run()
      updateStatesFromCommand()
    } else {
      execCommand('underline')
    }
  }
  
  // Apply text color
  const applyColor = (value: string) => {
    if (fabricTextbox.value) {
      applyFabricFormatting({ fill: value })
      return
    }

    if (tiptapEditor.value) {
      tiptapEditor.value.chain().focus().setColor(value).run()
    } else {
      execCommand('foreColor', value)
    }
  }

  // Apply font size: Small (12px), Medium (16px), Large (20px)
  const applyFontSize = (sizeLabel: string) => {
    if (fabricTextbox.value) {
      const sizeMap: Record<string, number> = {
        'Small': 12,
        'Medium': 16,
        'Large': 20
      }
      const size = sizeMap[sizeLabel] || 16
      applyFabricFormatting({ fontSize: size })
      return
    }

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
    color,

    activeEl,
    lastRange,
    tiptapEditor,
    fabricTextbox,
    fabricCanvas,
    setTiptapEditor,
    setActiveEl,
    setFabricTextbox,
    updateFabricStatesFromObject,
    applyFabricFormatting,
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