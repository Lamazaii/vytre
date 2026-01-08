import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Block } from '../types/Blocks'
import { useErrorPopupStore } from './errorPopupStore'
import { useDeletePopupStore } from './deletePopupStore'
import type { Image } from '../types/Image'
import type { Document } from '../types/Document'
import { generateBlocksFromClipboardTable } from '../types/generateBlocks'
import { documentService } from '../services/documentService'
import { documentSchema } from '../validators/documentValidator'


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
    id?: number;
    title: string;
    version: string;
    createdAt?: Date;
    updatedAt?: Date;
  }>({
    title: 'Titre du document',
    version: '1.0.0'
  })

  async function saveDocument() {
    try {
      const documentToPost: Document = {
        title: currentDocument.value.title,
        version: currentDocument.value.version,
        blocks: blocks.value.map((b) => {
          const { modified, textZones, ...blockData } = b;
          return blockData;
        })
      };

      const validation = documentSchema.safeParse(documentToPost);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        errorPopup.show(firstError?.message || "Données invalides");
        return;
      }

      const savedDocument = await documentService.create(documentToPost);

      currentDocument.value = {
        id: savedDocument.id,
        title: savedDocument.title,
        version: savedDocument.version,
        createdAt: savedDocument.createdAt,
        updatedAt: savedDocument.updatedAt
      };

      errorPopup.show("Document sauvegardé avec succès !");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la sauvegarde du document.";
      errorPopup.show(errorMessage);
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
    
    const baseEmpty = isContentEmpty(block.text ?? '')
    if (baseEmpty) {
      errorPopup.show('Remplir le texte de base avant d\'ajouter une zone.')
      return
    }
    
    const zones = block.textZones ?? []
    const lastZone = zones[zones.length - 1]
    
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
    if (i < 0 || i >= blocks.value.length) return
    
    if (i === 0 && blocks.value.length === 1) {
      errorPopup.show('Impossible de supprimer le premier bloc. Créez au moins un second bloc avant de supprimer le premier.')
      return
    }
    
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

  function loadFromClipboard(rawText: string) {
    const trimmed = rawText.trim()
    if (!trimmed) {
      errorPopup.show('Aucun contenu détecté dans le presse-papiers.')
      return
    }

    const parsed = generateBlocksFromClipboardTable(trimmed).map((block, idx) => ({
      ...block,
      step: idx + 1,
      textZones: [],
      images: block.images ?? [],
    }))

    if (parsed.length === 0) {
      errorPopup.show('Impossible de générer des blocs. Vérifiez que les colonnes Numéro, Libellé et Nombre sont présentes.')
      return
    }

    blocks.value = parsed
    selectedIndex.value = null
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
    loadFromClipboard,
  }
})