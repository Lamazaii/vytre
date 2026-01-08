<template>
    <div
        v-if="isOpen"
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-popup-title"
    >
        <div class="popUp">
            <header class="popUp-header">
                <div class="titleGroup">
                    <img :src="saveIcon" alt="Sauvegarder" class="titleIcon" />
                    <h1 id="save-popup-title" class="title">{{ resolvedTitle }}</h1>
                </div>
                <button class="closeButton" type="button" @click="handleCancel" aria-label="Fermer">✕</button>
            </header>

            <div class="popUp-body">
                <p class="message">{{ resolvedMessage }}</p>

                <div class="inputGroup">
                    <label class="label" for="save-popup-input">{{ resolvedLabel }}</label>
                    <div class="inputWrapper">
                        <input
                            id="save-popup-input"
                            v-model="localValue"
                            type="text"
                            :placeholder="resolvedPlaceholder"
                            class="textInput"
                        />
                        <img :src="editIcon" alt="Modifier" class="inputIcon" />
                    </div>
                </div>
                
                <div class="separator" aria-hidden="true"></div>

                <footer class="footer">
                    <button class="ghostButton" type="button" @click="handleCancel">{{ resolvedCancel }}</button>
                    <button class="primaryButton" type="button" @click="handleConfirm">{{ resolvedConfirm }}</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import saveIcon from '../../assets/savePopUp/floppy-disk.svg'
import editIcon from '../../assets/savePopUp/editTitle.svg'

const props = defineProps<{
    isOpen: boolean
    modelValue?: string
    title?: string
    label?: string
    message?: string
    placeholder?: string
    confirmText?: string
    cancelText?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'cancel'): void
    (e: 'confirm', value: string): void
}>()

const localValue = computed({
    get: () => props.modelValue ?? '',
    set: (value: string) => emit('update:modelValue', value),
})

const resolvedTitle = computed(() => props.title ?? 'Enregistrer')
const resolvedLabel = computed(() => props.label ?? 'Titre du document')
const resolvedMessage = computed(
    () =>
        props.message ??
        'Voulez-vous vraiment enregistrer les modifications apportées à ce mode opératoire ?'
)
const resolvedPlaceholder = computed(
    () => props.placeholder ?? 'Titre du document'
)
const resolvedConfirm = computed(() => props.confirmText ?? 'CONFIRMER')
const resolvedCancel = computed(() => props.cancelText ?? 'Annuler')

function handleCancel() {
    emit('cancel')
}

function handleConfirm() {
    emit('confirm', localValue.value.trim())
}
</script>

<style scoped>
.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.55);
    z-index: 4000;
}

.popUp {
    width: 500px;
    min-height: 320px;
    background: #f2f3f6;
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

.popUp-body{
    flex : 1;    
    display : flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
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
    height : 48px;
    max-width: 430px;
    margin: 0 auto;
    opacity: 0.6;
}

.inputGroup {
    display: flex;
    width : 430px;
    flex-direction: column;
    gap: 10px;
}

.label {
    font-size: 14px;
    color: #000000;
    text-transform: uppercase;
    text-align: left;
    opacity: 0.6;
}

.inputWrapper {
    position: relative;
    width: 100%;
    max-width: 430px;
}

.textInput {
    width: 100%;
    padding: 12px 42px 12px 12px;
    border : #d3d3d3 1px solid;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}

.textInput:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
}

.inputIcon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    pointer-events: none;
    opacity: 0.6;
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
    margin : 0 auto;
    padding : 30px 0;
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