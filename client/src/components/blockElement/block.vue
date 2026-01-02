<template>
  <div class="editableBlock" :class="{ active: props.active }" @click="emit('select')">
    <div class="editableText">
      <p
        class="welcomeText"
        :class="{ isEmpty: isWelcomeEmpty }"
        contenteditable="true"
        aria-label="Texte de bienvenue"
        dir="ltr"
        ref="welcomeEl"
        @focus="onFocusEditable"
        @click="onSelectionActivity"
        @keyup="onSelectionActivity"
        @mouseup="onSelectionActivity"
        @input="onWelcomeInput"
        @keydown.enter.prevent
        data-placeholder="Sélectionnez ce bloc pour l'éditer.">
      </p>
    </div>

    <div class="textZonesSection" v-if="textZones.length > 0">
      <div class="textZone" v-for="(zone, index) in textZones" :key="index">
        <p 
          class="textZoneContent"
          :class="{ isEmpty: textZoneEmpty[index] ?? (!zone || zone.trim() === '') }"
          contenteditable="true"
          dir="ltr"
          :ref="(el) => setTextZoneRef(el, index)"
          @input="updateTextZone(index, $event)"
          @click="onSelectionActivity"
          @keyup="onSelectionActivity"
          @mouseup="onSelectionActivity"
          data-placeholder="Nouvelle zone de texte">
        </p>
        <button class="removeTextZoneButton" @click.stop="removeTextZone(index)" title="Remove text zone">
          <img :src="trashRed" alt="Remove" />
        </button>
      </div>
    </div>

    <div v-if="props.canDelete !== false" class="trashIcon" :class="{ hovering: isTrashHover, active: isTrashActive }" @mouseenter="isTrashHover = true" @mouseleave="isTrashHover = false" @click="onDelete">
      <img :src="(isTrashHover || isTrashActive) ? trashRed : trash" alt="Supprimer" />
    </div>

    <div class="dottedSeparator"></div>

    <div class="imageSection">
      <div class="imagesContainer" v-if="images.length > 0">
        <div class="imageItem" v-for="(image, index) in images" :key="index">
          <img :src="image" alt="Illustration ajoutée" class="blockImage" />
          <div class="removeImageIcon" @click="removeImage(index)">
            <img :src="trashRed" alt="Supprimer" />
          </div>
        </div>
      </div>
  
      <div class="addImage" @click="triggerFileInput">
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/*" 
          style="display: none"
          @change="handleImageSelect"
        />
        <div class="addImageLogo">
          <img src="../../assets/blockImage/imageIcon.svg" alt="Add" />
        </div>
        <p class="addImageText">Ajouter une image</p>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">

import { ref, onMounted, watch, computed } from 'vue'
import { useTextFormatStore } from '../../stores/textFormatStore'
import { useBlocksStore } from '../../stores/blockStores'
import trash from '../../assets/blockImage/trash.svg'
import trashRed from '../../assets/blockImage/trashRed.svg'

interface Props {
  titre?: string;
  description?: string;
  active? : boolean;
  canDelete?: boolean;
  blockIndex?: number;
}

const emit = defineEmits<{
  (e: 'modified', value: boolean): void;
  (e: 'select'): void;
  (e: 'delete'): void;
  (e: 'update:description', value: string): void;
  (e: 'update:images', value: string[]): void;
}>();

const props = defineProps<Props>();
const isTrashHover = ref(false)
const isTrashActive = ref(false)
const images = ref<string[]>([])
const isWelcomeEmpty = ref(true)
const fileInput = ref<HTMLInputElement | null>(null)
const textFormatStore = useTextFormatStore()
const blocksStore = useBlocksStore()

const welcomeText = ref(props.description || '')
const textZones = computed(() => {
  if (props.blockIndex === undefined) return []
  const block = blocksStore.blocks[props.blockIndex]
  return block?.textZones || []
})
const textZoneRefs = ref<Array<HTMLElement | null>>([])
const textZoneEmpty = ref<boolean[]>([])

watch(textZones, (zones) => {
  zones.forEach((zone, idx) => {
    const el = textZoneRefs.value[idx]
    if (!el) return
    if (document.activeElement === el) return
    const current = el.textContent ?? ''
    const next = zone ?? ''
    if (current !== next) el.textContent = next
    textZoneEmpty.value[idx] = (next.trim?.() ?? '').length === 0
  })
  textZoneEmpty.value = zones.map((z) => (z?.trim?.() ?? '').length === 0)
}, { deep: true })

const onWelcomeInput = (e: Event) => {
  const el = e.target as HTMLElement
  welcomeText.value = (el.textContent || '').trim()

  const isModified = welcomeText.value.length > 0
  isWelcomeEmpty.value = welcomeText.value.length === 0
  emit('modified', isModified)
  emit('update:description', welcomeText.value)
  textFormatStore.saveSelection()
  textFormatStore.updateStatesFromCommand()
}

const welcomeEl = ref<HTMLElement | null>(null)
onMounted(() => {
  if (welcomeEl.value && props.description) {
    welcomeEl.value.textContent = props.description
    isWelcomeEmpty.value = false
  } else {
    isWelcomeEmpty.value = true
  }
  if (welcomeEl.value) {
    textFormatStore.setActiveEl(welcomeEl.value)
  }
})

function onFocusEditable() {
  emit('select')
  if (welcomeEl.value) textFormatStore.setActiveEl(welcomeEl.value)
  textFormatStore.saveSelection()
  textFormatStore.updateStatesFromCommand()
}

function onSelectionActivity() {
  textFormatStore.saveSelection()
  textFormatStore.updateStatesFromCommand()
}

const handleImageSelected = (imageData: string) => {
  images.value.push(imageData)
  emit('modified', true)
  emit('update:images', images.value)
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
  emit('update:images', images.value)
}

function updateTextZone(index: number, event: Event) {
  if (props.blockIndex === undefined) return
  const block = blocksStore.blocks[props.blockIndex]
  if (!block) return
  const el = event.target as HTMLElement
  const content = el.textContent || ''
  if (block.textZones) {
    block.textZones[index] = content
  }
  textZoneEmpty.value[index] = content.trim().length === 0
}

const setTextZoneRef = (el: any, index: number) => {
  const htmlEl = (el?.$el ?? el) as HTMLElement | null
  textZoneRefs.value[index] = htmlEl
  if (htmlEl && textZones.value[index] !== undefined) {
    const next = textZones.value[index] ?? ''
    if ((htmlEl.textContent ?? '') !== next) htmlEl.textContent = next
    textZoneEmpty.value[index] = next.trim().length === 0
  }
}

function removeTextZone(index: number) {
  if (props.blockIndex === undefined) return
  const block = blocksStore.blocks[props.blockIndex]
  if (!block) return
  if (block.textZones) {
    block.textZones.splice(index, 1)
  }
  textZoneRefs.value.splice(index, 1)
  textZoneEmpty.value.splice(index, 1)
}

function onDelete() {
  emit('delete')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input?.files
  
  if (!files || files.length === 0) {
    console.warn('Aucun fichier sélectionné')
    return
  }

  const file = files[0]
  
  if (!file) {
    console.error('Erreur lors de la récupération du fichier')
    return
  }

  if (!file.type.startsWith('image/')) {
    console.error('Veuillez sélectionner une image')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const imageData = e.target?.result
    if (!imageData || typeof imageData !== 'string') {
      console.error('Erreur lors de la lecture du fichier')
      return
    }
    emit('update:images', [...images.value, imageData])
    images.value.push(imageData)
    emit('modified', true)
    input.value = ''
  }
  reader.readAsDataURL(file)
}

</script>


<style scoped>
.editableBlock {
  position: relative;
  width: 1000px;
  border: 3px solid #C6C6C6;
  border-radius: 5px;
  background-color: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0px 15px 0px;
}

.editableBlock.active {
  border-color: #DC2626;
}

.editableText {
  display: flex;
  align-items: center;
  width: 900px;
  min-height: 44px;
  background-color: #ffffff;
  padding: 0;
  margin: 0;
}

.welcomeText {
  font-size: 14px;
  color: #000000;
  margin: 0;
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  max-width: 900px;
}

.welcomeText.isEmpty[contenteditable="true"]::before {
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
  display :flex;
  align-items: flex-start;
  width: 900px;
  height: 2px;
  opacity: 0.4;
  z-index: 1;
  background-image: radial-gradient(circle, #000000 3px, transparent 1px);
  background-size: 8px 8px;
  background-repeat: repeat-x;
  background-position: 0 40%;
  margin : 13px 0px 13px 0px;
}

.textZonesSection {
  display: flex;
  flex-direction: column;
  width: 900px;
}

.textZone {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  min-height: 44px;
}

.textZoneContent {
  flex: 1;
  font-size: 14px;
  color: #000000;
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  text-align: left;
  margin-right: 40px;;
}

.textZoneContent.isEmpty[contenteditable="true"]::before {
  content: attr(data-placeholder);
  color: #9e9e9e;
  opacity: 0.8;
}

.removeTextZoneButton {
  position: absolute;
  right: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, filter 0.2s ease, background-color 0.16s ease;
  border: none;
  background: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.removeTextZoneButton img {
  width: 20px;
  height: 20px;
}

.textZone:hover .removeTextZoneButton {
  opacity: 0.5;
}

.removeTextZoneButton:hover {
  opacity: 1 !important;
  background: #E0E0E0;
  border-radius: 4px;
}

.addImage {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 900px;
  height: 68px;
  z-index: 1;
  flex-direction: column;
  border: 2px dashed transparent;
  background-color: transparent;
  border-radius: 8px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.addImageText {
  font-size: 16px;
  color: #000000;
  opacity: 0.5;
  margin: 0; 
  margin-top: 4px;
  transition: all 0.3s ease;
}

.addImageLogo img {
  width: 18px;
  height: 18px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.imageSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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
  background-color: #ffffff;
  width : 900px;
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
