<template>
    <div
        v-if="isOpen"
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-popup-title"
    >
        <div class="popUp">
            <div class="popUp-header">
                <div class="titleGroup">
                    <img :src="warningIcon" alt="Attention" class="titleIcon" />
                    <h1 id="conflict-popup-title" class="title">Conflit de nom</h1>
                </div>
                <button class="closeButton" type="button" @click="handleCancel" aria-label="Fermer">✕</button>
            </div>

            <div class="popUp-body">
                <p class="message">
                    Un document avec le nom "<strong>{{ documentName }}</strong>" existe déjà.
                </p>
                <p class="submessage">
                    Souhaitez-vous valider le nom du document existant ou changer le nom ?
                </p>
                
                <div class="separator" aria-hidden="true"></div>

                <div class="footer">
                    <button class="ghostButton" type="button" @click="handleCancel">Changer le nom</button>
                    <button class="primaryButton" type="button" @click="handleRename">Valider</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNameConflictPopupStore } from '../../stores/nameConflictPopupStore'
import warningIcon from '../../assets/savePopUp/floppy-disk.svg'

const nameConflictStore = useNameConflictPopupStore()
const { isOpen, documentName } = storeToRefs(nameConflictStore)

function handleRename() {
    nameConflictStore.handleValidate()
}

function handleCancel() {
    nameConflictStore.handleRename()
}
</script>

<style scoped>
.overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.55);
    z-index: 4000;
}

.popUp {
    width: 500px;
    min-height: 280px;
    background: #ffffff;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.popUp-header {
    height: 45px;
    background: #0b0b0b;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
}

.popUp-body {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 30px 20px;
}

.titleGroup {
    display: flex;
    align-items: center;
    gap: 15px;
}

.titleIcon {
    width: 22px;
    height: 22px;
}

.title {
    margin: 0;
    font-size: 18px;
    font-weight: 300;
}

.closeButton {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #ffffff;
    font-size: 18px;
    cursor: pointer;
}

.closeButton:hover {
    background: rgba(255, 255, 255, 0.1);
}

.message {
    font-size: 14px;
    color: #111827;
    text-align: center;
}

.submessage {
    font-size: 14px;
    color: #111827;
    text-align: center;
    opacity: 0.8;
    width : 430px;
}

strong {
    font-weight: 600;
    color: #dc2626;
}

.separator {
    height: 2px;
    background: #d1d5db;
    width: 430px;
    margin: 0 auto;
    margin-top : 20px;
}

.footer {
    width: 430px;
    display: flex;
    padding: 25px 0 0;
    justify-content: flex-end;
    gap: 12px;
}

.ghostButton {
    border: none;
    color: #6b6b6b;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    padding: 8px 10px;
}

.primaryButton {
    border: none;
    background: #dc2626;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    padding: 10px 18px;
    border-radius: 4px;
    cursor: pointer;
    text-transform: uppercase;
}

.primaryButton:hover {
    filter: brightness(0.95);
}

.primaryButton:active {
    filter: brightness(0.9);
}
</style>
