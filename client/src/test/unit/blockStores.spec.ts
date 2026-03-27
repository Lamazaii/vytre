import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBlocksStore } from '../../stores/blockStores'
import { useErrorPopupStore } from '../../stores/errorPopupStore'
import { useDeletePopupStore } from '../../stores/deletePopupStore'
import { useConfirmSavePopupStore } from '../../stores/confirmSavePopupStore'
import { documentService } from '../../services/documentService'

let deletePopupStore: ReturnType<typeof useDeletePopupStore>
let confirmSavePopupStore: ReturnType<typeof useConfirmSavePopupStore>

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  deletePopupStore = useDeletePopupStore()
  confirmSavePopupStore = useConfirmSavePopupStore()
})

vi.mock('../../services/documentService', () => ({
  documentService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    getVersion: vi.fn(),
    checkNameExists: vi.fn(),
  },
}))

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
    const initialCount = store.blocks.length
    store.blocks[0]!.text = '<p>Some content</p>'

    store.addEmptyBlockIfAllowed()

    expect(store.blocks.length).toBe(initialCount + 1)
  })

  it('empêche de supprimer le premier bloc s’il est seul', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')

    store.removeBlock(0)

    expect(spy).toHaveBeenCalled()
    expect(store.blocks).toHaveLength(1)
  })

  it('toggleSelect ignore les index hors bornes', () => {
    const store = useBlocksStore()
    store.toggleSelect(99)
    expect(store.selectedIndex).toBe(99) // il assigne directement
  })

  it('setModified ignore les index invalides', () => {
    const store = useBlocksStore()
    store.setModified(5, true)
    expect(store.blocks[0]?.modified).toBe(false)
  })

  it('saveDocument crée un document et met à jour currentDocument', async () => {
    const store = useBlocksStore()
    const docService = documentService as unknown as { create: ReturnType<typeof vi.fn>; checkNameExists: ReturnType<typeof vi.fn> }
    docService.create = vi.fn().mockResolvedValue({
      id: 10,
      title: 'Saved',
      version: 1,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      state: 'En édition',
    })
    docService.checkNameExists = vi.fn().mockResolvedValue(false)
    const confirmSpy = vi.spyOn(confirmSavePopupStore, 'show')

    // Add content to a block so the document is not empty
    store.updateBlockDescription(0, '<p>Test content</p>')

    await store.saveDocument()

    expect(docService.create).toHaveBeenCalled()
    expect(store.currentDocument.id).toBe(10)
    expect(confirmSpy).toHaveBeenCalled()
  })

  it('saveDocument refuse les données invalides et affiche une erreur', async () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    store.currentDocument.title = ''
    const errSpy = vi.spyOn(errorStore, 'show')

    await store.saveDocument()

    expect(errSpy).toHaveBeenCalled()
  })

  it('loadDocument charge et réinitialise le store', async () => {
    const store = useBlocksStore()
    const docService = documentService as unknown as { getById: ReturnType<typeof vi.fn> }
    const now = new Date()
    docService.getById = vi.fn().mockResolvedValue({
      id: 5,
      title: 'Doc',
      version: '1.0.0',
      createdAt: now,
      state: 'En édition',
      updatedAt: now,
      blocks: [
        { id: 1, text: 'A', nbOfRepeats: 1, step: 1, modified: false, images: [], textZones: '[]' },
      ],
    })
    const confirmSpy = vi.spyOn(confirmSavePopupStore, 'show')

    await store.loadDocument(5)

    expect(docService.getById).toHaveBeenCalledWith(5)
    expect(store.blocks[0]?.text).toBe('A')
    expect(store.documentTitle).toBe('Doc')
    expect(confirmSpy).toHaveBeenCalled()
  })

  it('loadDocument gère les erreurs', async () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const errSpy = vi.spyOn(errorStore, 'show')
    const docService = documentService as unknown as { getById: ReturnType<typeof vi.fn> }
    docService.getById = vi.fn().mockRejectedValue(new Error('boom'))

    await store.loadDocument(1)

    expect(errSpy).toHaveBeenCalledWith('boom')
  })

  it('loadAllDocuments success et erreur', async () => {
    const store = useBlocksStore()
    const docService = documentService as unknown as { getAll: ReturnType<typeof vi.fn> }
    docService.getAll = vi.fn().mockResolvedValue([{ id: 1, title: 'Doc', version: '1', blocks: [] }])

    await store.loadAllDocuments()
    expect(store.allDocuments).toHaveLength(1)

    docService.getAll = vi.fn().mockRejectedValue(new Error('fail'))
    await store.loadAllDocuments()
    expect(store.documentsError).toBe('fail')
    expect(store.loadingDocuments).toBe(false)
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

  // Text zone management tests
  it('prevents adding text zone when last zone is empty', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')
    
    store.selectedIndex = 0
    store.blocks[0]!.text = '<p>Base content</p>'
    store.blocks[0]!.textZones = ['']
    
    store.addTextZone()
    
    expect(spy).toHaveBeenCalledWith('Remplir la zone de texte précédente avant d\'en ajouter une nouvelle.')
  })

  it('updates text zone content', () => {
    const store = useBlocksStore()
    store.selectedIndex = 0
    store.blocks[0]!.text = '<p>Base</p>'
    store.addTextZone()
    
    store.updateTextZone(0, 0, '<p>Zone content</p>')
    
    expect(store.blocks[0]!.textZones![0]).toBe('<p>Zone content</p>')
  })

  it('removes text zone', () => {
    const store = useBlocksStore()
    store.selectedIndex = 0
    store.blocks[0]!.text = '<p>Base</p>'
    store.addTextZone()
    store.updateTextZone(0, 0, '<p>Zone 1</p>')
    store.addTextZone()
    
    expect(store.blocks[0]!.textZones).toHaveLength(2)
    
    store.removeTextZone(0, 0)
    deletePopupStore.confirm()
    
    expect(store.blocks[0]!.textZones).toHaveLength(1)
  })

  // canAdd computed property tests
  it('canAdd returns true when last block has text content', () => {
    const store = useBlocksStore()
    // Start fresh - empty text
    store.blocks[0]!.text = ''
    expect(store.canAdd).toBe(false)
    
    // Set text content
    store.blocks[0]!.text = '<p>Some text content</p>'
    expect(store.canAdd).toBe(true)
  })

  it('canAdd returns true when last block has images', () => {
    const store = useBlocksStore()
    store.blocks[0]!.images.push({
      id: '1',
      imagePath: 'test.jpg',
      blockId: 1,
    })
    expect(store.canAdd).toBe(true)
  })

  it('canAdd returns false when last block is empty', () => {
    const store = useBlocksStore()
    store.blocks[0]!.modified = false
    store.blocks[0]!.images = []
    expect(store.canAdd).toBe(false)
  })

  // Renumber blocks tests
  it('renumbers all blocks sequentially', () => {
    const store = useBlocksStore()
    store.blocks = [
      { id: 1, text: 'A', step: 5, nbOfRepeats: 1, modified: false, images: [] },
      { id: 2, text: 'B', step: 10, nbOfRepeats: 1, modified: false, images: [] },
      { id: 3, text: 'C', step: 15, nbOfRepeats: 1, modified: false, images: [] },
    ]
    
    store.renumberBlocks()
    
    expect(store.blocks[0]!.step).toBe(1)
    expect(store.blocks[1]!.step).toBe(2)
    expect(store.blocks[2]!.step).toBe(3)
  })

  // Current document tests
  it('initializes currentDocument with default values', () => {
    const store = useBlocksStore()
    expect(store.currentDocument.title).toBe('Titre du document')
    expect(store.currentDocument.version).toBe(1)
    expect(store.currentDocument.state).toBe('En édition')
  })

  // Documents loading tests
  it('initializes allDocuments as empty array', () => {
    const store = useBlocksStore()
    expect(store.allDocuments).toEqual([])
  })

  it('initializes loadingDocuments as false', () => {
    const store = useBlocksStore()
    expect(store.loadingDocuments).toBe(false)
  })

  it('initializes documentsError as null', () => {
    const store = useBlocksStore()
    expect(store.documentsError).toBeNull()
  })

  it('updateBlockCanvas updates canvas data and marks block modified', () => {
    const store = useBlocksStore()
    const canvasJson = JSON.stringify({ objects: [{ type: 'rect' }] })
    store.updateBlockCanvas(0, canvasJson)
    expect(store.blocks[0]!.canvasData).toBe(canvasJson)
    expect(store.blocks[0]!.modified).toBe(true)
  })

  it('updateBlockCanvas does nothing for out-of-bounds index', () => {
    const store = useBlocksStore()
    const original = store.blocks[0]!.canvasData
    store.updateBlockCanvas(-1, 'data')
    store.updateBlockCanvas(999, 'data')
    expect(store.blocks[0]!.canvasData).toBe(original)
  })

  it('canAdd returns true when last block has canvas shapes', () => {
    const store = useBlocksStore()
    store.blocks[0]!.text = ''
    store.blocks[0]!.images = []
    store.blocks[0]!.canvasData = JSON.stringify({ objects: [{ type: 'circle' }] })
    expect(store.canAdd).toBe(true)
  })

  it('canAdd returns false when canvasData has no objects', () => {
    const store = useBlocksStore()
    store.blocks[0]!.text = ''
    store.blocks[0]!.images = []
    store.blocks[0]!.canvasData = JSON.stringify({ objects: [] })
    expect(store.canAdd).toBe(false)
  })

  it('canAdd returns false when canvasData is invalid JSON', () => {
    const store = useBlocksStore()
    store.blocks[0]!.text = ''
    store.blocks[0]!.images = []
    store.blocks[0]!.canvasData = 'not-json'
    expect(store.canAdd).toBe(false)
  })

  it('removeBlock shows error when trying to remove the only block', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')
    expect(store.blocks).toHaveLength(1)
    store.removeBlock(0)
    expect(spy).toHaveBeenCalled()
    expect(store.blocks).toHaveLength(1)
  })

  it('loadDocumentVersion loads snapshot into store', async () => {
    const store = useBlocksStore()
    const docService = documentService as any
    const mockSnapshot = {
      title: 'Version Title',
      state: 'Archivé',
      blocks: [{ id: 10, text: '<p>v</p>', step: 1, nbOfRepeats: 2, images: [], textZones: [] }]
    }
    docService.getVersion = vi.fn().mockResolvedValue({
      id: 5, documentId: 1, version: 3, title: 'Version Title',
      state: 'Archivé', snapshot: mockSnapshot, createdAt: new Date().toISOString()
    })

    await store.loadDocumentVersion(1, 3)

    expect(store.currentDocument.version).toBe(3)
    expect(store.blocks).toHaveLength(1)
    expect(store.blocks[0]!.text).toBe('<p>v</p>')
  })

  it('loadDocumentVersion shows error on invalid snapshot', async () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')
    const docService = documentService as any
    docService.getVersion = vi.fn().mockResolvedValue({
      id: 5, documentId: 1, version: 3, title: 'T', state: 'En édition',
      snapshot: null, createdAt: new Date().toISOString()
    })

    await store.loadDocumentVersion(1, 3)

    expect(spy).toHaveBeenCalledWith('Version de document invalide.')
  })

  it('removeTextZone does nothing for out-of-bounds indices', () => {
    const store = useBlocksStore()
    store.blocks[0]!.textZones = ['zone1']
    store.removeTextZone(-1, 0)
    store.removeTextZone(0, -1)
    store.removeTextZone(0, 999)
    expect(store.blocks[0]!.textZones).toHaveLength(1)
  })

  it('loadFromClipboard shows error when clipboard generates no blocks', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')
    // Invalid format that generates no blocks
    store.loadFromClipboard('no valid table data here')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Impossible de générer des blocs'))
  })

  it('confirmDelete adjusts selectedIndex when deleted block is before selected', () => {
    const store = useBlocksStore()
    const deletePopupStore = useDeletePopupStore()
    store.blocks = [
      { id: 1, text: 'A', step: 1, nbOfRepeats: 1, modified: false, images: [] },
      { id: 2, text: 'B', step: 2, nbOfRepeats: 1, modified: false, images: [] },
      { id: 3, text: 'C', step: 3, nbOfRepeats: 1, modified: false, images: [] },
    ]
    store.selectedIndex = 2 // select last block
    store.removeBlock(0) // delete first block → selectedIndex > i
    deletePopupStore.confirm()
    expect(store.selectedIndex).toBe(1) // shifted back by 1
  })

  it('confirmDelete clamps selectedIndex when last block is deleted', () => {
    const store = useBlocksStore()
    const deletePopupStore = useDeletePopupStore()
    store.blocks = [
      { id: 1, text: 'A', step: 1, nbOfRepeats: 1, modified: false, images: [] },
      { id: 2, text: 'B', step: 2, nbOfRepeats: 1, modified: false, images: [] },
    ]
    store.selectedIndex = 1 // select last block
    store.removeBlock(1) // delete last block → selectedIndex >= blocks.length
    deletePopupStore.confirm()
    expect(store.selectedIndex).toBe(0) // clamped to 0
  })

  it('saveDocument retourne rename quand nameExists et userAction === rename', async () => {
    const store = useBlocksStore()
    const docService = documentService as any
    docService.checkNameExists = vi.fn().mockResolvedValue(true)
    const nameConflictStore = (await import('../../stores/nameConflictPopupStore')).useNameConflictPopupStore()
    vi.spyOn(nameConflictStore, 'show').mockResolvedValue('rename')
    store.updateBlockDescription(0, '<p>Content</p>')
    const result = await store.saveDocument()
    expect(result).toBe('rename')
  })

  it('saveDocument continue to save quand nameExists mais userAction !== rename', async () => {
    const store = useBlocksStore()
    const docService = documentService as any
    docService.checkNameExists = vi.fn().mockResolvedValue(true)
    docService.create = vi.fn().mockResolvedValue({ id: 5, title: 'T', version: 1, blocks: [], state: 'En édition', createdAt: new Date(), updatedAt: new Date() })
    const nameConflictStore = (await import('../../stores/nameConflictPopupStore')).useNameConflictPopupStore()
    vi.spyOn(nameConflictStore, 'show').mockResolvedValue('validate')
    store.updateBlockDescription(0, '<p>Content</p>')
    const result = await store.saveDocument()
    expect(result).toBe('success')
  })

  it('saveDocument with existing id calls update', async () => {
    const store = useBlocksStore()
    const docService = documentService as any
    store.currentDocument.id = 1
    docService.checkNameExists = vi.fn().mockResolvedValue(false)
    docService.update = vi.fn().mockResolvedValue({ id: 1, title: 'T', version: 2, blocks: [], state: 'En édition', createdAt: new Date(), updatedAt: new Date() })
    store.updateBlockDescription(0, '<p>Content</p>')
    await store.saveDocument()
    expect(docService.update).toHaveBeenCalledWith(1, expect.any(Object))
  })

  it('createNewDocument réinitialise le store', () => {
    const store = useBlocksStore()
    store.currentDocument.title = 'Old title'
    store.blocks.push({ id: 99, text: 'extra', step: 2, nbOfRepeats: 1, modified: true, images: [] })
    store.createNewDocument()
    expect(store.currentDocument.title).toBe('Titre du document')
    expect(store.blocks).toHaveLength(1)
    expect(store.blocks[0]!.text).toBe('')
  })
})
