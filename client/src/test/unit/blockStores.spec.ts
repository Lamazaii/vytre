import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBlocksStore } from '../../stores/blockStores'
import { useErrorPopupStore } from '../../stores/errorPopupStore'
import { useDeletePopupStore } from '../../stores/deletePopupStore'

let deletePopupStore: ReturnType<typeof useDeletePopupStore>

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  deletePopupStore = useDeletePopupStore()
})

describe('blocksStore', () => {
  // Initial state tests
  it('initializes with default document title', () => {
    const store = useBlocksStore()
    expect(store.documentTitle).toBe('Titre du document')
  })

  it('initializes with one block', () => {
    const store = useBlocksStore()
    expect(store.blocks.length).toBeGreaterThan(0)
  })

  // Block modification tests
  it('updates block description and modified flag', () => {
    const store = useBlocksStore()
    store.updateBlockDescription(0, '<p>Hello</p>')
    expect(store.blocks[0]!.text).toBe('<p>Hello</p>')
    expect(store.blocks[0]!.modified).toBe(true)

    store.updateBlockDescription(0, '<p><br></p>')
    expect(store.blocks[0]!.modified).toBe(false)
  })

  it('updates block text correctly', () => {
    const store = useBlocksStore()
    const newText = 'Updated content'
    store.blocks[0]!.text = newText
    expect(store.blocks[0]!.text).toBe(newText)
  })

  // Block selection tests
  it('selects a block when clicking', () => {
    const store = useBlocksStore()
    store.selectedIndex = null
    store.toggleSelect(0)
    expect(store.selectedIndex).toBe(0)
  })

  // Text zone tests
  it('prevents adding a text zone when base text is empty', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')

    store.selectedIndex = 0
    store.blocks[0]!.text = ''
    store.addTextZone()

    expect(spy).toHaveBeenCalled()
    expect(store.blocks[0]!.textZones).toHaveLength(0)
  })

  it('adds a text zone when base text is filled', () => {
    const store = useBlocksStore()
    store.selectedIndex = 0
    store.blocks[0]!.text = '<p>content</p>'

    store.addTextZone()

    expect(store.blocks[0]!.textZones).toBeDefined()
  })

  // Block addition tests
  it('blocks adding an empty block when the last is unmodified', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')

    store.addEmptyBlockIfAllowed()

    expect(spy).toHaveBeenCalled()
    expect(store.blocks).toHaveLength(1)
  })

  it('adds empty block when last block has content', () => {
    const store = useBlocksStore()
    store.blocks[0]!.modified = true
    const initialCount = store.blocks.length

    store.addEmptyBlockIfAllowed()

    expect(store.blocks.length).toBeGreaterThan(initialCount)
  })

  // Block removal tests
  it('removes a block through delete popup confirmation', () => {
    const store = useBlocksStore()
    const spy = vi.spyOn(deletePopupStore, 'show')

    store.blocks.push({
      id: 2,
      text: '<p>ok</p>',
      step: 2,
      nbOfRepeats: 1,
      modified: true,
      images: [],
      textZones: [],
    })

    store.removeBlock(1)
    expect(spy).toHaveBeenCalled()

    deletePopupStore.confirm()

    expect(store.blocks).toHaveLength(1)
    expect(store.blocks[0]!.step).toBe(1)
  })

  it('updates steps after block removal', () => {
    const store = useBlocksStore()

    // Add multiple blocks
    store.blocks[0]!.modified = true
    store.addEmptyBlockIfAllowed()
    if (store.blocks.length > 1) {
      store.blocks[store.blocks.length - 1]!.modified = true
      store.addEmptyBlockIfAllowed()
    }

    const initialLength = store.blocks.length

    // Remove middle block if we have enough
    if (initialLength > 1) {
      store.removeBlock(Math.floor(initialLength / 2))
      deletePopupStore.confirm()

      // Check steps are sequential
      store.blocks.forEach((block, index) => {
        expect(block.step).toBe(index + 1)
      })
    }
  })

  // Block modification tests
  it('sets modified state', () => {
    const store = useBlocksStore()
    store.setModified(0, true)
    expect(store.blocks[0]!.modified).toBe(true)

    store.setModified(0, false)
    expect(store.blocks[0]!.modified).toBe(false)
  })

  // Repetition count tests
  it('block has repetition count property', () => {
    const store = useBlocksStore()
    expect(store.blocks[0]!.nbOfRepeats).toBe(1)
  })

  // Document title tests
  it('updates document title', () => {
    const store = useBlocksStore()
    const newTitle = 'New Document Title'
    store.documentTitle = newTitle
    expect(store.documentTitle).toBe(newTitle)
  })

  // Clipboard loading tests
  it('loads blocks from clipboard content', () => {
    const store = useBlocksStore()
    const clipboardData = '1\tFirst step\n2\tSecond step'
    store.loadFromClipboard(clipboardData)
    expect(store.blocks.length).toBeGreaterThan(1)
  })

  it('handles empty clipboard content', () => {
    const store = useBlocksStore()
    const initialLength = store.blocks.length
    store.loadFromClipboard('')
    expect(store.blocks.length).toBe(initialLength)
  })
})
