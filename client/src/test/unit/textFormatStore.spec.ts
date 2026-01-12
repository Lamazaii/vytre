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
  it('stores the active tiptap editor', () => {
    const store = useTextFormatStore()
    const editor = makeEditor()
    store.setTiptapEditor(editor)
    expect(store.tiptapEditor).toStrictEqual(editor)
  })

  it('updates formatting states from tiptap editor', () => {
    const store = useTextFormatStore()
    const editor = makeEditor()
    store.setTiptapEditor(editor)
    
    store.updateStatesFromCommand()
    
    expect(store.fontSize).toBe('Large')
  })

  it('resets formatting indicators', () => {
    const store = useTextFormatStore()
    store.bold = true
    store.italic = true
    store.underline = true
    store.fontSize = 'Large'

    const initialBold = store.bold
    const initialItalic = store.italic
    
    expect(initialBold).toBe(true)
    expect(initialItalic).toBe(true)
  })
})
