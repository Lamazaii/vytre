import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Blocks } from '../types/Blocks'
import { useErrorPopupStore } from './errorPopupStore'

export const useBlocksStore = defineStore('blocks', () => {
  const errorPopup = useErrorPopupStore()
  const blocks = ref<Array<Blocks & { modified?: boolean; imageStrings?: string[]; textZones?: string[] }>>([
    { numero: 1, description: '', repetitionCount: 1, modified: false, imageStrings: [], textZones: [] }
  ])
  const selectedIndex = ref<number | null>(null)
  const deletePopupVisible = ref(false)
  const blockToDeleteIndex = ref<number | null>(null)

  const canAdd = computed(() => {
    if (blocks.value.length === 0) return true
    const last = blocks.value[blocks.value.length - 1]
    return !!last?.modified
  })

  function toggleSelect(i: number) {
    selectedIndex.value = i
  }

  function setModified(i: number, value: boolean) {
    if (!blocks.value[i]) return
    blocks.value[i] = { ...blocks.value[i], modified: value }
  }

  function addEmptyBlockIfAllowed() {
    if (!canAdd.value) {
      errorPopup.show("Modifier un bloc avant d'en ajouter un nouveau.")
      return
    }
    blocks.value.push({
      numero: blocks.value.length + 1,
      description: '',
      repetitionCount: 1,
      modified: false,
      imageStrings: [],
      textZones: []
    })
  }

  function addTextZone() {
    if (selectedIndex.value === null) return
    const block = blocks.value[selectedIndex.value]
    if (!block) return
    const baseEmpty = (block.description ?? '').trim().length === 0
    if (baseEmpty) {
      errorPopup.show('Remplir le texte de base avant d\'ajouter une zone.')
      return
    }
    const zones = block.textZones ?? []
    const lastZone = zones[zones.length - 1]
    if (lastZone !== undefined && (lastZone ?? '').trim().length === 0) {
      errorPopup.show('Remplir la zone de texte précédente avant d\'en ajouter une nouvelle.')
      return
    }
    block.textZones ??= []
    block.textZones.push('')
  }

  function renumberBlocks() {
    blocks.value = blocks.value.map((block, i) => ({ ...block, numero: i + 1 }))
  }

  function removeBlock(i: number) {
    if (i === 0) {
      alert('Le bloc de base ne peut pas être supprimé.')
      return
    }
    if (i < 0 || i >= blocks.value.length) return
    // Ouvrir la popup de confirmation
    blockToDeleteIndex.value = i
    deletePopupVisible.value = true
  }

  function confirmDelete() {
    if (blockToDeleteIndex.value === null) return
    const i = blockToDeleteIndex.value
    blocks.value.splice(i, 1)
    renumberBlocks()
    if (selectedIndex.value !== null) {
      if (blocks.value.length === 0) selectedIndex.value = null
      else if (selectedIndex.value > i) selectedIndex.value = (selectedIndex.value - 1)
      else if (selectedIndex.value >= blocks.value.length) selectedIndex.value = blocks.value.length - 1
    }
    cancelDelete()
  }

  function cancelDelete() {
    deletePopupVisible.value = false
    blockToDeleteIndex.value = null
  }

  return {
    // state
    blocks,
    selectedIndex,
    deletePopupVisible,
    blockToDeleteIndex,
    // getters
    canAdd,
    // actions
    toggleSelect,
    setModified,
    addEmptyBlockIfAllowed,
    addTextZone,
    removeBlock,
    renumberBlocks,
    confirmDelete,
    cancelDelete,
  }
})