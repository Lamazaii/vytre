<template>
	<div v-if="popupStore.isOpen" class="overlay" role="dialog" aria-modal="true" aria-labelledby="clipboard-title">
		<div class="popup">
			<BarPopUp @close="handleCancel" />

			<div class="content">
				<textarea id="clipboard-textarea" v-model="localValue" class="textarea" rows="9" :placeholder="placeholder"></textarea>
			</div>

			<div class="actions">
				<button type="button" class="ghostButton" @click="handleCancel">Annuler</button>
				<button type="button" class="primaryButton" @click="handleSubmit">Générer les blocs</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BarPopUp from "./BarPopUp.vue";

import { usePopupStore } from '../../stores/popupStore'

const popupStore = usePopupStore()


const props = defineProps<{
	modelValue?: string;
	placeholder?: string;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
	(e: "cancel"): void;
	(e: "submit", value: string): void;
}>();

const localValue = computed({
	get: () => props.modelValue ?? "",
	set: (value: string) => emit("update:modelValue", value),
});

function handleCancel() {
	popupStore.closePopup();
	emit("cancel");
}

function handleSubmit() {
	popupStore.closePopup();
	emit("submit", localValue.value.trim());
}

const placeholder = computed(
	() => props.placeholder ?? "Insérer votre texte:"
);
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding: 158px 24px 24px;
	background: rgba(0, 0, 0, 0.55);
	backdrop-filter: blur(2px);
	z-index: 1200;
}

.popup {
	width: 500px;
	height: 400px;
	display: flex;
	flex-direction: column;
	background: #f2f3f6;
	border-radius: 8px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	overflow: hidden;
	border: 1px solid #d6d6d6;
}

.content {
	padding: 18px 20px 10px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
}

.label {
	font-size: 14px;
	color: #5b5b5b;
	font-weight: 600;
}

.textarea {
	width: 100%;
	min-height: 240px;
	height: 100%;
	border: 1px solid #bdbdbd;
	border-radius: 10px;
	padding: 10px 12px;
	font-size: 14px;
	resize: vertical;
	background: #ffffff;
	box-sizing: border-box;
}

.textarea:focus {
	outline: 2px solid #dc2626;
	border-color: #dc2626;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: 22px;
	padding: 16px 20px 20px;
	align-items: center;
}

.ghostButton {
	border: none;
	background: transparent;
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
	font-weight: 700;
	font-size: 14px;
	padding: 10px 16px;
	border-radius: 4px;
	cursor: pointer;
	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
	transition: filter 0.15s ease;
}

.primaryButton:hover {
	filter: brightness(0.95);
}

.primaryButton:active {
	filter: brightness(0.9);
}
</style>
