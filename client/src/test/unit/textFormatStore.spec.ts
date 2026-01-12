import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTextFormatStore } from '../../stores/textFormatStore'

const makeEditor = () => {
  const setFontSize = vi.fn()
  const setColor = vi.fn()
  
  return {
    isActive: vi.fn().mockReturnValue(false),
    getAttributes: vi.fn().mockReturnValue({ fontSize: '20px' }),
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        toggleBold: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleItalic: vi.fn().mockReturnValue({ run: vi.fn() }),
        toggleUnderline: vi.fn().mockReturnValue({ run: vi.fn() }),
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
  })
})
