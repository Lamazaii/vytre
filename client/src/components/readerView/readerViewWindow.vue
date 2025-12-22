<template>
    <div v-if="popupStore.isReaderOpen" class="overlay" role="dialog" aria-modal="true">
        <div class="popup">
                <div class="readerApp">
                <div class="readerViewWindow">
                    <ReaderViewBar />
                </div>

                <div class="readerWindowContent">
                    <div class="blockHeader">
                        <div class="headerNumber">N°</div>
                        <div class="headerDescription">Détail de l'opération</div>
                        <div class="headerRep">REP.</div>
                    </div>
                    <ReaderViewBlock
                        v-for="block in popupStore.blocks"
                        :key="block.numero"
                        :numero="block.numero"
                        :description="block.description"
                        :modelValue="block.repetitionCount"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { usePopupStore } from '../../stores/popupStore'
import ReaderViewBar from './readerViewBar.vue'
import ReaderViewBlock from './readerViewBlock.vue'

const popupStore = usePopupStore()

function closeReader() {
    popupStore.closeReader()
}
</script>

<style scoped>
.overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 1200;
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
.blockHeader {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 14px;
    color: #545454;
    height: 54px;
}

.headerNumber {
    margin-left: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.headerDescription {
    margin-right: auto;
    padding-left: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.headerRep {
    margin-right: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>