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
    ></p>

    <div class="trashIcon" :class="{ hovering: isTrashHover, active: isTrashActive }" @mouseenter="isTrashHover = true" @mouseleave="isTrashHover = false" @click="isTrashActive = !isTrashActive">
      <img :src="(isTrashHover || isTrashActive) ? trashRed : trash" alt="Supprimer" />
    </div>

    <div class="dottedSeparator"></div>
 
    <AddImage class="addImage"/>

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
  texteBouton?: string;
}

const props = withDefaults(defineProps<Props>(), {
  titre: "Titre du Bloc Éditable",
  description: "Ceci est la description du bloc.",
  texteBouton: "Cliquer ici"
});
const isTrashHover = ref(false)
const isTrashActive = ref(false)

const welcomeText = ref("Bienvenue. Sélectionnez ce bloc pour l'éditer.")
const onWelcomeInput = (e: Event) => {
  const el = e.target as HTMLElement
  welcomeText.value = (el.textContent || '').trimStart()
}

const welcomeEl = ref<HTMLElement | null>(null)
onMounted(() => {
  if (welcomeEl.value && !welcomeEl.value.textContent) {
    welcomeEl.value.textContent = welcomeText.value
  }
})

</script>


<style scoped>
.editableBlock {
  position: relative;
  width: 1000px;
  height: 160px;
  border: 3px solid #DC2626;
  border-radius: 5px;
  padding: 15px;
  background-color: #ffffff;
  box-sizing: border-box;
}

.welcomeText {
  position: absolute;
  left: 50px;
  top: 25px;
  font-size: 14px;
  color: #000000;
  margin: 0;
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
  top: 72px;
  width: 900px;
  height: 2px;
  opacity: 0.3;
  z-index: 2;
  border: none;
  background-image: radial-gradient(circle, #000000 3px, transparent 1px);
  background-size: 8px 8px;
  background-repeat: repeat-x;
  background-position: 0 50%;
}

.addImage {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 6px;
  width: 900px;
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
</style>