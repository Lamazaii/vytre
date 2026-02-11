import { describe, it, expect } from 'vitest'
import { generateBlocksFromClipboardTable, generateBlocksFromText } from '../../types/generateBlocks'

describe('generateBlocksFromText', () => {
  // Test empty input
  it('returns empty array for empty string', () => {
    const result = generateBlocksFromText('')
    expect(result).toEqual([])
  })

  // Test single paragraph
  it('generates block from single paragraph', () => {
    const input = 'This is a simple paragraph'
    const result = generateBlocksFromText(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('This is a simple paragraph')
    expect(result[0].step).toBe(1)
  })

  // Test multiple paragraphs separated by double newlines
  it('splits text into blocks by double newlines', () => {
    const input = 'First paragraph\n\nSecond paragraph\n\nThird paragraph'
    const result = generateBlocksFromText(input)
    
    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('First paragraph')
    expect(result[1].text).toBe('Second paragraph')
    expect(result[2].text).toBe('Third paragraph')
  })

  // Test text with colon format (label: content)
  it('extracts content after colon', () => {
    const input = 'Step 1: Perform this action'
    const result = generateBlocksFromText(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Perform this action')
  })

  // Test text with markdown header
  it('removes markdown header from first line', () => {
    const input = '# Header\nContent below header'
    const result = generateBlocksFromText(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Content below header')
  })

  // Test multi-line paragraph with colon
  it('handles multi-line content with colon format', () => {
    const input = 'Label: First line\nSecond line\nThird line'
    const result = generateBlocksFromText(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].text).toContain('First line')
    expect(result[0].text).toContain('Second line')
  })

  // Test with custom startIndex
  it('uses custom startIndex for step numbering', () => {
    const input = 'First\n\nSecond\n\nThird'
    const result = generateBlocksFromText(input, 5)
    
    expect(result[0].step).toBe(6)
    expect(result[1].step).toBe(7)
    expect(result[2].step).toBe(8)
  })

  // Test default properties
  it('sets default properties correctly', () => {
    const input = 'Test block'
    const result = generateBlocksFromText(input)
    
    expect(result[0].nbOfRepeats).toBe(1)
    expect(result[0].images).toEqual([])
    expect(result[0].modified).toBe(true)
  })
})

describe('generateBlocksFromClipboardTable', () => {
  // Test empty input
  it('returns empty array for empty string', () => {
    const result = generateBlocksFromClipboardTable('')
    expect(result).toEqual([])
  })

  // Test single row with step and description
  it('parses single row with step and description', () => {
    const input = '1\tStep description'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].step).toBe(1)
    expect(result[0].text).toBe('Step description')
    expect(result[0].nbOfRepeats).toBe(1)
  })

  // Test multiple rows
  it('parses multiple rows correctly', () => {
    const input = '1\tFirst step\n2\tSecond step\n3\tThird step'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(3)
    expect(result[0].step).toBe(1)
    expect(result[1].step).toBe(2)
    expect(result[2].step).toBe(3)
  })

  // Test with repeat count
  it('parses repeat count when provided', () => {
    const input = '1\tRepeat this\t5'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].nbOfRepeats).toBe(5)
  })

  // Test with invalid step number
  it('handles invalid step numbers', () => {
    const input = 'abc\tInvalid step'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].step).toBe(1)
  })

  // Test with whitespace
  it('trims whitespace from descriptions', () => {
    const input = '1\t  Trimmed description  '
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result[0].text).toBe('Trimmed description')
  })

  // Test mixed valid and invalid rows
  it('filters out invalid rows', () => {
    const input = '1\tValid\n\t\n2\tAlso valid'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(2)
  })

  // Test with carriage return line endings
  it('handles different line endings', () => {
    const input = '1\tFirst\r\n2\tSecond'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(2)
  })

  // Test generates unique IDs
  it('generates unique IDs for each block', () => {
    const input = '1\tFirst\n2\tSecond'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result[0].id).toBeDefined()
    expect(result[1].id).toBeDefined()
    expect(result[0].id).not.toBe(result[1].id)
  })

  // Test default values
  it('sets default values for images and modified', () => {
    const input = '1\tTest'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result[0].images).toEqual([])
    expect(result[0].modified).toBe(true)
  })

  // Test with header row (numéro, libellé)
  it('skips header row with "numero" and "libell"', () => {
    const input = 'Numéro\tLibellé\tRépétitions\n1\tFirst step\t2'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('First step')
  })

  // Test with fraction repeats
  it('parses fraction repeats correctly', () => {
    const input = '1\tHalf repeat\t1/2'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].nbOfRepeats).toBe(0.5)
  })

  // Test with comma decimal repeats
  it('handles comma decimal separator', () => {
    const input = '1\tDecimal repeat\t2,5'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].nbOfRepeats).toBe(2.5)
  })

  // Test single row with multiple blocks (horizontal format)
  it('parses horizontal single-row format with multiple blocks', () => {
    const input = '1\tFirst\t2\t2\tSecond\t3\t3\tThird\t1'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('First')
    expect(result[0].nbOfRepeats).toBe(2)
    expect(result[1].text).toBe('Second')
    expect(result[1].nbOfRepeats).toBe(3)
  })

  // Test empty cells in row
  it('filters out blocks with empty labels', () => {
    const input = '1\t\t2\n2\tValid\t1'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Valid')
  })

  // Test invalid fraction (division by zero keeps numerator due to parseFloat fallback)
  it('returns numerator when denominator is zero', () => {
    const input = '1\tTest\t5/0'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    if (result.length > 0) {
      expect(result[0].nbOfRepeats).toBe(5)
    }
  })

  // Test non-numeric repeats
  it('defaults to 1 for non-numeric repeats', () => {
    const input = '1\tTest\tabc'
    const result = generateBlocksFromClipboardTable(input)
    
    expect(result).toHaveLength(1)
    if (result.length > 0) {
      expect(result[0].nbOfRepeats).toBe(1)
    }
    
    expect(result[0].nbOfRepeats).toBe(1)
  })
})
