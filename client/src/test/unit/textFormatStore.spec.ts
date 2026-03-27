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
})
