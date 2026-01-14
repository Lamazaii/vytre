import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Block } from '../types/Blocks'
import { useErrorPopupStore } from './errorPopupStore'
import { useDeletePopupStore } from './deletePopupStore'
import { useConfirmSavePopupStore } from './confirmSavePopupStore'
import { useNameConflictPopupStore } from './nameConflictPopupStore'

import type { Image } from '../types/Image'
import type { Document } from '../types/Document'
import { generateBlocksFromClipboardTable } from '../types/generateBlocks'
import { documentService } from '../services/documentService'
import { documentSchema } from '../validators/documentValidator'


/**
 * Verify if the given HTML content is empty (no text)
 * @param html - HTML content to verify
 * @returns true if the content is empty, false otherwise
 */
function isContentEmpty(html: string): boolean {
  const textContent = html.replace(/<[^>]*>/g, '').trim()
  return textContent.length === 0
}

export const useBlocksStore = defineStore('blocks', () => {
  const errorPopup = useErrorPopupStore()
  const deletePopup = useDeletePopupStore()
  const confirmSavePopup = useConfirmSavePopupStore()
  const nameConflictPopup = useNameConflictPopupStore()
  const documentTitle = ref('Titre du document')
  const blocks = ref<Array<Block & { textZones?: string[] }>>([
    { id: 1, text: '', step: 1, nbOfRepeats: 1, modified: false, images: [] as Image[], textZones: [] }
  ])
  const selectedIndex = ref<number | null>(null)
  const blockToDeleteIndex = ref<number | null>(null)

  const canAdd = computed(() => {
    if (blocks.value.length === 0) return true
    const last = blocks.value[blocks.value.length - 1]
    const hasText = last?.text ? !isContentEmpty(last.text) : false
    const hasImages = (last?.images?.length ?? 0) > 0
    return hasText || hasImages
  })

  const currentDocument = ref<{
    id?: number;
    title: string;
    version: number;
    createdAt?: Date;
    updatedAt?: Date;
  }>({
    title: 'Titre du document',
    version: 1
  })

  const allDocuments = ref<Document[]>([])
  const loadingDocuments = ref(false)
  const documentsError = ref<string | null>(null)

  async function saveDocument(): Promise<'success' | 'rename' | void> {
    try {
      // Filter out empty blocks before saving
      const filteredBlocks = blocks.value.filter((b) => {
        const hasText = b.text && !isContentEmpty(b.text);
        const hasImages = b.images && b.images.length > 0;
        const hasNonEmptyZone = b.textZones && b.textZones.some((z) => z && !isContentEmpty(z));
        return hasText || hasImages || hasNonEmptyZone;
      });

      // Block save if document is empty
      if (filteredBlocks.length === 0) {
        errorPopup.show('Impossible de sauvegarder un document vide.');
        return;
      }

      const nameExists = await documentService.checkNameExists(
        currentDocument.value.title,
        currentDocument.value.id
      );

      if (nameExists) {
        const userAction = await nameConflictPopup.show(currentDocument.value.title);
        
        if (userAction === 'rename') {
          return 'rename';
        }
      }

      // Prepare document data to send
      const documentToSend: Document = {
        title: currentDocument.value.title,
        version: currentDocument.value.version,
        blocks: filteredBlocks.map((b) => {
          const { modified, ...blockData } = b;
          return blockData;
        })
      };
      // Validate document data
      const validation = documentSchema.safeParse(documentToSend);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        errorPopup.show(firstError?.message || "Données invalides");
        return;
      }

      // Create or update document based on presence of ID
      const hasId = typeof currentDocument.value.id === 'number';
      const savedDocument = hasId
        ? await documentService.update(currentDocument.value.id!, documentToSend)
        : await documentService.create(documentToSend);

      currentDocument.value = {
        id: savedDocument.id,
        title: savedDocument.title,
        version: savedDocument.version + 1,
        createdAt: savedDocument.createdAt,
        updatedAt: savedDocument.updatedAt
      };

      confirmSavePopup.show("Document sauvegardé avec succès !", "Enregistrement");
      return 'success';
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la sauvegarde du document.";
      errorPopup.show(errorMessage);
    }
  }
  // Load a document by ID
  async function loadDocument(id: number) {
    try {
      const document = await documentService.getById(id);
      
      currentDocument.value = {
        id: document.id,
        title: document.title,
        version: document.version,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      };

      documentTitle.value = document.title;

      blocks.value = document.blocks.map((block: any) => ({
        ...block,
        modified: true,
        textZones: typeof block.textZones === 'string' 
          ? JSON.parse(block.textZones || '[]')
          : (block.textZones || [])
      }));

      selectedIndex.value = null;
      
      confirmSavePopup.show("Document chargé avec succès !", "Ouverture");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement du document.";
      errorPopup.show(errorMessage);
    }
  }

  // Load all documents
  async function loadAllDocuments() {
    try {
      loadingDocuments.value = true
      documentsError.value = null
      const documents = await documentService.getAll()
      allDocuments.value = documents
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement des documents.";
      documentsError.value = errorMessage
    } finally {
      loadingDocuments.value = false
    }
  }

  // Toggle selection of a block
  function toggleSelect(i: number) {
    selectedIndex.value = i
  }

  // Mark a block as modified or not
  function setModified(i: number, value: boolean) {
    if (!blocks.value[i]) return
    blocks.value[i] = { ...blocks.value[i], modified: value }
  }

  // Add an empty block if allowed (if last block is not empty)
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

  // Add a new text zone to the selected block
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

  // Renumber blocks after changes
  function renumberBlocks() {
    blocks.value.forEach((block, i) => {
      block.step = i + 1
    })
  }

  // Remove a block at index i
  function removeBlock(i: number) {
    if (i < 0 || i >= blocks.value.length) return
    
    if (i === 0 && blocks.value.length === 1) {
      errorPopup.show('Impossible de supprimer le premier bloc. Créez au moins un second bloc avant de supprimer le premier.')
      return
    }
    
    blockToDeleteIndex.value = i
    deletePopup.show('block', confirmDelete)
  }
  // Confirm deletion of a block
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
   * Update the main description of a block
   * @param index - Index of the block to update
   * @param html - New HTML content
   */
  function updateBlockDescription(index: number, html: string) {
    if (index < 0 || index >= blocks.value.length) return
    const block = blocks.value[index]
    if (!block) return
    
    block.text = html
    const textContent = html.replace(/<[^>]*>/g, '').trim()
    const isModified = textContent.length > 0
    
    block.modified = isModified
  }

  /**
   * Update a specific text zone in a block
   * @param blockIndex - Index of the block
   * @param zoneIndex - Index of the text zone
   * @param html - New HTML content
   */
  function updateTextZone(blockIndex: number, zoneIndex: number, html: string) {
    if (blockIndex < 0 || blockIndex >= blocks.value.length) return
    const block = blocks.value[blockIndex]
    if (!block?.textZones) return
    if (zoneIndex < 0 || zoneIndex >= block.textZones.length) return
    
    block.textZones[zoneIndex] = html
  }

  /**
   * Delete a specific text zone from a block
   * @param blockIndex - Index of the block
   * @param zoneIndex - Index of the text zone to delete
   */
  function removeTextZone(blockIndex: number, zoneIndex: number) {
    if (blockIndex < 0 || blockIndex >= blocks.value.length) return
    const block = blocks.value[blockIndex]
    if (!block?.textZones) return
    if (zoneIndex < 0 || zoneIndex >= block.textZones.length) return
    
    block.textZones.splice(zoneIndex, 1)
  }

  // Load blocks from clipboard text
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
    allDocuments,
    loadingDocuments,
    documentsError,
    // getters
    canAdd,
    // actions
    toggleSelect,
    saveDocument,
    loadDocument,
    loadAllDocuments,
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