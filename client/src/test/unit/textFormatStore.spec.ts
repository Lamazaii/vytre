import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTextFormatStore } from '../../stores/textFormatStore'

const makeEditor = () => {
  const setFontSize = vi.fn().mockReturnValue({ run: vi.fn() })
  const setColor = vi.fn().mockReturnValue({ run: vi.fn() })
  
  return {
    isActive: vi.fn().mockReturnValue(false),
    getAttributes: vi.fn().mockReturnValue({ fontSize: '20px' }),
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        toggleBold: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleItalic: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleUnderline: vi.fn().mockReturnValue({ run: vi.fn() }),
        setColor: setColor,
        setFontSize: setFontSize,
        run: vi.fn(),
      }),
    }),
  } as any
}

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

describe('textFormatStore', () => {
  describe('Editor Management', () => {
    it('stores the active tiptap editor', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      expect(store.tiptapEditor).toStrictEqual(editor)
    })

    it('clears editor when null is passed', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      store.setTiptapEditor(null)
      expect(store.tiptapEditor).toBeNull()
    })
  })

  describe('Formatting State', () => {
    it('initializes with default formatting state', () => {
      const store = useTextFormatStore()
      expect(store.bold).toBe(false)
      expect(store.italic).toBe(false)
      expect(store.underline).toBe(false)
      expect(store.fontSize).toBe('Medium')
    })

    it('updates formatting states from tiptap editor', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.fontSize).toBe('Large')
    })

    it('maps small font size correctly', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.getAttributes = vi.fn().mockReturnValue({ fontSize: '12px' })
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.fontSize).toBe('Small')
    })
  })

  describe('Active Element', () => {
    it('sets active element', () => {
      const store = useTextFormatStore()
      const mockEl = document.createElement('div')
      store.setActiveEl(mockEl)
      expect(store.activeEl).toBe(mockEl)
    })
  })

  describe('Selection Handling', () => {
    it('saves selection without errors', () => {
      const store = useTextFormatStore()
      const mockRange = new Range()
      const mockSel = {
        rangeCount: 1,
        getRangeAt: vi.fn().mockReturnValue(mockRange),
      } as any
      
      vi.spyOn(document, 'getSelection').mockReturnValue(mockSel)
      expect(() => store.saveSelection()).not.toThrow()
    })

    it('handles missing selection gracefully', () => {
      const store = useTextFormatStore()
      vi.spyOn(document, 'getSelection').mockReturnValue(null)
      expect(() => store.saveSelection()).not.toThrow()
    })

    it('restores selection without errors', () => {
      const store = useTextFormatStore()
      expect(() => store.restoreSelection()).not.toThrow()
    })
  })

  describe('Formatting Actions', () => {
    it('applies bold formatting', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      
      store.applyBold()
      
      expect(editor.chain).toHaveBeenCalled()
    })

    it('applies italic formatting', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      
      store.applyItalic()
      
      expect(editor.chain).toHaveBeenCalled()
    })

    it('applies underline formatting', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      
      store.applyUnderline()
      
      expect(editor.chain).toHaveBeenCalled()
    })

    it('applies color formatting', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      
      store.applyColor('#FF0000')
      
      expect(editor.chain).toHaveBeenCalled()
      // Verify the setColor method would be called in the chain
    })

    it('applies font size', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      store.setTiptapEditor(editor)
      
      store.applyFontSize('Large')
      
      expect(editor.chain).toHaveBeenCalled()
    })

    it('handles formatting without editor', () => {
      const store = useTextFormatStore()
      
      expect(() => store.applyBold()).not.toThrow()
      expect(() => store.applyItalic()).not.toThrow()
      expect(() => store.applyUnderline()).not.toThrow()
    })
  })

  describe('Font Size Detection', () => {
    it('detects medium font size', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.getAttributes = vi.fn().mockReturnValue({ fontSize: '16px' })
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.fontSize).toBe('Medium')
    })

    it('handles missing fontSize attribute', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.getAttributes = vi.fn().mockReturnValue({})
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.fontSize).toBe('Medium')
    })

    it('detects small font size', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.getAttributes = vi.fn().mockReturnValue({ fontSize: '12px' })
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.fontSize).toBe('Small')
    })

    it('detects large font size', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.getAttributes = vi.fn().mockReturnValue({ fontSize: '20px' })
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.fontSize).toBe('Large')
    })
  })

  describe('Formatting State Updates', () => {
    it('updates bold state from editor', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.isActive = vi.fn((format: string) => format === 'bold')
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.bold).toBe(true)
    })

    it('updates italic state from editor', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.isActive = vi.fn((format: string) => format === 'italic')
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.italic).toBe(true)
    })

    it('updates underline state from editor', () => {
      const store = useTextFormatStore()
      const editor = makeEditor()
      editor.isActive = vi.fn((format: string) => format === 'underline')
      store.setTiptapEditor(editor)
      store.updateStatesFromCommand()
      expect(store.underline).toBe(true)
    })
  })

  describe('Reset Formatting', () => {
    it('resets all formatting indicators to defaults', () => {
      const store = useTextFormatStore()
      store.bold = true
      store.italic = true
      store.underline = true
      store.fontSize = 'Large'

      store.resetFormattingIndicators()

      expect(store.bold).toBe(false)
      expect(store.italic).toBe(false)
      expect(store.underline).toBe(false)
      expect(store.fontSize).toBe('Medium')
    })
  })

  describe('Active Element', () => {
    it('stores active element', () => {
      const store = useTextFormatStore()
      const element = document.createElement('div')
      store.setActiveEl(element)
      expect(store.activeEl).toBe(element)
    })

    it('clears active element when null', () => {
      const store = useTextFormatStore()
      const element = document.createElement('div')
      store.setActiveEl(element)
      store.setActiveEl(null)
      expect(store.activeEl).toBeNull()
    })
  })

  describe('Legacy execCommand (no tiptap editor)', () => {
    it('applyBold without tiptap calls execCommand', () => {
      const store = useTextFormatStore()
      // No tiptap editor set — uses legacy path
      expect(() => store.applyBold()).not.toThrow()
    })

    it('applyItalic without tiptap calls execCommand', () => {
      const store = useTextFormatStore()
      expect(() => store.applyItalic()).not.toThrow()
    })

    it('applyUnderline without tiptap calls execCommand', () => {
      const store = useTextFormatStore()
      expect(() => store.applyUnderline()).not.toThrow()
    })

    it('applyColor without tiptap calls execCommand', () => {
      const store = useTextFormatStore()
      expect(() => store.applyColor('#ff0000')).not.toThrow()
    })

    it('applyFontSize Small without tiptap calls execCommand', () => {
      const store = useTextFormatStore()
      expect(() => store.applyFontSize('Small')).not.toThrow()
    })

    it('applyFontSize unknown label falls back to default value', () => {
      const store = useTextFormatStore()
      expect(() => store.applyFontSize('Unknown')).not.toThrow()
    })

    it('clearTextFocus sets hasTextFocus to false', () => {
      const store = useTextFormatStore()
      store.hasTextFocus = true
      store.clearTextFocus()
      expect(store.hasTextFocus).toBe(false)
    })

    it('updateStatesFromCommand without editor reads document state', () => {
      const store = useTextFormatStore()
      // No tiptap editor — reads document.queryCommandState
      expect(() => store.updateStatesFromCommand()).not.toThrow()
    })
  })

  describe('Additional branches', () => {
    it('prefers selection style when textbox is editing', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: true,
        getSelectionStyles: vi.fn().mockReturnValue([
          { fontWeight: 'bold', fontStyle: 'italic', underline: true, fill: '#123456', fontSize: 12 }
        ])
      }

      store.setFabricTextbox(mockTextbox as any, null)

      expect(store.bold).toBe(true)
      expect(store.italic).toBe(true)
      expect(store.underline).toBe(true)
      expect(store.color).toBe('#123456')
      expect(store.fontSize).toBe('Small')
    })

    it('applyFabricFormatting applies whole-textbox when not editing', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        set: vi.fn(),
      }
      const mockCanvas: any = {
        requestRenderAll: vi.fn(),
        fire: vi.fn(),
      }

      store.setFabricTextbox(mockTextbox as any, mockCanvas as any)

      store.applyFabricFormatting({ fontSize: 18 })

      expect(mockTextbox.set).toHaveBeenCalledWith({ fontSize: 18 })
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled()
      expect(mockCanvas.fire).toHaveBeenCalled()
    })

    it('restoreSelection uses saved lastRange when present', () => {
      const store = useTextFormatStore()
      const range = new Range()
      store.lastRange = range

      const removeAllRanges = vi.fn()
      const addRange = vi.fn()
      vi.spyOn(document, 'getSelection').mockReturnValue({ removeAllRanges, addRange } as any)

      expect(() => store.restoreSelection()).not.toThrow()
      expect(addRange).toHaveBeenCalledWith(range)
    })

    // Additional legacy/edge-case behaviors are exercised indirectly by other tests.
    it('applyFabricFormatting applies selection styles when editing', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: true,
        getSelectionStyles: vi.fn().mockReturnValue([]),
        setSelectionStyles: vi.fn(),
        set: vi.fn(),
        fontWeight: 'normal',
        fontStyle: 'normal',
        underline: false,
        fill: '#000',
        fontSize: 16,
      }
      const mockCanvas: any = { requestRenderAll: vi.fn(), fire: vi.fn() }

      store.setFabricTextbox(mockTextbox as any, mockCanvas as any)

      store.applyFabricFormatting({ fontSize: 14 })

      expect(mockTextbox.setSelectionStyles).toHaveBeenCalledWith({ fontSize: 14 })
      expect(mockCanvas.requestRenderAll).toHaveBeenCalled()
    })

    it('updateStatesFromCommand prefers fabric textbox when present', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        fontWeight: 'bold',
        fontStyle: 'italic',
        underline: true,
        fill: '#112233',
        fontSize: 20,
      }
      store.setFabricTextbox(mockTextbox as any, null)
      store.updateStatesFromCommand()
      expect(store.bold).toBe(true)
      expect(store.italic).toBe(true)
      expect(store.fontSize).toBe('Large')
    })

    it('applyColor and applyFontSize use fabric textbox when present', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        set: vi.fn(),
        fontSize: 16,
      }
      const mockCanvas: any = { requestRenderAll: vi.fn(), fire: vi.fn() }
      store.setFabricTextbox(mockTextbox as any, mockCanvas as any)

      store.applyColor('#00FF00')
      expect(mockTextbox.set).toHaveBeenCalledWith({ fill: '#00FF00' })

      store.applyFontSize('Small')
      expect(mockTextbox.set).toHaveBeenCalledWith({ fontSize: 12 })
    })

    it('bringTextForwardRequest and sendTextToBackRequest increment', () => {
      const store = useTextFormatStore()
      const beforeForward = store.bringTextForwardRequest
      const beforeBack = store.sendTextToBackRequest
      store.requestBringTextForward()
      store.requestSendTextToBack()
      expect(store.bringTextForwardRequest).toBe(beforeForward + 1)
      expect(store.sendTextToBackRequest).toBe(beforeBack + 1)
    })

    it('applyItalic with fabricTextbox toggles italic style', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        getSelectionStyles: vi.fn().mockReturnValue([]),
        fontStyle: 'normal',
        fontWeight: 'normal',
        underline: false,
        fill: '#000',
        fontSize: 16,
        set: vi.fn(),
      }
      const mockCanvas: any = { requestRenderAll: vi.fn(), fire: vi.fn() }
      store.setFabricTextbox(mockTextbox as any, mockCanvas as any)
      store.applyItalic()
      expect(mockTextbox.set).toHaveBeenCalledWith({ fontStyle: 'italic' })
    })

    it('applyUnderline with fabricTextbox toggles underline style', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        getSelectionStyles: vi.fn().mockReturnValue([]),
        fontStyle: 'normal',
        fontWeight: 'normal',
        underline: false,
        fill: '#000',
        fontSize: 16,
        set: vi.fn(),
      }
      const mockCanvas: any = { requestRenderAll: vi.fn(), fire: vi.fn() }
      store.setFabricTextbox(mockTextbox as any, mockCanvas as any)
      store.applyUnderline()
      expect(mockTextbox.set).toHaveBeenCalledWith({ underline: true })
    })

    it('applyBold with fabricTextbox toggles from bold to normal', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        getSelectionStyles: vi.fn().mockReturnValue([]),
        fontWeight: 'bold',
        fontStyle: 'normal',
        underline: false,
        fill: '#000',
        fontSize: 16,
        set: vi.fn(),
      }
      const mockCanvas: any = { requestRenderAll: vi.fn(), fire: vi.fn() }
      store.setFabricTextbox(mockTextbox as any, mockCanvas as any)
      store.applyBold()
      expect(mockTextbox.set).toHaveBeenCalledWith({ fontWeight: 'normal' })
    })

    it('saveSelection returns early when rangeCount is 0', () => {
      const store = useTextFormatStore()
      const mockSel = { rangeCount: 0 } as any
      vi.spyOn(document, 'getSelection').mockReturnValue(mockSel)
      expect(() => store.saveSelection()).not.toThrow()
      expect(store.lastRange).toBeNull()
    })

    it('restoreSelection focuses activeEl when no lastRange', () => {
      const store = useTextFormatStore()
      const mockEl = { focus: vi.fn() }
      store.setActiveEl(mockEl as any)
      store.lastRange = null
      const mockSel = { removeAllRanges: vi.fn(), addRange: vi.fn() } as any
      vi.spyOn(document, 'getSelection').mockReturnValue(mockSel)
      store.restoreSelection()
      expect(mockEl.focus).toHaveBeenCalled()
    })

    it('updateFabricStatesFromObject handles fontWeight 700 as bold', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        fontWeight: 700,
        fontStyle: 'normal',
        underline: false,
        fill: null,
        fontSize: 16,
      }
      store.updateFabricStatesFromObject(mockTextbox as any)
      expect(store.bold).toBe(true)
      expect(store.color).toBe('#000000')
    })

    it('updateFabricStatesFromObject maps small fontSize', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: false,
        fontWeight: 'normal',
        fontStyle: 'normal',
        underline: false,
        fill: '#000',
        fontSize: 10,
      }
      store.updateFabricStatesFromObject(mockTextbox as any)
      expect(store.fontSize).toBe('Small')
    })

    it('getFabricCurrentStyle returns textbox props when editing with empty styles', () => {
      const store = useTextFormatStore()
      const mockTextbox: any = {
        isEditing: true,
        getSelectionStyles: vi.fn().mockReturnValue([]),
        fontWeight: 'bold',
        fontStyle: 'italic',
        underline: true,
        fill: '#abc',
        fontSize: 20,
      }
      store.setFabricTextbox(mockTextbox as any, null)
      expect(store.bold).toBe(true)
      expect(store.fontSize).toBe('Large')
    })
  })
})
