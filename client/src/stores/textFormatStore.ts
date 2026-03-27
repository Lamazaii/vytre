import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
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
  const activeEl = shallowRef<HTMLElement | null>(null)      // Active contentEditable element
  const lastRange = shallowRef<Range | null>(null)           // Saved text selection
  const tiptapEditor = shallowRef<Editor | null>(null)       // Tiptap editor instance
  const fabricTextbox = shallowRef<fabric.Textbox | null>(null) // Active Fabric textbox object
  const fabricCanvas = shallowRef<fabric.Canvas | null>(null) // Canvas reference for rendering

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

  // Resolve current style using selection style in editing mode when available.
  function getFabricCurrentStyle(textbox: fabric.Textbox) {
    if (textbox.isEditing) {
      const styles = textbox.getSelectionStyles()
      const firstStyle = styles && styles.length > 0 ? (styles[0] as Record<string, any>) : null
      if (firstStyle) {
        return {
          fontWeight: firstStyle.fontWeight ?? textbox.fontWeight,
          fontStyle: firstStyle.fontStyle ?? textbox.fontStyle,
          underline: firstStyle.underline ?? textbox.underline,
          fill: firstStyle.fill ?? textbox.fill,
          fontSize: firstStyle.fontSize ?? textbox.fontSize,
        }
      }
    }

    return {
      fontWeight: textbox.fontWeight,
      fontStyle: textbox.fontStyle,
      underline: textbox.underline,
      fill: textbox.fill,
      fontSize: textbox.fontSize,
    }
  }

  // Read formatting state from Fabric textbox object
  function updateFabricStatesFromObject(textbox: fabric.Textbox) {
    if (!textbox) return

    const currentStyle = getFabricCurrentStyle(textbox)
    bold.value = currentStyle.fontWeight === 'bold' || currentStyle.fontWeight === 700
    italic.value = currentStyle.fontStyle === 'italic'
    underline.value = currentStyle.underline === true
    color.value = (currentStyle.fill as string) || '#000000'
    
    // Estimate font size category
    const size = (currentStyle.fontSize as number) || 16
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
    
    // In editing mode, Fabric applies style as per-character style (multi-style).
    if (textbox.isEditing) {
      textbox.setSelectionStyles(styleObj)
    } else {
      // Apply to entire textbox
      textbox.set(styleObj)
    }

    textbox.set('dirty', true)
    
    // Render canvas and update state
    if (fabricCanvas.value) {
      fabricCanvas.value.requestRenderAll()
      fabricCanvas.value.fire('object:modified', { target: textbox } as any)
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
      const currentStyle = getFabricCurrentStyle(fabricTextbox.value)
      const isBold = currentStyle.fontWeight === 'bold' || currentStyle.fontWeight === 700
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
      const currentStyle = getFabricCurrentStyle(fabricTextbox.value)
      const isItalic = currentStyle.fontStyle === 'italic'
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
      const currentStyle = getFabricCurrentStyle(fabricTextbox.value)
      const isUnderlined = currentStyle.underline === true
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

  const bringTextForwardRequest = ref(0)
  const sendTextToBackRequest = ref(0)

  function requestBringTextForward() {
    bringTextForwardRequest.value++
  }

  function requestSendTextToBack() {
    sendTextToBackRequest.value++
  }

  function clearTextFocus() {
    hasTextFocus.value = false
    fabricTextbox.value = null
    fabricCanvas.value = null
  }

  return {
    bold,
    italic,
    underline,
    fontSize,
    hasTextFocus,
    color,
    bringTextForwardRequest,
    sendTextToBackRequest,

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

    requestBringTextForward,
    requestSendTextToBack,
  }
})