import { describe, it, expect, vi, beforeEach } from 'vitest'
import { documentService } from '../../services/documentService'

// Mock fetch globally
global.fetch = vi.fn()

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('creates a new document successfully', async () => {
      const newDocument = {
        title: 'New Doc',
        version: '1.0',
        blocks: [],
        state: 'En édition',
      }

      const createdDocument = { ...newDocument, id: 1, createdAt: new Date(), updatedAt: new Date() }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createdDocument,
      })

      const result = await documentService.create(newDocument)

      expect(result).toEqual(createdDocument)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocument),
      })
    })

    it('throws error on creation failure', async () => {
      const newDocument = {
        title: 'New Doc',
        version: '1.0',
        blocks: [],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
      })

      await expect(documentService.create(newDocument)).rejects.toThrow()
    })
  })

  describe('getById', () => {
    it('fetches document by ID successfully', async () => {
      const mockDocument = { id: 123, title: 'Test Doc', version: '1.0', blocks: [], createdAt: new Date(), updatedAt: new Date() }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocument,
      })

      const result = await documentService.getById(123)

      expect(result).toEqual(mockDocument)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/123', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('throws error when document not found', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(documentService.getById(999)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates an existing document successfully', async () => {
      const updatedDocument = {
        id: 123,
        title: 'Updated Doc',
        version: '2.0',
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedDocument,
      })

      const result = await documentService.update(123, { title: 'Updated Doc' })

      expect(result).toEqual(updatedDocument)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Doc' }),
      })
    })

    it('throws error on update failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(documentService.update(123, { title: 'Doc' })).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('deletes a document successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
      })

      await documentService.delete(123)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/123', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('throws error on deletion failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(documentService.delete(999)).rejects.toThrow()
    })
  })

  describe('getAll', () => {
    it('fetches all documents successfully', async () => {
      const mockDocuments = [
        { id: 1, title: 'Doc 1', version: '1.0', blocks: [], createdAt: new Date(), updatedAt: new Date() },
        { id: 2, title: 'Doc 2', version: '1.0', blocks: [], createdAt: new Date(), updatedAt: new Date() },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocuments,
      })

      const result = await documentService.getAll()

      expect(result).toEqual(mockDocuments)
      expect(result).toHaveLength(2)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('throws error when fetching all documents fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(documentService.getAll()).rejects.toThrow('Erreur lors de la récupération des documents')
    })

    it('returns empty array when no documents exist', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const result = await documentService.getAll()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })

  describe('getVersions', () => {
    it('fetches versions for a document successfully', async () => {
      const mockVersions = [
        { id: 1, documentId: 5, version: 1, title: 'Doc', state: 'En édition', snapshot: '{}', createdAt: new Date() },
        { id: 2, documentId: 5, version: 2, title: 'Doc', state: 'Actif', snapshot: '{}', createdAt: new Date() },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVersions,
      })

      const result = await documentService.getVersions(5)

      expect(result).toEqual(mockVersions)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/5/versions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('throws error when fetching versions fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500 })

      await expect(documentService.getVersions(5)).rejects.toThrow('Erreur lors de la récupération des versions')
    })
  })

  describe('getVersion', () => {
    it('fetches a specific version successfully', async () => {
      const mockVersion = {
        id: 1, documentId: 5, version: 2, title: 'Doc', state: 'Actif', snapshot: '{}', createdAt: new Date(),
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVersion,
      })

      const result = await documentService.getVersion(5, 2)

      expect(result).toEqual(mockVersion)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/5/versions/2', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('throws error when fetching a specific version fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({ ok: false, status: 404 })

      await expect(documentService.getVersion(5, 99)).rejects.toThrow('Erreur lors de la récupération de la version')
    })
  })

  describe('checkNameExists', () => {
    it('returns true when title already exists', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, title: 'Existing Doc', version: 1, blocks: [] },
          { id: 2, title: 'Another Doc', version: 1, blocks: [] },
        ],
      })

      const result = await documentService.checkNameExists('Existing Doc')
      expect(result).toBe(true)
    })

    it('returns false when title does not exist', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, title: 'Other Doc', version: 1, blocks: [] },
        ],
      })

      const result = await documentService.checkNameExists('New Doc')
      expect(result).toBe(false)
    })

    it('excludes document by id when excludeId is provided', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, title: 'My Doc', version: 1, blocks: [] },
        ],
      })

      // Same title but excluded by id=3
      const result = await documentService.checkNameExists('My Doc', 3)
      expect(result).toBe(false)
    })

    it('returns true when same title exists for a different document id', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 7, title: 'My Doc', version: 1, blocks: [] },
        ],
      })

      // excludeId=3 but the matching doc has id=7
      const result = await documentService.checkNameExists('My Doc', 3)
      expect(result).toBe(true)
    })
  })

  describe('updateState', () => {
    it('updates document state successfully', async () => {
      const updatedDoc = { id: 1, title: 'Doc', version: 1, blocks: [], state: 'Actif' }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedDoc,
      })

      const result = await documentService.updateState(1, 'Actif')

      expect(result).toEqual(updatedDoc)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/1/state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'Actif' }),
      })
    })

    it('throws error when updateState fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500 })

      await expect(documentService.updateState(1, 'Actif')).rejects.toThrow()
    })
  })

  describe('updateVersionState', () => {
    it('updates a version state successfully', async () => {
      const updatedVersion = {
        id: 10, documentId: 1, version: 2, title: 'Doc', state: 'Archivé', snapshot: '{}', createdAt: new Date(),
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedVersion,
      })

      const result = await documentService.updateVersionState(1, 10, 'Archivé')

      expect(result).toEqual(updatedVersion)
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/documents/1/versions/10/state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'Archivé' }),
      })
    })

    it('throws error when updateVersionState fails', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500 })

      await expect(documentService.updateVersionState(1, 10, 'Archivé')).rejects.toThrow()
    })
  })

  describe('error handling', () => {
    it('throws specific error message from API on create failure', async () => {
      const errorMessage = 'Document title is required'
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      })

      await expect(documentService.create({ title: '', version: '1.0', blocks: [] }))
        .rejects.toThrow(errorMessage)
    })

    it('throws default error message when API error has no message', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(documentService.create({ title: 'Test', version: '1.0', blocks: [] }))
        .rejects.toThrow('Erreur lors de la création du document')
    })
  })
})
