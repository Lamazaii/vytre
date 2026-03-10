<template>
	<div v-if="popupStore.isOpen" class="overlay" role="dialog" aria-modal="true" aria-labelledby="clipboard-title">
		<div class="popup">
			<div class="header-bar">
				<div class="headerContent">
				<div class="titleGroup">
					<img class="clipboardIcon" :src="clipboardIcon" alt="Presse-papier" />
					<h1 class="documentTitle">Presse-papier</h1>
				</div>
				<button class="closeButton" @click="handleCancel" aria-label="Fermer">
					<span class="closeX">✕</span>
				</button>
				</div>
			</div>

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
import clipboardIcon from "../../assets/optionBarImage/contentPasteRed.svg";

import { usePopupStore } from '../../stores/popupStore'

// Store controlling clipboard popup visibility.
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

// Two-way local model proxy for textarea content.
const localValue = computed({
	get: () => props.modelValue ?? "",
	set: (value: string) => emit("update:modelValue", value),
});

// Cancel closes popup and notifies parent.
function handleCancel() {
	popupStore.closePopup();
	emit("cancel");
}

// Submit closes popup and returns trimmed content.
function handleSubmit() {
	popupStore.closePopup();
	emit("submit", localValue.value.trim());
}

// Default placeholder when parent does not provide one.
const placeholder = computed(
	() => props.placeholder ?? "Insérer votre texte:"
);
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background: rgba(0, 0, 0, 0.55);
	backdrop-filter: blur(2px);
	z-index: 4000;
}

.popup {
	width: 500px;
	height: 400px;
	display: flex;
	flex-direction: column;
	background: #f2f3f6;
	overflow: hidden;
	border-radius: 5px;
}

.content {
	padding: 18px 20px 10px;
}

.label {
	font-size: 14px;
	color: #5b5b5b;
	font-weight: 600;
}

.textarea {
	width: 100%;
	min-height: 240px;
	border: 1px solid #bdbdbd;
	border-radius: 10px;
	padding: 10px 12px;
	font-size: 14px;
	resize: none;
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

.header-bar {
  background-color: #000000;
  color: rgb(255, 255, 255);
  height: 45px;
  display: flex;
  justify-content: center;
}

.headerContent {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
}

.titleGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}

.closeButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  border: none;
  color: #ffffff;
  background: transparent;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
  transition: filter 0.15s ease;
}

.closeButton:hover {
  background: rgba(217, 217, 217, 0.30);
  color: #dc2626;
}

.closeButton:active {
  background: rgba(217, 217, 217, 0.20);
  color: #dc2626;
}

.documentTitle {
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
}

.titleBar {
  margin: 0 0 4px;
  font-size: 1.2em;
  font-weight: 900;
  color: #E30613;
}

</style>