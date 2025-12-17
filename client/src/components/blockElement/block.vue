<template>
  <div class="editableBlock">

    <p
      class="welcomeText"
      contenteditable="true"
      aria-label="Texte de bienvenue"
      dir="ltr"
      ref="welcomeEl"
      @input="onWelcomeInput"
      @keydown.enter.prevent
      data-placeholder="Sélectionnez ce bloc pour l'éditer."
    ></p>

    <div class="trashIcon" :class="{ hovering: isTrashHover, active: isTrashActive }" @mouseenter="isTrashHover = true" @mouseleave="isTrashHover = false" @click="isTrashActive = !isTrashActive">
      <img :src="(isTrashHover || isTrashActive) ? trashRed : trash" alt="Supprimer" />
    </div>

    <div class="dottedSeparator"></div>

    <div class="imagesContainer" v-if="images.length > 0">
      <div class="imageItem" v-for="(image, index) in images" :key="index">
        <img :src="image" alt="Image ajoutée" class="blockImage" />
        <div class="removeImageIcon" @click="removeImage(index)">
          <img :src="trashRed" alt="Supprimer" />
        </div>
      </div>
    </div>
 
    <AddImage class="addImage" @imageSelected="handleImageSelected"/>

  </div>
</template>


<script setup lang="ts">

import AddImage from './addImage.vue';
import { ref, onMounted } from 'vue'
import trash from '../../assets/blockImage/trash.svg'
import trashRed from '../../assets/blockImage/trashRed.svg'

interface Props {
  titre?: string;
  description?: string;
  active? : boolean;
}

const emit = defineEmits<{
  (e: 'modified', value: boolean): void;
  (e: 'select'): void;
}>();

const props = defineProps<Props>();
const isTrashHover = ref(false)
const isTrashActive = ref(false)
const images = ref<string[]>([])

const welcomeText = ref(props.description || '')
const onWelcomeInput = (e: Event) => {
  const el = e.target as HTMLElement
  welcomeText.value = (el.textContent || '').trim()

  const isModified = welcomeText.value.length > 0
  emit('modified', isModified)
}

const welcomeEl = ref<HTMLElement | null>(null)
onMounted(() => {
  if (welcomeEl.value && props.description) {
    welcomeEl.value.textContent = props.description
  }
})

const handleImageSelected = (imageData: string) => {
  images.value.push(imageData)
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

</script>


<style scoped>
.editableBlock {
  position: relative;
  width: 1000px;
  min-height: 160px;
  border: 3px solid #DC2626;
  border-radius: 5px;
  padding: 15px;
  background-color: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.welcomeText {
  position: absolute;
  left: 50px;
  bottom: calc(15px + 68px + 10px + 2px + 22px);
  font-size: 14px;
  color: #000000;
  margin: 0;
  outline: none;
  white-space: pre-wrap;
}

.welcomeText[contenteditable="true"]:empty::before {
  content: attr(data-placeholder);
  color: #9e9e9e;
  opacity: 0.8;
  pointer-events: none;
}

.trashIcon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  z-index: 3;
}

.trashIcon img {
  width: 20px;
  height: 20px;
}

.editableBlock:hover .trashIcon {
  opacity: 0.5;
}

.trashIcon:hover {
  opacity: 1;
  background: #E0E0E0;
  border-radius: 4px;
}

.trashIcon:hover img { filter: none }

.trashIcon.hovering {
  opacity: 1 !important;
}

.trashIcon.active {
  background: rgba(220, 38, 38, 0.15);
  border-radius: 4px;
}

.dottedSeparator {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(15px + 68px + 10px);
  width: 900px;
  height: 2px;
  opacity: 0.3;
  z-index: 1;
  border: none;
  background-image: radial-gradient(circle, #000000 3px, transparent 1px);
  background-size: 8px 8px;
  background-repeat: repeat-x;
  background-position: 0 50%;
}

.addImage {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 15px;
  width: 900;
  height: 68px;
  z-index: 1;
}

.addImage:hover {
  background-color: #fef2f2;
  border-color: #DC2626;
}

.addImage:hover ::v-deep .addImageText {
  color: #DC2626;
  opacity: 1;
}

.addImage:hover ::v-deep .addImageLogo img {
  opacity: 1;
  filter: invert(21%) sepia(90%) saturate(6689%) hue-rotate(354deg) brightness(91%) contrast(124%);
}

.imagesContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.imageItem {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
}

.blockImage {
  max-width: 150px;
  max-height: 120px;
  object-fit: contain;
}

.removeImageIcon {
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  z-index: 2;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.removeImageIcon img {
  width: 16px;
  height: 16px;
}

.imageItem:hover .removeImageIcon {
  opacity: 0.5;
}

.removeImageIcon:hover {
  opacity: 1 !important;
  background: #E0E0E0;
}
</style>
