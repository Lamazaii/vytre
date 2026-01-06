import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Block } from '../types/Blocks'
import { useErrorPopupStore } from './errorPopupStore'
import { useDeletePopupStore } from './deletePopupStore'
import type { Image } from '../types/Image'
import type { Document } from '../types/Document'


/**
 * Vérifie si un contenu HTML est vide (en ignorant les balises)
 * @param html - Contenu HTML à vérifier
 * @returns true si le contenu est vide, false sinon
 */
function isContentEmpty(html: string): boolean {
  const textContent = html.replace(/<[^>]*>/g, '').trim()
  return textContent.length === 0
}

export const useBlocksStore = defineStore('blocks', () => {
  const errorPopup = useErrorPopupStore()
  const deletePopup = useDeletePopupStore()
  const documentTitle = ref('Titre du document')
  const blocks = ref<Array<Block & { textZones?: string[] }>>([
    { id: 1, text: '', step: 1, nbOfRepeats: 1, modified: false, images: [] as Image[], textZones: [] }
  ])
  const selectedIndex = ref<number | null>(null)
  const blockToDeleteIndex = ref<number | null>(null)

  const canAdd = computed(() => {
    if (blocks.value.length === 0) return true
    const last = blocks.value[blocks.value.length - 1]
    const hasText = !!last?.modified
    const hasImages = (last?.images?.length ?? 0) > 0
    return hasText || hasImages
  })

  const currentDocument = ref<{
    id: string;
    title: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
  }>({
    id: crypto.randomUUID(), // Génère un ID unique proprement
    title: 'Titre du document',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  async function saveDocument() {
    try {
      // Préparation de l'objet Document final
      const documentToPost: Document = {
        id: currentDocument.value.id,
        title: currentDocument.value.title,
        version: currentDocument.value.version,
        createdAt: currentDocument.value.createdAt,
        updatedAt: new Date(), // On met à jour la date de modification
        // On nettoie les blocs pour qu'ils correspondent au type Block[] (sans 'modified')
        blocks: blocks.value.map((b, index) => {
          const { modified, ...blockData } = b;
          return {
            ...blockData,
            step: index + 1 // On s'assure que le step suit l'ordre du tableau
          };
        })
      };

      const response = await fetch('http://localhost:3000/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentToPost)
      });

      if (!response.ok) throw new Error('Erreur lors du POST');

      errorPopup.show("Document sauvegardé avec succès !");
    } catch (error) {
      console.error(error);
      errorPopup.show("Erreur lors de la sauvegarde du document.");
    }
  }

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
      id: Date.now(),
      text: '',
      step: blocks.value.length + 1,
      nbOfRepeats: 1,
      modified: false,
      images: [] as Image[],
      textZones: []
    })
  }

  function addTextZone() {
    if (selectedIndex.value === null) return
    const block = blocks.value[selectedIndex.value]
    if (!block) return
    
    // Utiliser isContentEmpty pour vérifier si la description de base est vide
    const baseEmpty = isContentEmpty(block.text ?? '')
    if (baseEmpty) {
      errorPopup.show('Remplir le texte de base avant d\'ajouter une zone.')
      return
    }
    
    const zones = block.textZones ?? []
    const lastZone = zones[zones.length - 1]
    
    // Vérifier si la dernière zone est vide en utilisant isContentEmpty
    if (lastZone !== undefined && isContentEmpty(lastZone ?? '')) {
      errorPopup.show('Remplir la zone de texte précédente avant d\'en ajouter une nouvelle.')
      return
    }
    
    block.textZones ??= []
    block.textZones.push('')
  }

  function renumberBlocks() {
    blocks.value.forEach((block, i) => {
      block.step = i + 1
    })
  }

  function removeBlock(i: number) {
    if (i === 0) {
      alert('Le bloc de base ne peut pas être supprimé.')
      return
    }
    if (i < 0 || i >= blocks.value.length) return
    // Ouvrir la popup de confirmation
    blockToDeleteIndex.value = i
    deletePopup.show('block', confirmDelete)
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
    blockToDeleteIndex.value = null
  }

  /**
   * Met à jour la description principale d'un bloc
   * @param index - Index du bloc à mettre à jour
   * @param html - Nouveau contenu HTML
   */
  function updateBlockDescription(index: number, html: string) {
    if (index < 0 || index >= blocks.value.length) return
    const block = blocks.value[index]
    if (!block) return
    
    block.text = html
    
    // Vérifier si le contenu est vide (après suppression des balises HTML)
    const textContent = html.replace(/<[^>]*>/g, '').trim()
    const isModified = textContent.length > 0
    
    block.modified = isModified
  }

  /**
   * Met à jour une zone de texte spécifique dans un bloc
   * @param blockIndex - Index du bloc
   * @param zoneIndex - Index de la zone de texte
   * @param html - Nouveau contenu HTML
   */
  function updateTextZone(blockIndex: number, zoneIndex: number, html: string) {
    if (blockIndex < 0 || blockIndex >= blocks.value.length) return
    const block = blocks.value[blockIndex]
    if (!block?.textZones) return
    if (zoneIndex < 0 || zoneIndex >= block.textZones.length) return
    
    block.textZones[zoneIndex] = html
  }

  /**
   * Supprime une zone de texte d'un bloc
   * @param blockIndex - Index du bloc
   * @param zoneIndex - Index de la zone de texte à supprimer
   */
  function removeTextZone(blockIndex: number, zoneIndex: number) {
    if (blockIndex < 0 || blockIndex >= blocks.value.length) return
    const block = blocks.value[blockIndex]
    if (!block?.textZones) return
    if (zoneIndex < 0 || zoneIndex >= block.textZones.length) return
    
    block.textZones.splice(zoneIndex, 1)
  }

  return {
    // state
    documentTitle,
    currentDocument,
    blocks,
    selectedIndex,
    blockToDeleteIndex,
    // getters
    canAdd,
    // actions
    toggleSelect,
    saveDocument,
    setModified,
    addEmptyBlockIfAllowed,
    addTextZone,
    removeBlock,
    renumberBlocks,
    confirmDelete,
    updateBlockDescription,
    updateTextZone,
    removeTextZone,
    isContentEmpty,
  }
})