import { describe, it, expect } from 'vitest'
import { documentSchema } from '../../validators/documentValidator'

describe('documentValidator', () => {
  describe('documentSchema', () => {
    // Test valid document
    it('validates a complete valid document', () => {
      const validDocument = {
        id: 1,
        title: 'Test Document',
        version: '1.0',
        blocks: [
          {
            id: 1,
            text: 'Block text',
            step: 1,
            nbOfRepeats: 3,
            images: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = documentSchema.safeParse(validDocument)
      expect(result.success).toBe(true)
    })

    // Test minimal valid document
    it('validates minimal document with required fields only', () => {
      const minimalDocument = {
        title: 'Minimal Doc',
        version: '1.0',
      }

      const result = documentSchema.safeParse(minimalDocument)
      expect(result.success).toBe(true)
    })

    // Test empty title
    it('rejects document with empty title', () => {
      const invalidDocument = {
        title: '',
        version: '1.0',
      }

      const result = documentSchema.safeParse(invalidDocument)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le titre ne peut pas être vide')
      }
    })

    // Test missing title
    it('rejects document without title', () => {
      const invalidDocument = {
        version: '1.0',
      }

      const result = documentSchema.safeParse(invalidDocument)
      expect(result.success).toBe(false)
    })

    // Test empty version
    it('rejects document with empty version', () => {
      const invalidDocument = {
        title: 'Test',
        version: '',
      }

      const result = documentSchema.safeParse(invalidDocument)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La version est requise')
      }
    })

    // Test missing version
    it('rejects document without version', () => {
      const invalidDocument = {
        title: 'Test',
      }

      const result = documentSchema.safeParse(invalidDocument)
      expect(result.success).toBe(false)
    })

    // Test optional fields
    it('accepts document without optional fields', () => {
      const document = {
        title: 'Test',
        version: '1.0',
      }

      const result = documentSchema.safeParse(document)
      expect(result.success).toBe(true)
    })

    // Test blocks array
    it('validates document with blocks array', () => {
      const documentWithBlocks = {
        title: 'Test',
        version: '1.0',
        blocks: [
          { id: 1, text: 'Block 1', step: 1, nbOfRepeats: 1, images: [] },
          { id: 2, text: 'Block 2', step: 2, nbOfRepeats: 2, images: [] },
        ],
      }

      const result = documentSchema.safeParse(documentWithBlocks)
      expect(result.success).toBe(true)
    })

    // Test empty blocks array
    it('validates document with empty blocks array', () => {
      const document = {
        title: 'Test',
        version: '1.0',
        blocks: [],
      }

      const result = documentSchema.safeParse(document)
      expect(result.success).toBe(true)
    })
  })

  describe('blockSchema', () => {
    // Test valid block
    it('validates valid block', () => {
      const validBlock = {
        id: 1,
        text: 'Block text',
        step: 1,
        nbOfRepeats: 5,
        images: [],
      }

      const documentWithBlock = {
        title: 'Test',
        version: '1.0',
        blocks: [validBlock],
      }

      const result = documentSchema.safeParse(documentWithBlock)
      expect(result.success).toBe(true)
    })

    // Test block with default values
    it('applies default values for optional block fields', () => {
      const documentWithBlock = {
        title: 'Test',
        version: '1.0',
        blocks: [{ id: 1 }],
      }

      const result = documentSchema.safeParse(documentWithBlock)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.blocks?.[0].text).toBe('')
        expect(result.data.blocks?.[0].nbOfRepeats).toBe(1)
        expect(result.data.blocks?.[0].images).toEqual([])
      }
    })

    // NbOfRepeats has no lower bound in current schema; zero is accepted
    it('accepts block with nbOfRepeats equal to 0', () => {
      const documentWithZeroRepeats = {
        title: 'Test',
        version: '1.0',
        blocks: [{ id: 1, nbOfRepeats: 0 }],
      }

      const result = documentSchema.safeParse(documentWithZeroRepeats)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.blocks?.[0].nbOfRepeats).toBe(0)
      }
    })

    // Negative nbOfRepeats is currently accepted by schema
    it('accepts block with negative nbOfRepeats', () => {
      const documentWithNegative = {
        title: 'Test',
        version: '1.0',
        blocks: [{ id: 1, nbOfRepeats: -5 }],
      }

      const result = documentSchema.safeParse(documentWithNegative)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.blocks?.[0].nbOfRepeats).toBe(-5)
      }
    })

    // Test decimal nbOfRepeats (allowed)
    it('accepts block with decimal nbOfRepeats', () => {
      const documentWithDecimal = {
        title: 'Test',
        version: '1.0',
        blocks: [{ id: 1, nbOfRepeats: 2.5 }],
      }

      const result = documentSchema.safeParse(documentWithDecimal)
      expect(result.success).toBe(true)
    })
  })

  describe('imageSchema', () => {
    // Test valid image
    it('validates block with valid images', () => {
      const documentWithImages = {
        title: 'Test',
        version: '1.0',
        blocks: [
          {
            id: 1,
            images: [
              { imagePath: '/path/to/image1.jpg' },
              { imagePath: '/path/to/image2.png' },
            ],
          },
        ],
      }

      const result = documentSchema.safeParse(documentWithImages)
      expect(result.success).toBe(true)
    })

    // Test empty imagePath
    it('rejects image with empty imagePath', () => {
      const documentWithInvalidImage = {
        title: 'Test',
        version: '1.0',
        blocks: [
          {
            id: 1,
            images: [{ imagePath: '' }],
          },
        ],
      }

      const result = documentSchema.safeParse(documentWithInvalidImage)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Le chemin de l'image est obligatoire")
      }
    })

    // Test missing imagePath
    it('rejects image without imagePath', () => {
      const documentWithInvalidImage = {
        title: 'Test',
        version: '1.0',
        blocks: [
          {
            id: 1,
            images: [{}],
          },
        ],
      }

      const result = documentSchema.safeParse(documentWithInvalidImage)
      expect(result.success).toBe(false)
    })
  })

  describe('complex documents', () => {
    // Test document with multiple blocks and images
    it('validates complex document with multiple blocks and images', () => {
      const complexDocument = {
        id: 123,
        title: 'Complex Document',
        version: '2.5.1',
        blocks: [
          {
            id: 1,
            text: 'First block with images',
            step: 1,
            nbOfRepeats: 3,
            images: [
              { imagePath: '/images/img1.jpg' },
              { imagePath: '/images/img2.jpg' },
            ],
          },
          {
            id: 2,
            text: 'Second block',
            step: 2,
            nbOfRepeats: 1,
            images: [],
          },
          {
            id: 3,
            text: 'Third block',
            step: 3,
            nbOfRepeats: 10,
            images: [{ imagePath: '/images/img3.png' }],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      const result = documentSchema.safeParse(complexDocument)
      expect(result.success).toBe(true)
    })

    // Test document with special characters
    it('validates document with special characters in title', () => {
      const document = {
        title: 'Document #1: Spécial "Test" & More!',
        version: '1.0.0-beta',
      }

      const result = documentSchema.safeParse(document)
      expect(result.success).toBe(true)
    })
  })
})
