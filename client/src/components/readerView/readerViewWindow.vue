<template>
    <div v-if="popupStore.isReaderOpen" class="overlay" role="dialog" aria-modal="true" @click="closeReaderView">
        <div class="popup" @click.stop>
                <div class="readerApp">
                <div class="readerViewWindow">
                    <ReaderViewBar @save="emit('save')" />
                </div>

                <div class="readerWindowContent">
                    <div class="blockHeader">
                        <div class="headerNumber">N°</div>
                        <div class="headerDescription">Détail de l'opération</div>
                        <div class="headerRep">REP.</div>
                    </div>
                    <ReaderViewBlock
                        v-for="block in noEmptyBlocks"
                        :key="block.id"
                        :numero="block.step" 
                        :description="block.text"
                        :modelValue="block.nbOfRepeats"
                        :images="block.images"
                        :textZones="block.textZones"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePopupStore } from '../../stores/popupStore'
import { useBlocksStore } from '../../stores/blockStores'
import ReaderViewBar from './readerViewBar.vue'
import ReaderViewBlock from './readerViewBlock.vue'


const popupStore = usePopupStore()
const blocksStore = useBlocksStore()
const emit = defineEmits<{
    save: []
}>()

const closeReaderView = () => {
    popupStore.closeReader()
}

const noEmptyBlocks = computed(() => {
    return blocksStore.blocks.filter(block => {
        const hasText = block.text && block.text.trim() !== ''
        const hasImages = block.images && block.images.length > 0
        const hasTextZones = block.textZones && block.textZones.length > 0 && 
                            block.textZones.some(zone => zone.trim() !== '')
        
        return hasText || hasImages || hasTextZones
    })
})

</script>

<style scoped>
@import '../../assets/styles/readerShared.css';

.overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 3200;
}

.popup {
    width: 911px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
}


.readerApp {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 911px;
    height: 717px;
    background-color: #F3F4F6;
    border-radius: 8px;
}

.readerWindowContent {
    height: 663px;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}
</style>