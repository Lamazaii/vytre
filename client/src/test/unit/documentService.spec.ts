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
})
