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
    if (blocks.value.length === 0) return true // allow first block
    const last = blocks.value[blocks.value.length - 1]
    const hasText = last?.text ? !isContentEmpty(last.text) : false // true if non-empty text after stripping HTML
    const hasImages = (last?.images?.length ?? 0) > 0 // use 0 when images is undefined/null
    return hasText || hasImages // can add if last block has content
  })

  const currentDocument = ref<{
    id?: number;
    title: string;
    version: number;
    createdAt?: Date;
    updatedAt?: Date;
    state?: string;
  }>({
    title: 'Titre du document',
    version: 1,
    state: 'En édition'
  })

  const allDocuments = ref<Document[]>([])
  const loadingDocuments = ref(false)
  const documentsError = ref<string | null>(null)

  async function saveDocument(): Promise<'success' | 'rename' | void> {
    try {
      // Filter out empty blocks before saving
      const filteredBlocks = blocks.value.filter((b) => {
        const hasText = b.text && !isContentEmpty(b.text); // keep blocks with actual text
        const hasImages = b.images && b.images.length > 0; // keep blocks with at least one image
        const hasNonEmptyZone = b.textZones && b.textZones.some((z) => z && !isContentEmpty(z)); // any filled extra zone
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
        const userAction = await nameConflictPopup.show(currentDocument.value.title); // ask user to rename or cancel
        
        if (userAction === 'rename') {
          return 'rename';
        }
      }

      // Prepare document data to send
      const documentToSend: Document = {
        title: currentDocument.value.title,
        version: currentDocument.value.version,
        blocks: filteredBlocks.map((b) => {
          const { modified, ...blockData } = b; // omit UI-only flag from payload
          return blockData;
        })
      };
      // Validate document data
      const validation = documentSchema.safeParse(documentToSend); // zod schema validation

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        errorPopup.show(firstError?.message || "Données invalides");
        return;
      }

      // Create or update document based on presence of ID
      const hasId = typeof currentDocument.value.id === 'number'; // create vs update decision
      const savedDocument = hasId
        ? await documentService.update(currentDocument.value.id!, documentToSend) // update existing
        : await documentService.create(documentToSend); // create new

      currentDocument.value = {
        id: savedDocument.id,
        title: savedDocument.title,
        version: savedDocument.version + 1, // bump local version for next edit
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
        updatedAt: document.updatedAt,
        state: document.state ?? 'En édition'
      };

      documentTitle.value = document.title;

      blocks.value = document.blocks.map((block: any) => ({
        ...block,
        canvasData: block.canvasData ?? '',
        modified: true, // mark as cleanly loaded
        textZones: typeof block.textZones === 'string' 
          ? JSON.parse(block.textZones || '[]') // server may store as JSON string
          : (block.textZones || []) // normalize to array
      }));

      selectedIndex.value = null; // clear selection on load
      
      confirmSavePopup.show("Document chargé avec succès !", "Ouverture");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du chargement du document.";
      errorPopup.show(errorMessage);
    }
  }

  function createNewDocument() {
    currentDocument.value = {
      title: 'Titre du document',
      version: 1,
      state: 'En édition'
    }
    documentTitle.value = 'Titre du document'
    blocks.value = [
      {
        id: 1,
        text: '',
        step: 1,
        nbOfRepeats: 1,
        modified: false,
        images: [] as Image[],
        textZones: []
      }
    ]
    selectedIndex.value = null
    blockToDeleteIndex.value = null
  }

  // Load all documents
  async function loadAllDocuments() {
    try {
      loadingDocuments.value = true
      documentsError.value = null
      const documents = await documentService.getAll()
      allDocuments.value = documents // hydrate list state
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
    selectedIndex.value = i // simple selection toggle
  }

  // Mark a block as modified or not
  function setModified(i: number, value: boolean) {
    if (!blocks.value[i]) return
    blocks.value[i] = { ...blocks.value[i], modified: value } // replace to keep reactivity
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
      step: blocks.value.length + 1, // next sequential step
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
    
    const baseEmpty = isContentEmpty(block.text ?? '') // require base text first
    if (baseEmpty) {
      errorPopup.show('Remplir le texte de base avant d\'ajouter une zone.')
      return
    }
    
    const zones = block.textZones ?? []
    const lastZone = zones[zones.length - 1] // check last zone content if exists
    
    if (lastZone !== undefined && isContentEmpty(lastZone ?? '')) {
      errorPopup.show('Remplir la zone de texte précédente avant d\'en ajouter une nouvelle.')
      return
    }
    
    block.textZones ??= []
    block.textZones.push('') // append empty zone
  }

  // Renumber blocks after changes
  function renumberBlocks() {
    blocks.value.forEach((block, i) => {
      block.step = i + 1 // keep steps 1..N
    })
  }

  // Remove a block at index i
  function removeBlock(i: number) {
    if (i < 0 || i >= blocks.value.length) return
    
    if (i === 0 && blocks.value.length === 1) {
      errorPopup.show('Impossible de supprimer le premier bloc. Créez au moins un second bloc avant de supprimer le premier.') // protect against empty doc
      return
    }
    
    blockToDeleteIndex.value = i
    deletePopup.show('block', confirmDelete) // open confirmation modal
  }
  // Confirm deletion of a block
  function confirmDelete() {
    if (blockToDeleteIndex.value === null) return
    const i = blockToDeleteIndex.value
    blocks.value.splice(i, 1)
    renumberBlocks()
    if (selectedIndex.value !== null) {
      if (blocks.value.length === 0) selectedIndex.value = null // nothing left
      else if (selectedIndex.value > i) selectedIndex.value = (selectedIndex.value - 1) // shift selection back
      else if (selectedIndex.value >= blocks.value.length) selectedIndex.value = blocks.value.length - 1 // clamp to last
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
    const textContent = html.replace(/<[^>]*>/g, '').trim() // strip tags to evaluate emptiness
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
    
    block.textZones[zoneIndex] = html // replace zone content
  }

  /**
   * Update canvas data in a block
   * @param blockIndex - Index of the block
   * @param data - JSON string of canvas data
   */
  function updateBlockCanvas(blockIndex: number, data: string) {
    if (blockIndex < 0 || blockIndex >= blocks.value.length) return
    const block = blocks.value[blockIndex]
    if (!block) return
    
    block.canvasData = data
    block.modified = true
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
    
    block.textZones.splice(zoneIndex, 1) // remove zone at index
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
      step: idx + 1, // assign steps sequentially
      textZones: [], // initialize zones
      images: block.images ?? [], // normalize images to array
    }))

    if (parsed.length === 0) {
      errorPopup.show('Impossible de générer des blocs. Vérifiez que les colonnes Numéro, Libellé et Nombre sont présentes.')
      return
    }

    blocks.value = parsed // replace current blocks
    selectedIndex.value = null // clear selection
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
    createNewDocument,
    loadAllDocuments,
    setModified,
    addEmptyBlockIfAllowed,
    addTextZone,
    removeBlock,
    renumberBlocks,
    confirmDelete,
    updateBlockDescription,
    updateTextZone,
    updateBlockCanvas,
    removeTextZone,
    isContentEmpty,
    loadFromClipboard,
  }
})