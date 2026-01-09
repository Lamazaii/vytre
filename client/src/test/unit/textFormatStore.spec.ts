import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTextFormatStore } from '../../stores/textFormatStore'

const makeEditor = () => {
  const setFontSize = vi.fn(() => ({ run: vi.fn() }))
  const setColor = vi.fn(() => ({ run: vi.fn() }))
  return {
    isActive: vi.fn().mockReturnValue(false),
    getAttributes: vi.fn().mockReturnValue({ fontSize: '20px' }),
    chain: () => ({
      focus: () => ({ setFontSize, setColor, run: vi.fn() }),
    }),
    setFontSize,
    setColor,
  }
}

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

describe('textFormatStore', () => {
  it('stores the active tiptap editor', () => {
    const store = useTextFormatStore()
    const editor = makeEditor()
    store.setTiptapEditor(editor as any)
    expect(store.tiptapEditor).toBe(editor)
  })

  it('applies font size through tiptap editor', () => {
    const store = useTextFormatStore()
    const editor = makeEditor()
    store.setTiptapEditor(editor as any)

    store.applyFontSize('Large')

    expect(editor.setFontSize).toHaveBeenCalledWith('20px')
    expect(store.fontSize).toBe('Large')
  })

  it('applies color through tiptap editor', () => {
    const store = useTextFormatStore()
    const editor = makeEditor()
    store.setTiptapEditor(editor as any)

    store.applyColor('#ff0000')

    expect(editor.setColor).toHaveBeenCalledWith('#ff0000')
  })

  it('resets formatting indicators', () => {
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
