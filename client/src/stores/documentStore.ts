import {defineStore } from 'pinia';
import type { Document } from '../types/Document';
import type { Block } from '../types/Block';
export const useDocumentStore = defineStore('document', {
    state: () => ({
        currentDocument: null as Document | null,
        activeBlockId: null as number | null,
        lastUsedBlockId: 0,
    }),

    getters: {
        canAdd:(state) => {
            if(!state.currentDocument|| state.currentDocument.blocks.length === 0) return true;
            const blocks = state.currentDocument.blocks;
            const lastBlock = blocks[blocks.length -1];
            return !!lastBlock?.modified;
        },
    },
    actions: {
        initNewDocument() {
            this.lastUsedBlockId++
            const FirstBlock: Block = {
                id: this.lastUsedBlockId,
                text: 'Bienvenue. Sélectionnez ce bloc pour l\'éditer',
                step: 1,
                nbOfRepeats: 1,
                images: [],
                modified: false,
            };
            const newDocument: Document = {
                id: 'temp-doc-'+Date.now(),
                title: 'titre du Document',
                version: '1.0',
                blocks: [FirstBlock],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.currentDocument = newDocument;
            this.activeBlockId = FirstBlock.id;
        },

        addNewBlock() {
            if (!this.currentDocument) {
                this.initNewDocument();
                return;
            }

            if (!this.canAdd) {
                alert("Modifier un bloc avant d'en ajouter un nouveau.");
                return;
            }

            this.lastUsedBlockId++

            const NextStepNumber = this.currentDocument.blocks.length + 1;

            const newBlock: Block = {
                id: this.lastUsedBlockId,
                text: 'Nouveau bloc. Sélectionnez ce bloc pour l\'éditer',
                step: NextStepNumber,
                nbOfRepeats: 1,
                images: [],
                modified: false,
            };

            this.currentDocument.blocks.push(newBlock);
            this.activeBlockId = newBlock.id;
        },

        recalculateSteps() {
            if (!this.currentDocument) return;
            this.currentDocument.blocks.forEach((block, index) => {
                block.step = index + 1;
            });
        },

        deleteBlock(blockId: number) {
            if (!this.currentDocument) return;
            this.currentDocument.blocks = this.currentDocument.blocks.filter(block => block.id !== blockId);
            
            this.recalculateSteps();

            if (this.activeBlockId === blockId) {
                this.activeBlockId = null;
            }
        },

        updateActiveBlockText(newText: string) {
            if (!this.currentDocument || this.activeBlockId === null) return;
            const block = this.currentDocument.blocks.find(b => b.id === this.activeBlockId);
            if (block) {
                block.text = newText;
                block.modified = true;
            }
        },

        updateActiveBlockNbOfRepeats(newNbOfRepeats: number) {
            if (!this.currentDocument || this.activeBlockId === null) return;
            const block = this.currentDocument.blocks.find(b => b.id === this.activeBlockId);
            if (block) {
                block.nbOfRepeats = newNbOfRepeats;
            }
        },

        setActiveBlock(blockId: number) {
            this.activeBlockId = blockId;
        },
    },
});
