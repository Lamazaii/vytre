import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBlocksStore } from '../../stores/blockStores'
import { useErrorPopupStore } from '../../stores/errorPopupStore'
import { useDeletePopupStore } from '../../stores/deletePopupStore'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

describe('blocksStore', () => {
  it('updates block description and modified flag', () => {
    const store = useBlocksStore()
    store.updateBlockDescription(0, '<p>Hello</p>')
    expect(store.blocks[0]!.text).toBe('<p>Hello</p>')
    expect(store.blocks[0]!.modified).toBe(true)

    store.updateBlockDescription(0, '<p><br></p>')
    expect(store.blocks[0]!.modified).toBe(false)
  })

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

    expect(store.blocks[0]!.textZones).toHaveLength(1)
  })

  it('blocks adding an empty block when the last is unmodified', () => {
    const store = useBlocksStore()
    const errorStore = useErrorPopupStore()
    const spy = vi.spyOn(errorStore, 'show')

    store.addEmptyBlockIfAllowed()

    expect(spy).toHaveBeenCalled()
    expect(store.blocks).toHaveLength(1)
  })

  it('removes a block through delete popup confirmation', () => {
    const store = useBlocksStore()
    const deleteStore = useDeletePopupStore()
    const spy = vi.spyOn(deleteStore, 'show')

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

    deleteStore.confirm()

    expect(store.blocks).toHaveLength(1)
    expect(store.blocks[0]!.step).toBe(1)
  })
})
